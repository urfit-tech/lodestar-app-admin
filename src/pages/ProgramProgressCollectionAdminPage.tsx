import { DownloadOutlined, FileTextFilled } from '@ant-design/icons'
import { Button, Select } from 'antd'
import { SelectProps } from 'antd/lib/select'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import ProgramProgressTable from '../containers/program/ProgramProgressTable'
import { downloadCSV, toCSV } from '../helpers'
import { commonMessages } from '../helpers/translation'
import { useProgramContentEnrollment } from '../hooks/program'
import LoadingPage from './LoadingPage'
import NotFoundPage from './NotFoundPage'

const messages = defineMessages({
  learningDuration: { id: 'common.label.learningDuration', defaultMessage: '學習時數' },
  learningProgress: { id: 'common.label.learningProgress', defaultMessage: '學習進度' },
  exportProgramProgress: { id: 'common.ui.exportProgramProgress', defaultMessage: '匯出學習進度' },
})

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { enabledModules, loading } = useApp()
  const [selectedProgramId, setSelectedProgramId] = useState('all')
  const [memberList, setMemberList] = useState<string[][]>([[]])

  if (!currentMemberId || loading) {
    return <LoadingPage />
  }

  if (!enabledModules.learning_statistics) {
    return <NotFoundPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <FileTextFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programProgress)}</span>
      </AdminPageTitle>

      <Button
        type="primary"
        icon={<DownloadOutlined />}
        className="mb-4"
        onClick={() => downloadCSV('program-progress', toCSV(memberList))}
      >
        {formatMessage(messages.exportProgramProgress)}
      </Button>

      <ProgramSelector
        className="mb-3"
        allText={formatMessage(commonMessages.label.allProgramProgress)}
        onChange={programId => setSelectedProgramId(`${programId}`)}
      />

      <AdminPageBlock>
        <ProgramProgressTable
          programId={selectedProgramId === 'all' ? null : selectedProgramId}
          onMemberListSet={setMemberList}
        />
      </AdminPageBlock>
    </AdminLayout>
  )
}

const ProgramSelector: React.FC<
  SelectProps<string> & {
    allText?: string
  }
> = ({ allText, ...selectProps }) => {
  const { formatMessage } = useIntl()
  const { loading, error, data: programs } = useProgramContentEnrollment()

  return (
    <Select disabled={!!error} loading={loading} style={{ width: '100%' }} defaultValue="all" {...selectProps}>
      <Select.Option value="all">{allText || formatMessage(commonMessages.label.allProgram)}</Select.Option>
      {programs.map(program => (
        <Select.Option key={program.id} value={program.id}>
          {program.title}
        </Select.Option>
      ))}
    </Select>
  )
}

export default ProgramProgressCollectionAdminPage
