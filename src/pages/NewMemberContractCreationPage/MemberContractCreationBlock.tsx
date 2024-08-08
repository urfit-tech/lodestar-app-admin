import { gql, useMutation } from '@apollo/client'
import { Alert, Button, message } from 'antd'
import { FormInstance } from 'antd/lib/form'
import moment from 'moment'
import { sum } from 'ramda'
import { useState } from 'react'
import styled from 'styled-components'
import { ContractInfo, FieldProps } from '.'
import hasura from '../../hasura'

const StyledOrder = styled.div`
  border: 1px solid var(--gray-darker);
  padding: 1rem;
`

const MemberContractCreationBlock: React.FC<{
  member: NonNullable<ContractInfo['member']>
  selectedProducts: NonNullable<FieldProps['products']>
  form: FormInstance<FieldProps>
  products: ContractInfo['products']
}> = ({ member, form, selectedProducts, products }) => {
  const [addMemberContract] = useMutation<hasura.CREATE_MEMBER_CONTRACT, hasura.CREATE_MEMBER_CONTRACTVariables>(
    CREATE_MEMBER_CONTRACT,
  )
  const [memberContractUrl, setMemberContractUrl] = useState('')

  const fieldValue = form.getFieldsValue()

  const totalPrice = sum(selectedProducts.map(product => product.totalPrice))

  const handleMemberContractCreate = async () => {
    if (!fieldValue.contractId) {
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
    if (!fieldValue.startedAt) {
      message.warn('請選擇開始時間')
      return
    }
    if (!fieldValue.endedAt) {
      message.warn('請選擇結束時間')
      return
    }

    if (!window.confirm('請確認合約是否正確？')) {
      return
    }

    const times = '0'
    const orderId = moment().format('YYYYMMDDHHmmssSSS') + times.padStart(2, '0')

    addMemberContract({
      variables: {
        memberId: member.id,
        contractId: fieldValue.contractId,
        startedAt: moment(fieldValue.startedAt).add(1, 'days'),
        endedAt: fieldValue.endedAt,
        authorId: fieldValue.executorId,
        values: {
          memberId: member.id,
          invoice: {
            name: member.name,
            email: member.email,
            skipIssueInvoice: fieldValue.paymentMode === '暫收款後開發票',
          },
          price: totalPrice,
          orderId,
          orderOptions: {
            recognizePerformance: totalPrice,
          },
          orderProducts: selectedProducts.map(v => {
            const p = products.find(p => p.id === v.id)
            return {
              name: p?.title,
              price: v.totalPrice,
              started_at: moment(fieldValue.startedAt).add(1, 'days'),
              ended_at: fieldValue.endedAt,
              product_id: p?.productId,
              options: { quantity: v.amount },
              delivered_at: new Date(),
            }
          }),
          paymentOptions: {
            paymentGateway: fieldValue.paymentMethod.includes('藍新') ? 'spgateway' : 'physical',
            paymentMethod:
              fieldValue.paymentMethod === '藍新-信用卡'
                ? 'credit'
                : fieldValue.paymentMethod === '藍新-匯款'
                ? 'vacc'
                : fieldValue.paymentMethod === '現金'
                ? 'cash'
                : fieldValue.paymentMethod === '銀行匯款'
                ? 'bankTransfer'
                : fieldValue.paymentMethod === '遠刷'
                ? 'physicalRemoteCredit'
                : fieldValue.paymentMethod === '手刷'
                ? 'physicalCredit'
                : 'unknown',
            paymentMode: fieldValue.paymentMode,
            installmentPlans:
              fieldValue.paymentMode === '訂金+尾款'
                ? [
                    { price: Math.ceil(totalPrice * 0.1), index: 0 },
                    { price: totalPrice - Math.ceil(totalPrice * 0.1), index: 1 },
                  ]
                : undefined,
          },
          totalCount: selectedProducts.reduce((sum, product) => sum + product.amount, 0),
        },
        options: { company: fieldValue.company },
      },
    })
      .then(({ data }) => {
        const contractId = data?.insert_member_contract_one?.id
        setMemberContractUrl(`${window.origin}/members/${member.id}/contracts/${contractId}`)
        message.success('成功產生合約')
      })
      .catch(err => message.error(`產生合約失敗，請確認資料是否正確。錯誤代碼：${err}`))
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
        <Alert message="合約連結" description={memberContractUrl} type="success" showIcon />
      ) : (
        <Button size="large" block type="primary" onClick={handleMemberContractCreate}>
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
