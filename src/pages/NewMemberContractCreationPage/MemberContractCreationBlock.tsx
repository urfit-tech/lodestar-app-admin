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
  contracts: ContractInfo['contracts']
  selectedProducts: NonNullable<FieldProps['products']>
  form: FormInstance<FieldProps>
}> = ({ member, form, selectedProducts }) => {
  const [addMemberContract] = useMutation<hasura.CREATE_MEMBER_CONTRACT, hasura.CREATE_MEMBER_CONTRACTVariables>(
    CREATE_MEMBER_CONTRACT,
  )
  const [memberContractUrl, setMemberContractUrl] = useState('')

  const fieldValue = form.getFieldsValue()

  const totalPrice = sum(selectedProducts.map(product => product.totalPrice))

  const handleMemberContractCreate = async () => {
    if (!fieldValue.paymentMethod) {
      message.warn('請選擇付款方式')
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
        startedAt: fieldValue.startedAt,
        endedAt: fieldValue.endedAt,
        authorId: fieldValue.executorId,
        values: {
          memberId: member.id,
          invoice: {
            name: member.name,
            email: member.email,
          },
          price: totalPrice,
          orderId,
          orderOptions: {
            recognizePerformance: totalPrice,
          },
          orderProducts: selectedProducts,
          paymentNo: moment().format('YYYYMMDDHHmmss'),
          paymentOptions: {
            paymentMethod: fieldValue.paymentMethod,
          },
          totalCount: selectedProducts.reduce((sum, product) => sum + product.amount, 0),
        },
        options: {},
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
