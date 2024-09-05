import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Descriptions, Input, message } from 'antd'
import React, { memo, useEffect, useState } from 'react'
import { ContractInfo } from '.'
import hasura from '../../hasura'

const MemberDescriptionBlock: React.FC<{
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  member: NonNullable<ContractInfo['member']>
}> = memo(
  ({ memberBlockRef, member }) => {
    const [comment, setComment] = React.useState('')
    const [loading, setLoading] = useState(false)
    const { data, refetch } = useQuery<hasura.GetPaymentComment, hasura.GetPaymentCommentVariables>(
      gql`
        query GetPaymentComment($memberId: String!) {
          member_property(where: { member_id: { _eq: $memberId }, property: { name: { _eq: "付款備註" } } }) {
            id
            value
          }
          property(where: { name: { _eq: "付款備註" } }) {
            id
          }
        }
      `,
      { variables: { memberId: member.id } },
    )

    const [upsertMemberProperty] = useMutation<hasura.UpsertMemberProperty, hasura.UpsertMemberPropertyVariables>(gql`
      mutation UpsertMemberProperty($data: member_property_insert_input!) {
        insert_member_property_one(
          object: $data
          on_conflict: { constraint: member_property_pkey, update_columns: [value] }
        ) {
          value
        }
      }
    `)

    useEffect(() => {
      if (data?.member_property) {
        setComment(data?.member_property?.[0]?.value || '')
      }
    }, [data])
    return (
      <div ref={memberBlockRef} className="mb-5">
        <Descriptions title={<span>學生資料</span>} bordered className="mb-5" column={2}>
          <Descriptions.Item label="學員姓名">{member.name}</Descriptions.Item>
          <Descriptions.Item label="學員信箱">{member.email}</Descriptions.Item>
          <Descriptions.Item span={2} label="付款備註">
            <Input.TextArea style={{ height: 200 }} value={comment} onChange={e => setComment(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="會員分類">{member.memberType}</Descriptions.Item>
        </Descriptions>
        <Button className="mr-2" onClick={() => setComment(data?.member_property?.[0]?.value || '')}>
          取消
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => {
            setLoading(true)
            upsertMemberProperty({
              variables: {
                data: {
                  id: data?.member_property?.[0]?.id,
                  value: comment,
                  member_id: member.id,
                  property_id: data?.property?.[0]?.id,
                },
              },
            })
              .then(() => {
                refetch()
                message.success('更新成功')
              })
              .catch(() => {
                message.error('更新失敗')
              })
              .finally(() => {
                setLoading(false)
              })
          }}
        >
          儲存
        </Button>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.member.id === nextProps.member.id,
)

export default MemberDescriptionBlock
