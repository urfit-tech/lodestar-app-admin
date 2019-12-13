import { Button, Typography } from 'antd'
import React from 'react'
import { InferType } from 'yup'
import { programSchema } from '../../schemas/program'
import AdminCard from '../admin/AdminCard'

type ProgramDeletionAdminCardProps = {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramDeletionAdminCard: React.FC<ProgramDeletionAdminCardProps> = ({ program }) => {
  return (
    <AdminCard loading={!program}>
      <Typography.Title level={4}>刪除課程</Typography.Title>
      <Typography.Text>請仔細確認是否真的要刪除課程，因為一旦刪除就無法恢復。</Typography.Text>
      <Typography.Text type="danger">注意：只有在無人購買的情況下才能刪除課程。</Typography.Text>
      <Button type="danger" disabled>
        刪除課程
      </Button>
    </AdminCard>
  )
}

export default ProgramDeletionAdminCard
