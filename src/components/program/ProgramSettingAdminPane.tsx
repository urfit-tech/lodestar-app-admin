import { Typography } from 'antd'
import React from 'react'
import { InferType } from 'yup'
import { programSchema } from '../../schemas/program'
import ProgramBasicAdminCard from './ProgramBasicAdminCard'
import ProgramIntroAdminCard from './ProgramIntroAdminCard'

const ProgramSettingAdminPane: React.FC<{
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  return (
    <div className="container py-3">
      <Typography.Title className="pb-4" level={3}>
        課程設定
      </Typography.Title>
      <div className="mb-3">
        <ProgramBasicAdminCard program={program} onRefetch={onRefetch} />
      </div>
      <div className="mb-3">
        <ProgramIntroAdminCard program={program} onRefetch={onRefetch} />
      </div>
      {/* <div className="mb-3">
          <ProgramDeletionAdminCard program={program} onRefetch={onRefetch} />
        </div> */}
    </div>
  )
}

export default ProgramSettingAdminPane
