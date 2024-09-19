import { Alert, Descriptions, Tag } from 'antd'
import React, { memo } from 'react'
import { useIntl } from 'react-intl'
import { ContractInfo } from '.'
import pageMessages from '../translation'

const MemberDescriptionBlock: React.FC<{
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  member: NonNullable<ContractInfo['member']>
  properties: ContractInfo['properties']
}> = memo(
  ({ memberBlockRef, member, properties }) => {
    const { formatMessage } = useIntl()

    return (
      <div ref={memberBlockRef}>
        <Descriptions
          title={
            <>
              <span>{formatMessage(pageMessages.MemberDescriptionBlock.info)}</span>
              <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                {formatMessage(pageMessages.MemberDescriptionBlock.goToBackendAndComplete)}
              </div>
            </>
          }
          bordered
          className="mb-5"
        >
          <Descriptions.Item label={formatMessage(pageMessages.MemberDescriptionBlock.name)}>
            {member.name}
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage(pageMessages.MemberDescriptionBlock.email)}>
            {member.email}
          </Descriptions.Item>
          <Descriptions.Item label={formatMessage(pageMessages.MemberDescriptionBlock.phone)}>
            {member.phone ? (
              <Tag>{member.phone}</Tag>
            ) : (
              <Alert type="error" message={formatMessage(pageMessages.MemberDescriptionBlock.notSet)} />
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.member.id === nextProps.member.id,
)

export default MemberDescriptionBlock
