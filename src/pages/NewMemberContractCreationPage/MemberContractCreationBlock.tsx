import { CopyOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Alert, Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import axios from 'axios'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment'
import { sum } from 'ramda'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { ContractInfo, ContractProduct, FieldProps } from '.'
import hasura from '../../hasura'
import { copyToClipboard } from '../../helpers'
import { commonMessages } from '../../helpers/translation'

const StyledOrder = styled.div`
  border: 1px solid var(--gray-darker);
  padding: 1rem;
`

const MemberContractCreationBlock: React.FC<{
  member: NonNullable<ContractInfo['member']>
  selectedProducts: NonNullable<FieldProps['products']>
  form: FormInstance<FieldProps>
  products: ContractProduct['products']
  contracts: ContractInfo['contracts']
  installments: { price: number; index: number }[]
}> = ({ member, form, selectedProducts, products, contracts, installments }) => {
  const { authToken } = useAuth()
  const { formatMessage } = useIntl()
  const [addMemberContract] = useMutation<hasura.CREATE_MEMBER_CONTRACT, hasura.CREATE_MEMBER_CONTRACTVariables>(
    CREATE_MEMBER_CONTRACT,
  )
  const [memberContractUrl, setMemberContractUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [isFinish, setIsFinish] = useState(false)

  const fieldValue = form.getFieldsValue()

  const totalPrice = sum(selectedProducts.map(product => product.totalPrice))

  const handleMemberContractCreate = async () => {
    const isContract = !member.isBG && selectedProducts.some(product => product.productId.includes('AppointmentPlan_'))
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
    if (!!fieldValue.unifiedNumber && fieldValue.unifiedNumber.length !== 8) {
      message.warn('統一編號格式錯誤')
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
    const invoiceInfo = {
      name: member.name,
      email: member.email,
      skipIssueInvoice: fieldValue.skipIssueInvoice,
      unifiedNumber: fieldValue.unifiedNumber,
      invoiceComment: fieldValue.invoiceComment,
    }
    const paymentGateway = fieldValue.paymentMethod.includes('藍新') ? 'spgateway' : 'physical'
    const paymentMethod =
      fieldValue.paymentMethod === '現金'
        ? 'cash'
        : fieldValue.paymentMethod === '銀行匯款'
        ? 'bankTransfer'
        : fieldValue.paymentMethod === '實體刷卡'
        ? 'physicalCredit'
        : undefined

    const options = {
      company: fieldValue.company,
      language: contracts.find(c => c.id === fieldValue.contractId)?.options?.language || 'zh-tw',
      contractId: fieldValue.contractId,
      isBG: member.isBG,
      executorId: fieldValue.executorId,
    }
    const installmentPlans =
      fieldValue.paymentMode === '訂金+尾款'
        ? [
            { price: Math.ceil(totalPrice * 0.1), index: 0 },
            { price: totalPrice - Math.ceil(totalPrice * 0.1), index: 1 },
          ]
        : ['先上課後月結固定金額', '課前頭款+自訂分期', '開課後自訂分期'].includes(fieldValue.paymentMode)
        ? installments
        : undefined

    const paymentMode = fieldValue.paymentMode
    setLoading(true)
    if (isContract) {
      addMemberContract({
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
                price: v.totalPrice,
                started_at: moment(fieldValue.startedAt).add(1, 'days'),
                ended_at: fieldValue.endedAt,
                product_id: v.productId,
                options: { quantity: v.amount, ...v.options },
                delivered_at: new Date(),
              }
            }),
            paymentOptions: {
              paymentGateway,
              paymentMethod,
              paymentMode,
              installmentPlans,
            },
            maxLeaveDays: Math.ceil(
              selectedProducts
                .filter(p => p.productId.includes('AppointmentPlan_'))
                .reduce((sum, product) => sum + product.amount, 0) * 0.1,
            ),
            options,
          },
        },
      })
        .then(({ data }) => {
          const contractId = data?.insert_member_contract_one?.id
          setMemberContractUrl(`${window.origin}/members/${member.id}/contracts/${contractId}`)
          message.success('成功產生合約')
        })
        .catch(err => message.error(`產生合約失敗，請確認資料是否正確。錯誤代碼：${err}`))
        .finally(() => setLoading(false))
    } else {
      let productOptions: { [key: string]: any } = {}

      selectedProducts.forEach(p => {
        productOptions[p.productId] = { ...p, isContract: true, quantity: p.amount }
      })
      await axios
        .post(
          `${process.env.REACT_APP_API_BASE_ROOT}/order/create`,
          {
            paymentModel: { type: 'perpetual', gateway: paymentGateway, method: paymentMethod },
            productIds: selectedProducts.map(v => v.productId),
            invoice: invoiceInfo,
            memberId: member.id,
            options: {
              ...options,
              ...productOptions,
              installmentPlans,
              paymentMode,
            },
          },
          {
            headers: { authorization: `Bearer ${authToken}` },
          },
        )
        .then(res => {
          if (res.data.code === 'SUCCESS') {
            message.success('訂單建立成功')
            const paymentNo = res.data.result.paymentNo
            const payToken = res.data.result.payToken
            const orderId = res.data.result.orderId
            if (paymentGateway === 'spgateway' && orderId) {
              setMemberContractUrl(
                paymentNo
                  ? `${window.origin}/payments/${paymentNo}?token=${payToken}`
                  : `${window.origin}/orders/${orderId}?tracking=1`,
              )
            }
            if (paymentGateway === 'physical' && paymentMethod === 'bankTransfer' && orderId) {
              setMemberContractUrl(
                paymentNo
                  ? `${window.origin}/payments/${paymentNo}?method=${paymentMethod}`
                  : `${window.origin}/orders/${orderId}?tracking=1`,
              )
            }
          }
        })
        .catch(error => {
          console.log(error)
          message.error('訂單建立失敗')
        })
        .finally(() => {
          setLoading(false)
          setIsFinish(true)
        })
    }
  }

  return (
    <>
      <StyledOrder className="mb-5">
        {fieldValue.paymentMode?.includes('訂金') && (
          <>
            <div className="row mb-2">
              <div className="col-9 text-right">訂金</div>

              <div className="col-3 text-right">${(totalPrice * 0.1).toLocaleString()}</div>
            </div>
            <div className="row mb-2">
              <div className="col-9 text-right">尾款</div>

              <div className="col-3 text-right">${(totalPrice - totalPrice * 0.1).toLocaleString()}</div>
            </div>
          </>
        )}
        <div className="row mb-2">
          <strong className="col-6 text-right">合計</strong>

          <div className="col-6 text-right">${totalPrice.toLocaleString()}</div>
        </div>
      </StyledOrder>

      {memberContractUrl ? (
        <>
          <Button
            size="middle"
            type="primary"
            icon={<CopyOutlined />}
            className="mt-3"
            onClick={() => {
              copyToClipboard(memberContractUrl)
              message.success(formatMessage(commonMessages.text.copiedToClipboard))
            }}
          >
            複製連結
          </Button>
          <Alert message="合約/訂單連結已建立" type="success" showIcon />
        </>
      ) : isFinish ? (
        <Alert message="合約/訂單連結已建立" type="success" showIcon />
      ) : (
        <Button size="large" block type="primary" loading={loading} onClick={handleMemberContractCreate}>
          產生合約
        </Button>
      )}
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
