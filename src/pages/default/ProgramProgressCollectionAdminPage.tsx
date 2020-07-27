import { DownloadOutlined, FileTextFilled } from '@ant-design/icons'
import { Button, Select, Typography } from 'antd'
import { SelectProps } from 'antd/lib/select'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { AdminPageBlock } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import ProgramProgressTable from '../../containers/program/ProgramProgressTable'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { downloadCSV, toCSV } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { useProgramContentEnrollment } from '../../hooks/program'
import LoadingPage from './LoadingPage'
import NotFoundPage from './NotFoundPage'

const messages = defineMessages({
  learningDuration: { id: 'common.term.learningDuration', defaultMessage: '學習時數' },
  learningProgress: { id: 'common.term.learningProgress', defaultMessage: '學習進度' },
  exportProgramProgress: { id: 'common.ui.exportProgramProgress', defaultMessage: '匯出學習進度' },
})

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const { enabledModules } = useContext(AppContext)
  const [selectedProgramId, setSelectedProgramId] = useState('all')
  const [memberList, setMemberList] = useState<string[][]>([[]])

  if (!currentMemberId) {
    return <LoadingPage />
  }

  if (!enabledModules.learning_statistics) {
    return <NotFoundPage />
  }

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <FileTextFilled className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programProgress)}</span>
      </Typography.Title>
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
        <Select.Option value={program.id}>{program.title}</Select.Option>
      ))}
    </Select>
  )
}

export default ProgramProgressCollectionAdminPage
