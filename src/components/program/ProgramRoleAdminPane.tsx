import { Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import React from 'react'
import { InferType } from 'yup'
import { programSchema } from '../../schemas/program'
import AdminCard from '../common/AdminCard'
import MemberAvatar from '../common/MemberAvatar'

type ProgramRoleAdminPaneProps = CardProps & {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramRoleAdminPane: React.FC<ProgramRoleAdminPaneProps> = ({ program }) => {
  return (
    <div className="container py-3">
      <Typography.Title className="pb-3" level={3}>
        身份管理
      </Typography.Title>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>課程負責人</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'owner')
              .map(role => <MemberAvatar key={role.id} memberId={role.memberId} withName />)}
        </AdminCard>
      </div>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>講師</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'instructor')
              .map(role => <MemberAvatar key={role.id} memberId={role.memberId} withName />)}
        </AdminCard>
      </div>
      <div className="mb-3">
        <AdminCard loading={!program}>
          <Typography.Title level={4}>助教</Typography.Title>
          {program &&
            program.roles
              .filter(role => role.name === 'assistant')
              .map(role => <MemberAvatar key={role.id} memberId={role.memberId} withName />)}
        </AdminCard>
      </div>
    </div>
  )
}

export default ProgramRoleAdminPane
