import { gql, useMutation } from '@apollo/client'
import { Button, Descriptions, Input, message, Select } from 'antd'
import React, { memo, useState } from 'react'
import { useIntl } from 'react-intl'
import { ContractInfo } from '.'
import hasura from '../../hasura'
import pageMessages from '../translation'

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

    const isMemberZeroTaxProperty = member.properties.find(p => p.name === '是否零稅')
    const defaultIsMemberZeroTax = isMemberZeroTaxProperty?.value || ''
    const IsMemberZeroTaxOptions = isMemberZeroTaxProperty?.placeholder.split('/') || []
    const [isMemberZeroTax, setIsMemberZeroTax] = React.useState(defaultIsMemberZeroTax)
    const { formatMessage } = useIntl()
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
        <Descriptions
          title={<span>{formatMessage(pageMessages.MemberDescriptionBlock.info)}</span>}
          bordered
          className="mb-5"
          column={2}
        >
          <Descriptions.Item label={formatMessage(pageMessages.MemberDescriptionBlock.name)}>
            {member.name}
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage(pageMessages.MemberDescriptionBlock.email)}>
            {member.email}
          </Descriptions.Item>
          <Descriptions.Item span={2} label={formatMessage(pageMessages.MemberDescriptionBlock.paymentNote)}>
            <Input.TextArea style={{ height: 200 }} value={comment} onChange={e => setComment(e.target.value)} />
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage(pageMessages.MemberDescriptionBlock.memberCategory)}>
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
          <Descriptions.Item label="是否零稅">
            <Select
              style={{ width: '100%' }}
              defaultValue={isMemberZeroTax}
              onChange={value => {
                setIsMemberZeroTax(value)
              }}
            >
              {IsMemberZeroTaxOptions.map(p => (
                <Select.Option value={p}>{p}</Select.Option>
              ))}
            </Select>
          </Descriptions.Item>
        </Descriptions>
        <Button className="mr-2" onClick={() => setComment(defaultComment)}>
          {formatMessage(pageMessages.MemberDescriptionBlock.cancel)}
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
              isMemberZeroTaxProperty &&
                (await upsertMemberProperty({
                  variables: {
                    data: {
                      value: isMemberZeroTax,
                      member_id: member.id,
                      property_id: isMemberZeroTaxProperty.id,
                    },
                  },
                }))
              message.success(formatMessage(pageMessages.MemberDescriptionBlock.success))
            } catch (error) {
              message.error(formatMessage(pageMessages.MemberDescriptionBlock.fail))
            } finally {
              setLoading(false)
              // window.location.reload()
              fetch('/api/refresh-data')
            }
          }}
        >
          {formatMessage(pageMessages.MemberDescriptionBlock.save)}
        </Button>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.member.id === nextProps.member.id,
)

export default MemberDescriptionBlock
