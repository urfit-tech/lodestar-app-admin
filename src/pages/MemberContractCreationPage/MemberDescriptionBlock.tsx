import { Alert, Descriptions, Tag } from 'antd'
import { length } from 'ramda'
import React, { memo } from 'react'
import { ContractInfo } from '.'

const MemberDescriptionBlock: React.FC<{
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  member: NonNullable<ContractInfo['member']>
  properties: ContractInfo['properties']
}> = memo(
  ({ memberBlockRef, member, properties }) => {
    return (
      <div ref={memberBlockRef}>
        <Descriptions
          title={
            <>
              <span>學生資料</span>
              <div style={{ fontSize: '14px', fontWeight: 'normal' }}>
                {'請去學米後台 > 會員列表 > 找到學員並將資料填寫完成'}
              </div>
            </>
          }
          bordered
          className="mb-5"
        >
          <Descriptions.Item label="學員姓名">{member.name}</Descriptions.Item>
          <Descriptions.Item label="學員信箱">{member.email}</Descriptions.Item>
          <Descriptions.Item label="學員電話">
            {!!length(member.phones) ? (
              member.phones.map((v, index) => <Tag key={index}>{v}</Tag>)
            ) : (
              <Alert type="error" message="未設定" />
            )}
          </Descriptions.Item>
        </Descriptions>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.member.id === nextProps.member.id,
)

export default MemberDescriptionBlock
