import { gql, useMutation } from '@apollo/client'
import { Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import axios from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { sum } from 'ramda'
import { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { ContractInfo, ContractSales, FieldProps } from '.'
import { InvoiceRequest } from '../../components/sale/InvoiceCard'
import hasura from '../../hasura'
import { useMutateMemberProperty, useProperty } from '../../hooks/member'
import pageMessages from '../translation'
import { PaymentCompany } from './MemberContractCreationForm'

const StyledOrder = styled.div`
  border: 1px solid var(--gray-darker);
  padding: 1rem;
`

const MemberContractCreationBlock: React.FC<{
  member: NonNullable<ContractInfo['member']>
  selectedProducts: NonNullable<FieldProps['products']>
  form: FormInstance<FieldProps>
  contracts: ContractInfo['contracts']
  installments: { price: number; index: number }[]
  sales: ContractSales['sales']
  isMemberTypeBG: boolean
  isMemberZeroTax: boolean
  isAccountReceivableAvailable: boolean
}> = ({
  member,
  form,
  selectedProducts,
  contracts,
  installments,
  sales,
  isMemberTypeBG,
  isMemberZeroTax,
  isAccountReceivableAvailable,
}) => {
  const { settings, enabledModules } = useApp()
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const [addMemberContract] = useMutation<hasura.CREATE_MEMBER_CONTRACT, hasura.CREATE_MEMBER_CONTRACTVariables>(
    CREATE_MEMBER_CONTRACT,
  )
  const { updateMemberProperty } = useMutateMemberProperty()
  const { properties } = useProperty()
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  const fieldValue = form.getFieldsValue()

  const customSetting: { paymentCompanies: PaymentCompany[] } = JSON.parse(settings['custom'] || '{}')

  const paymentCompany =
    customSetting.paymentCompanies
      ?.find(c => !!c.companies.find(company => company.name === fieldValue.company))
      ?.companies.find(company => company.name === fieldValue.company) || null

  const actualIsMemberZeroTax = useMemo(() => {
    const currentZeroTaxValue = member.properties.find(p => p.name === '是否零稅')?.value
    return currentZeroTaxValue === '是' ? true : isMemberZeroTax
  }, [member.properties, isMemberZeroTax])

  const invoiceCalculation = useMemo(() => {
    const category = fieldValue.uniformNumber ? 'B2B' : 'B2C'
    const totalPrice = sum(selectedProducts.map(product => product.totalPrice))
    const totalPriceWithTax = sum(
      selectedProducts.filter(p => !['學費', '註冊費'].includes(p.options.product)).map(product => product.totalPrice),
    )
    const totalPriceWithoutTax = actualIsMemberZeroTax ? 0 : Math.round(totalPriceWithTax / 1.05)
    const totalPriceWithFreeTax = actualIsMemberZeroTax
      ? sum(selectedProducts.map(product => product.totalPrice))
      : sum(
          selectedProducts
            .filter(p => !!['學費', '註冊費'].includes(p.options.product))
            .map(product => product.totalPrice),
        )
    const tax = totalPrice - totalPriceWithoutTax - totalPriceWithFreeTax

    const items = selectedProducts.map(p => {
      const taxType = actualIsMemberZeroTax ? '2' : ['學費', '註冊費'].includes(p.options.product) ? '3' : '1'
      const name = ['學費', '註冊費'].includes(p.options.product) ? p.options.language + p.options.product : p.title
      return p.options.program_type?.includes('套裝項目')
        ? {
            name,
            count: 1,
            unit: '件',
            price:
              category === 'B2B'
                ? taxType === '3' || taxType === '2'
                  ? p.totalPrice
                  : Math.round(p.totalPrice / 1.05)
                : p.totalPrice,
            taxType,
            amt:
              category === 'B2B'
                ? taxType === '3' || taxType === '2'
                  ? p.totalPrice
                  : Math.round(p.totalPrice / 1.05)
                : p.totalPrice,
          }
        : {
            name,
            count: p.amount,
            unit: '件',
            price:
              category === 'B2B'
                ? taxType === '3' || taxType === '2'
                  ? p.price
                  : Math.round(p.price / 1.05)
                : p.price,
            taxType,
            amt:
              p.amount *
              (category === 'B2B'
                ? taxType === '3' || taxType === '2'
                  ? p.price
                  : Math.round(p.price / 1.05)
                : p.price),
          }
    })

    let invoices: InvoiceRequest[] = []

    if (category === 'B2C') {
      const taxType = actualIsMemberZeroTax
        ? '2'
        : totalPriceWithFreeTax > 0 && totalPriceWithTax > 0
        ? '9'
        : totalPriceWithFreeTax > 0
        ? '3'
        : '1'
      const taxRate = taxType === '3' || taxType === '2' ? 0 : 5
      invoices.push({
        Amt: totalPriceWithoutTax + totalPriceWithFreeTax,
        ItemName: items.map(v => v.name).join('|'),
        ItemCount: items.map(v => v.count).join('|'),
        ItemUnit: items.map(v => v.unit).join('|'),
        ItemPrice: items.map(v => v.price).join('|'),
        ItemAmt: items.map(v => v.amt).join('|'),
        TaxType: taxType,
        TaxAmt: taxType === '3' || taxType === '2' ? 0 : tax,
        TotalAmt: totalPrice,
        TaxRate: taxRate,
        AmtSales: taxType === '9' ? totalPriceWithoutTax : undefined,
        AmtFree: taxType === '9' ? totalPriceWithFreeTax : undefined,
        AmtZero: taxType === '9' ? 0 : undefined,
        ItemTaxType: taxType === '9' ? items.map(v => v.taxType).join('|') : undefined,
        MerchantOrderNo: new Date().getTime().toString() + taxType,
        BuyerEmail: fieldValue.invoiceEmail || member.email,
        BuyerName: fieldValue.uniformTitle || member.name,
        BuyerUBN: fieldValue.uniformNumber,
        Category: category,
        Comment: fieldValue.invoiceComment,
        PrintFlag: 'Y',
      })
    }

    if (category === 'B2B') {
      if (totalPriceWithTax > 0) {
        const filteredItems = items.filter(v => v.taxType === '1')
        invoices.push({
          TaxType: '1',
          ItemName: filteredItems.map(v => v.name).join('|'),
          ItemCount: filteredItems.map(v => v.count).join('|'),
          ItemUnit: filteredItems.map(v => v.unit).join('|'),
          ItemPrice: filteredItems.map(v => v.price).join('|'),
          ItemAmt: filteredItems.map(v => v.amt).join('|'),
          Amt: totalPriceWithoutTax,
          TaxAmt: tax,
          TotalAmt: totalPrice - totalPriceWithFreeTax,
          TaxRate: 5,
          MerchantOrderNo: new Date().getTime().toString() + '1',
          BuyerEmail: fieldValue.invoiceEmail || member.email,
          BuyerName: fieldValue.uniformTitle,
          BuyerUBN: fieldValue.uniformNumber,
          Category: category,
          Comment: fieldValue.invoiceComment,
          PrintFlag: 'Y',
        })
      }

      if (totalPriceWithFreeTax > 0) {
        const filteredItems = items.filter(v => v.taxType === '3' || v.taxType === '2')
        invoices.push({
          TaxType: '3',
          Amt: totalPriceWithFreeTax,
          ItemName: filteredItems.map(v => v.name).join('|'),
          ItemCount: filteredItems.map(v => v.count).join('|'),
          ItemUnit: filteredItems.map(v => v.unit).join('|'),
          ItemPrice: filteredItems.map(v => v.price).join('|'),
          ItemAmt: filteredItems.map(v => v.amt).join('|'),
          TaxAmt: 0,
          TotalAmt: totalPriceWithFreeTax,
          TaxRate: 0,
          MerchantOrderNo: new Date().getTime().toString() + '3',
          BuyerEmail: fieldValue.invoiceEmail || member.email,
          BuyerName: fieldValue.uniformTitle,
          BuyerUBN: fieldValue.uniformNumber,
          Category: category,
          Comment: fieldValue.invoiceComment,
          PrintFlag: 'Y',
        })
      }
    }

    return {
      invoices,
      totalPrice,
      totalPriceWithTax,
      totalPriceWithoutTax,
      totalPriceWithFreeTax,
      tax,
      items,
      category,
    }
  }, [selectedProducts, fieldValue, member.email, member.name, actualIsMemberZeroTax])

  const handleMemberContractCreate = async () => {
    const memberType = member.properties.find(p => p.name === '會員類型')?.value
    if (fieldValue.accountReceivable && (!memberType || !isAccountReceivableAvailable)) {
      return message.warn('此會員無法使用應收帳款')
    }
    const isContract =
      !isMemberTypeBG &&
      selectedProducts.filter(
        p =>
          p.productId.includes('AppointmentPlan_') &&
          ((p.options.language === '師資班' && !member.agreedAndUnexpiredContracts.find(c => c.type === 'teacher')) ||
            (p.options.language !== '師資班' && !member.agreedAndUnexpiredContracts.find(c => c.type === 'normal'))),
      ).length > 0
    if (isContract && !fieldValue.contractId) {
      message.warn('請選擇合約')
      return
    }
    if (!fieldValue.executorId) {
      message.warn('請選擇執行人員')
      return
    }
    if (!fieldValue.paymentMethod) {
      message.warn('請選擇結帳管道')
      return
    }
    if (!fieldValue.invoiceEmail) {
      message.warn('請填寫發票收件人信箱')
      return
    }
    if (!!fieldValue.uniformNumber && fieldValue.uniformNumber.length !== 8) {
      message.warn('統一編號格式錯誤')
      return
    }
    if (!!fieldValue.uniformNumber && !fieldValue.uniformTitle) {
      message.warn('若有填寫統一編號，請填寫公司名稱')
      return
    }
    if (!fieldValue.paymentMode) {
      message.warn('請選擇付款模式')
      return
    }
    if (!fieldValue.company) {
      message.warn('請選擇結帳公司')
      return
    }
    if (selectedProducts.length === 0) {
      message.warn('請選擇至少一種產品')
      return
    }
    if (isContract && !fieldValue.startedAt) {
      message.warn('請選擇開始時間')
      return
    }
    if (isContract && !fieldValue.endedAt) {
      message.warn('請選擇結束時間')
      return
    }

    if (fieldValue.paymentMethod === '藍新' && fieldValue.company.includes('基金會')) {
      message.warn(`${fieldValue.company}不支援藍新付款`)
      return
    }

    if (
      ['先上課後月結固定金額', '課前頭款+自訂分期', '開課後自訂分期'].includes(fieldValue.paymentMode) &&
      installments.length > 1 &&
      selectedProducts.reduce((sum, product) => sum + product.totalPrice, 0) !== sum(installments.map(v => v.price))
    ) {
      message.warn('請確認分期總金額是否正確')
      return
    }

    if (!window.confirm('請確認合約是否正確？')) {
      return
    }

    // 檢查並更新零稅屬性（如果需要）
    const zeroTaxPropertyId = properties.find(p => p.name === '是否零稅')?.id
    const currentZeroTaxValue = member.properties.find(p => p.name === '是否零稅')?.value

    let finalIsMemberZeroTax = actualIsMemberZeroTax

    if (zeroTaxPropertyId && !currentZeroTaxValue) {
      await updateMemberProperty({
        variables: {
          memberProperties: [
            {
              member_id: member.id,
              property_id: zeroTaxPropertyId,
              value: '否',
            },
          ],
        },
      })
      finalIsMemberZeroTax = false
    }

    // 重新計算發票資訊（使用最終的零稅狀態）
    const { invoices, totalPrice } = invoiceCalculation

    const paymentGateway = fieldValue.paymentMethod.includes('藍新')
      ? paymentCompany?.paymentGateway || 'spgateway'
      : 'physical'
    const paymentMethod =
      fieldValue.paymentMethod === '現金'
        ? 'cash'
        : fieldValue.paymentMethod === '銀行匯款'
        ? 'bankTransfer'
        : fieldValue.paymentMethod === '實體刷卡'
        ? 'physicalCredit'
        : fieldValue.paymentMethod === '遠端輸入卡號'
        ? 'physicalRemoteCredit'
        : undefined

    const installmentPlans = ['先上課後月結固定金額', '課前頭款+自訂分期', '開課後自訂分期'].includes(
      fieldValue.paymentMode,
    )
      ? installments
      : undefined
    const paymentMode = fieldValue.paymentMode

    const invoiceInfo = {
      name: member.name,
      email: fieldValue.invoiceEmail || member.email,
      skipIssueInvoice: fieldValue.skipIssueInvoice,
      isMemberZeroTaxProperty: finalIsMemberZeroTax ? '是' : '否',
      uniformNumber: fieldValue.uniformNumber,
      uniformTitle: fieldValue.uniformTitle,
      invoiceComment: fieldValue.invoiceComment,
      invoiceGateway: paymentCompany?.invoiceGateway,
      invoiceGatewayId: paymentCompany?.invoiceGatewayId,
      invoices,
    }
    const options = {
      ...fieldValue,
      language: fieldValue.language
        ? fieldValue.language
        : contracts.find(c => c.id === fieldValue.contractId)?.options?.language || 'zh-tw',
      isBG: isMemberTypeBG,
      executor: sales.find(s => s.id === fieldValue.executorId),
    }

    const paymentOptions = {
      paymentGateway,
      paymentMethod,
      paymentMode,
      installmentPlans,
    }
    setLoading(true)
    let memberContractId

    if (isContract) {
      try {
        const addMemberContractResult = await addMemberContract({
          variables: {
            memberId: member.id,
            contractId: fieldValue.contractId,
            startedAt: moment(fieldValue.startedAt).add(1, 'days'),
            endedAt: fieldValue.endedAt,
            authorId: fieldValue.executorId,
            values: {
              memberId: member.id,
              invoice: invoiceInfo,
              price: totalPrice,
              orderProducts: selectedProducts.map(v => {
                return {
                  name: v.title,
                  price: v.price,
                  totalPrice: v.totalPrice,
                  started_at: moment(fieldValue.startedAt).add(1, 'days'),
                  ended_at: fieldValue.endedAt,
                  product_id: v.productId,
                  options: { quantity: v.amount, ...v.options },
                  delivered_at: new Date(),
                }
              }),
              paymentOptions,
              maxLeaveDays: Math.ceil(
                selectedProducts
                  .filter(p => p.productId.includes('AppointmentPlan_'))
                  .reduce((sum, product) => sum + product.amount, 0) * 0.1,
              ),
              options,
              paymentDueDate: fieldValue.paymentDueDate,
            },
          },
        })
        memberContractId = addMemberContractResult.data?.insert_member_contract_one?.id
        message.success(formatMessage(pageMessages.MemberContractCreationBlock.contractCreateSuccess))
      } catch (error) {
        message.error(`${formatMessage(pageMessages.MemberContractCreationBlock.contractCreateFail)}${error}`)
      } finally {
        setLoading(false)
      }
    }
    let productOptions: { [key: string]: any } = {}

    selectedProducts.forEach(p => {
      productOptions[p.productId] = { ...p, isContract: true, quantity: p.amount }
    })

    const isReceivable = enabledModules.account_receivable && fieldValue.accountReceivable
    const isPaidByCashWithInvoiceAutoIssued = paymentMethod === 'cash' && !fieldValue.skipIssueInvoice && !isReceivable

    const isOrderSetSuccessByDefault = isPaidByCashWithInvoiceAutoIssued
    const isPaymentSetSuccessByDefault = isPaidByCashWithInvoiceAutoIssued
    const isOrderProductsDeliveredByDefault = isPaidByCashWithInvoiceAutoIssued || isReceivable
    const expiredAt = moment(fieldValue.paymentDueDate).toDate()

    await axios
      .post(
        `${process.env.REACT_APP_API_BASE_ROOT}/order/create`,
        {
          paymentModel: { type: 'perpetual', gateway: paymentGateway, method: paymentMethod },
          productIds: selectedProducts.map(v => v.productId),
          invoice: invoiceInfo,
          memberId: member.id,
          invoiceGatewayId: paymentCompany?.invoiceGatewayId,
          skipPayForm: true,
          options: {
            ...options,
            ...productOptions,
            installmentPlans,
            paymentMode,
            memberContractId,
          },
          status: 'UNPAID',
          isOrderSetSuccessByDefault,
          isPaymentSetSuccessByDefault,
          isOrderProductsDeliveredByDefault,
          expiredAt: expiredAt,
        },
        {
          headers: {
            authorization: `Bearer ${authToken}`,
          },
        },
      )
      .then(res => {
        if (res.data.code === 'SUCCESS') {
          message.success(`訂單建立成功: ${res.data.result.orderId}`)
          history.push(`/members/${member.id}/order`)

          const uniformNumberPropertyId = properties.find(p => p.name === '統一編號')?.id
          const uniformTitlePropertyId = properties.find(p => p.name === '發票抬頭')?.id

          const memberUniformProperty = []

          if (uniformNumberPropertyId && fieldValue.uniformNumber) {
            memberUniformProperty.push({
              member_id: member.id,
              property_id: uniformNumberPropertyId,
              value: fieldValue.uniformNumber,
            })
          }

          if (uniformTitlePropertyId && fieldValue.uniformTitle) {
            memberUniformProperty.push({
              member_id: member.id,
              property_id: uniformTitlePropertyId,
              value: fieldValue.uniformTitle,
            })
          }

          if (memberUniformProperty.length > 0) {
            updateMemberProperty({
              variables: {
                memberProperties: memberUniformProperty,
              },
            })
          }
        }
      })
      .catch(error => {
        console.error(error)
        message.error(formatMessage(pageMessages.MemberContractCreationBlock.orderCreateFail))
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const { invoices, totalPrice } = invoiceCalculation

  return (
    <>
      <StyledOrder className="mb-5">
        {fieldValue.paymentMode?.includes('訂金') && (
          <>
            <div className="row mb-2">
              <div className="col-9 text-right">{formatMessage(pageMessages.MemberContractCreationBlock.deposit)}</div>

              <div className="col-3 text-right">${(totalPrice * 0.1).toLocaleString()}</div>
            </div>
            <div className="row mb-2">
              <div className="col-9 text-right">
                {formatMessage(pageMessages.MemberContractCreationBlock.finalPayment)}
              </div>

              <div className="col-3 text-right">${(totalPrice - totalPrice * 0.1).toLocaleString()}</div>
            </div>
            <div style={{ borderBottom: '1px dashed #4f4f4f', margin: '12px 0' }} />
          </>
        )}

        {invoices.map(i => (
          <div key={i.TaxType}>
            <div className="row mb-2">
              <strong className="col-6 text-right">
                {actualIsMemberZeroTax
                  ? '零稅'
                  : i.TaxType === '9'
                  ? '混稅'
                  : i.TaxType === '2'
                  ? '零稅'
                  : i.TaxType === '3'
                  ? '免稅'
                  : '應稅'}
              </strong>

              <div className="col-6 text-right">${i.Amt.toLocaleString()}</div>
            </div>
            <div className="row mb-2">
              <strong className="col-6 text-right">
                {formatMessage(pageMessages.MemberContractCreationBlock.tax)}
              </strong>

              <div className="col-6 text-right">${i.TaxAmt.toLocaleString()}</div>
            </div>
            <div style={{ borderBottom: '1px dashed #4f4f4f', margin: '12px 0' }} />
          </div>
        ))}
        <div className="row mb-2">
          <strong className="col-6 text-right">
            {formatMessage(pageMessages.MemberContractCreationBlock.totalAmountWithTax)}
          </strong>

          <div className="col-6 text-right">${totalPrice.toLocaleString()}</div>
        </div>
      </StyledOrder>

      <Button size="large" block type="primary" loading={loading} onClick={handleMemberContractCreate}>
        {formatMessage(pageMessages.MemberContractCreationBlock.generateContract)}
      </Button>
    </>
  )
}

const CREATE_MEMBER_CONTRACT = gql`
  mutation CREATE_MEMBER_CONTRACT(
    $memberId: String!
    $authorId: String!
    $contractId: uuid!
    $startedAt: timestamptz!
    $endedAt: timestamptz!
    $values: jsonb!
    $options: jsonb
  ) {
    insert_member_contract_one(
      object: {
        member_id: $memberId
        contract_id: $contractId
        author_id: $authorId
        started_at: $startedAt
        ended_at: $endedAt
        values: $values
        options: $options
      }
    ) {
      id
    }
  }
`

export default MemberContractCreationBlock
