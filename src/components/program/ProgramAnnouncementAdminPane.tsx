import { CardProps } from 'antd/lib/card'
import React from 'react'
import { InferType } from 'yup'
import { programSchema } from '../../schemas/program'
import AdminCard from '../admin/AdminCard'

type ProgramAnnouncementAdminPaneProps = CardProps & {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramAnnouncementAdminPane: React.FC<ProgramAnnouncementAdminPaneProps> = ({ program }) => {
  return (
    <div className="container">
      <AdminCard>ProgramAnnouncementAdminPane: {JSON.stringify(program)}</AdminCard>
    </div>
  )
}

export default ProgramAnnouncementAdminPane
