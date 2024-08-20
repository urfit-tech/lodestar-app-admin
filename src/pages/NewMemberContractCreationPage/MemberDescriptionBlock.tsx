import { gql, useMutation } from '@apollo/client'
import { Button, Descriptions, Input, message } from 'antd'
import React, { memo, useState } from 'react'
import { ContractInfo } from '.'
import hasura from '../../hasura'

const MemberDescriptionBlock: React.FC<{
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  member: NonNullable<ContractInfo['member']>
}> = memo(
  ({ memberBlockRef, member }) => {
    const [comment, setComment] = React.useState(member.paymentComment)
    const [loading, setLoading] = useState(false)
    const [updateMemberProperty] = useMutation<hasura.UpdateMemberProperty, hasura.UpdateMemberPropertyVariables>(gql`
      mutation UpdateMemberProperty($memberPropertyId: uuid!, $value: String!) {
        update_member_property_by_pk(pk_columns: { id: $memberPropertyId }, _set: { value: $value }) {
          value
        }
      }
    `)
    return (
      <div ref={memberBlockRef} className="mb-5">
        <Descriptions title={<span>學生資料</span>} bordered className="mb-5" column={2}>
          <Descriptions.Item label="學員姓名">{member.name}</Descriptions.Item>
          <Descriptions.Item label="學員信箱">{member.email}</Descriptions.Item>
          <Descriptions.Item span={2} label="付款備註">
            <Input.TextArea value={comment} onChange={e => setComment(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="會員分類">{member.categories.join(',')}</Descriptions.Item>
        </Descriptions>
        <Button className="mr-2" onClick={() => setComment(member.paymentComment)}>
          取消
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => {
            setLoading(true)
            updateMemberProperty({ variables: { memberPropertyId: member.paymentCommentId, value: comment } })
              .then(() => {
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
