import { Descriptions } from 'antd'
import React, { memo } from 'react'
import { ContractInfo } from '.'

const MemberDescriptionBlock: React.FC<{
  memberBlockRef: React.MutableRefObject<HTMLDivElement | null>
  member: NonNullable<ContractInfo['member']>
}> = memo(
  ({ memberBlockRef, member }) => {
    return (
      <div ref={memberBlockRef}>
        <Descriptions title={<span>學生資料</span>} bordered className="mb-5" column={2}>
          <Descriptions.Item label="學員姓名">{member.name}</Descriptions.Item>
          <Descriptions.Item label="學員信箱">{member.email}</Descriptions.Item>
          <Descriptions.Item span={2} label="付款備註">
            {member.paymentComment || ''}
          </Descriptions.Item>
          <Descriptions.Item label="是否為BG">{member.isBG ? '是' : '否'}</Descriptions.Item>
        </Descriptions>
      </div>
    )
  },
  (prevProps, nextProps) => prevProps.member.id === nextProps.member.id,
)

export default MemberDescriptionBlock
