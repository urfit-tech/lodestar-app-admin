import { useQuery } from '@apollo/react-hooks'
import { Icon, Select, Typography } from 'antd'
import { SelectProps } from 'antd/lib/select'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock } from '../../components/admin'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import ProgramProgressTable from '../../containers/program/ProgramProgressTable'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import LoadingPage from './LoadingPage'
import NotFoundPage from './NotFoundPage'

const ProgramProgressCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId, currentUserRole } = useAuth()
  const { enabledModules } = useContext(AppContext)
  const [selectedProgramId, setSelectedProgramId] = useState('all')

  if (!currentMemberId || !currentUserRole) {
    return <LoadingPage />
  }

  if (!enabledModules.learning_statistics) {
    return <NotFoundPage />
  }

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

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

const useProgramContentEnrollment = () => {
  const { loading, error, data } = useQuery<types.GET_PROGRAM_CONTENT_ENROLLMENT>(GET_PROGRAM_CONTENT_ENROLLMENT)

  return {
    loading,
    error,
    data:
      data?.program_content_enrollment.map(programContentEnrollment => ({
        id: programContentEnrollment.program_id,
        title: programContentEnrollment?.program?.title || '',
      })) || [],
  }
}

const GET_PROGRAM_CONTENT_ENROLLMENT = gql`
  query GET_PROGRAM_CONTENT_ENROLLMENT {
    program_content_enrollment(where: { program: { published_at: { _is_null: false } } }, distinct_on: program_id) {
      program_id
      program {
        title
      }
    }
  }
`

export default ProgramProgressCollectionAdminPage
