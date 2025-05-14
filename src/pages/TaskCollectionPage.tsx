import { UserOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { StringParam, useQueryParam } from 'use-query-params'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import MemberTaskAdminBlock from '../components/task/MemberTaskAdminBlock'
import { commonMessages } from '../helpers/translation'
import { useMemberTask } from '../hooks/task'
import ForbiddenPage from './ForbiddenPage'

const TaskCollectionPage: React.FC = () => {
  const localStorageMemberTaskDisplay = localStorage.getItem('memberTaskDisplay') || undefined
  const localStorageMemberTaskFilter = JSON.parse(localStorage.getItem('memberTaskFilter') || 'null')
  const [activeMemberTaskId] = useQueryParam('id', StringParam)
  const { memberTask } = useMemberTask(activeMemberTaskId || '')

  const { formatMessage } = useIntl()
  const { permissions, currentMemberId } = useAuth()

  const { data: permissionGroupData } = useQuery<{
    member_permission_group: { permission_group_id: string }[]
  }>(
    gql`
      query GET_MEMBER_PERMISSION_GROUP($memberId: String!) {
        member_permission_group(where: { member_id: { _eq: $memberId } }) {
          permission_group_id
        }
      }
    `,
    {
      skip: !permissions?.TASK_READ_GROUP_ALL || !currentMemberId,
      variables: { memberId: currentMemberId || '' },
      fetchPolicy: 'network-only',
    },
  )

  const permissionGroupIds =
    permissionGroupData?.member_permission_group?.map(
      (pg: { permission_group_id: string }) => pg.permission_group_id,
    ) || []

  if (!permissions.TASK_ADMIN && !permissions.TASK_READ_GROUP_ALL) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <UserOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.tasks)}</span>
      </AdminPageTitle>

      <MemberTaskAdminBlock
        localStorageMemberTaskDisplay={localStorageMemberTaskDisplay}
        localStorageMemberTaskFilter={localStorageMemberTaskFilter}
        activeMemberTask={memberTask}
        permissionGroupIds={permissionGroupIds}
        permissions={{
          TASK_READ_GROUP_ALL: permissions.TASK_READ_GROUP_ALL || false,
        }}
      />
    </AdminLayout>
  )
}

export default TaskCollectionPage
