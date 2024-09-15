import { gql, useMutation } from '@apollo/client'
import { Button, Descriptions, Input, message, Select } from 'antd'
import React, { memo, useState } from 'react'
import { ContractInfo } from '.'
import hasura from '../../hasura'

const MemberDescriptionBlock: React.FC<{
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  member: NonNullable<ContractInfo['member']>
}> = memo(
  ({ memberBlockRef, member }) => {
    const memberTypeProperty = member.properties.find(p => p.name === '會員類型')

    const defaultMemberType = memberTypeProperty?.value || ''
    const memberTypeOptions = memberTypeProperty?.placeholder.split('/') || []
    const [memberType, setMemberType] = React.useState(defaultMemberType)

    const commentProperty = member.properties.find(p => p.name === '付款備註')
    const defaultComment = commentProperty?.value || ''
    const [comment, setComment] = React.useState(defaultComment)
    const [loading, setLoading] = useState(false)

    const [upsertMemberProperty] = useMutation<hasura.UpsertMemberProperty, hasura.UpsertMemberPropertyVariables>(gql`
      mutation UpsertMemberProperty($data: member_property_insert_input!) {
        insert_member_property_one(
          object: $data
          on_conflict: { constraint: member_property_member_id_property_id_key, update_columns: [value] }
        ) {
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
            <Input.TextArea style={{ height: 200 }} value={comment} onChange={e => setComment(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label="會員分類">
            <Select
              style={{ width: '100%' }}
              defaultValue={memberType}
              onChange={value => {
                setMemberType(value)
              }}
            >
              {memberTypeOptions.map(p => (
                <Select.Option value={p}>{p}</Select.Option>
              ))}
            </Select>
          </Descriptions.Item>
        </Descriptions>
        <Button className="mr-2" onClick={() => setComment(defaultComment)}>
          取消
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={async () => {
            try {
              setLoading(true)
              commentProperty &&
                (await upsertMemberProperty({
                  variables: {
                    data: {
                      value: comment,
                      member_id: member.id,
                      property_id: commentProperty.id,
                    },
                  },
                }))
              memberTypeProperty &&
                (await upsertMemberProperty({
                  variables: {
                    data: {
                      value: memberType,
                      member_id: member.id,
                      property_id: memberTypeProperty.id,
                    },
                  },
                }))
              message.success('更新成功')
            } catch (error) {
              message.error('更新失敗')
            } finally {
              setLoading(false)
              window.location.reload()
            }
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
