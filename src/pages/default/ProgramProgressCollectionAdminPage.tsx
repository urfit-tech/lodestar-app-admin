import { Icon, Select, Typography } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import ProgramProgressTable from '../../containers/program/ProgramProgressTable'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import { useProgramContentEnrollment } from '../../hooks/program'
import LoadingPage from './LoadingPage'
import NotFoundPage from './NotFoundPage'

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { enabledModules } = useContext(AppContext)
  const [selectedProgramId, setSelectedProgramId] = useState('all')

  if (!currentMemberId) {
    return <LoadingPage />
  }

  if (!enabledModules.learning_statistics) {
    return <NotFoundPage />
  }

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon type="file-text" theme="filled" className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programProgress)}</span>
      </Typography.Title>
      <ProgramSelector
        className="mb-3"
        allText={formatMessage(commonMessages.label.allProgramProgress)}
        onChange={programId => setSelectedProgramId(`${programId}`)}
      />
      <AdminPageBlock>
        <ProgramProgressTable programId={selectedProgramId === 'all' ? null : selectedProgramId} />
      </AdminPageBlock>
    </AdminLayout>
  )
}

const ProgramSelector: React.FC<SelectProps & {
  allText?: string
}> = ({ allText, ...selectProps }) => {
  const { formatMessage } = useIntl()
  const { loading, error, data: programs } = useProgramContentEnrollment()

  return (
    <Select disabled={!!error} loading={loading} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option key="all">{allText || formatMessage(commonMessages.label.allProgram)}</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id}>{program.title}</Select.Option>
      ))}
    </Select>
  )
}

export default ProgramProgressCollectionAdminPage
