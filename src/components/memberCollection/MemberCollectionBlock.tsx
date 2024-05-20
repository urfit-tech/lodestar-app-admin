import { SortOrder } from 'antd/lib/table/interface'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, memberMessages } from '../../helpers/translation'
import { useProperty } from '../../hooks/member'
import { MemberCollectionAdminFieldFilter, MemberCollectionProps, ResponseMembers } from '../../types/member'
import AdminCard from '../admin/AdminCard'
import DuplicatePhoneBlock from './DuplicatePhoneBlock'
import {
  MemberFieldFilter,
  MemberImportExportControlPanel,
  MemberSelectControlPanel,
} from './MemberCollectionControlPanel'
import MemberCollectionTableBlock from './MemberCollectionTableBlock'

const MemberCollectionBlock: React.VFC<{
  members: MemberCollectionProps[]
  loadingMembers: boolean
  fieldFilter: MemberCollectionAdminFieldFilter
  setFieldFilter: (filter: MemberCollectionAdminFieldFilter) => void
  nextToken: string | null
  limit: number
  fetchMembers: (
    filter: MemberCollectionAdminFieldFilter | undefined,
    option: { limit?: number | undefined; nextToken?: string | null | undefined },
  ) => Promise<ResponseMembers>
}> = ({ members, nextToken, limit, loadingMembers, fieldFilter, setFieldFilter, fetchMembers }) => {
  const { formatMessage } = useIntl()
  const { permissions, currentUserRole } = useAuth()
  const { id: appId, enabledModules, settings } = useApp()
  const exportImportVersionTag = settings['feature.member.import_export'] === '1' // TODO: remove this after new export import completed
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>(['#', 'email', 'createdAt', 'consumption'])

  const [sortOrder, setSortOrder] = useState<{
    createdAt: SortOrder
    loginedAt: SortOrder
    consumption: SortOrder
  }>({
    createdAt: null,
    loginedAt: null,
    consumption: null,
  })

  const { properties } = useProperty()

  const [currentMembers, setCurrentMembers] = useState<
    {
      id: string
      pictureUrl: string | null
      name: string
      email: string
      role: 'general-member' | 'content-creator' | 'app-owner'
      createdAt: Date
      username: string
      loginedAt: Date | null
      managerId: string | null
    }[]
  >(members)

  useEffect(() => {
    if (!loadingMembers && members) {
      setCurrentMembers(members)
    }
  }, [loadingMembers, members])

  const allColumns: ({
    id: string
    title: string
  } | null)[] = [
    { id: 'email', title: 'Email' },
    permissions['MEMBER_PHONE_ADMIN'] ? { id: 'phone', title: formatMessage(commonMessages.label.phone) } : null,
    { id: 'username', title: formatMessage(commonMessages.label.account) },
    { id: 'createdAt', title: formatMessage(commonMessages.label.createdDate) },
    { id: 'loginedAt', title: formatMessage(commonMessages.label.lastLogin) },
    { id: 'consumption', title: formatMessage(commonMessages.label.consumption) },
    { id: 'categories', title: formatMessage(commonMessages.label.category) },
    { id: 'tags', title: formatMessage(commonMessages.label.tags) },
    enabledModules.member_assignment && currentUserRole === 'app-owner'
      ? { id: 'managerName', title: formatMessage(memberMessages.label.manager) }
      : null,
    ...properties.map(property => ({
      id: property.id,
      title: property.name,
    })),
  ]

  // for OldMemberExportModal
  const columns: { key: string; title: string }[] = [
    { key: '#', title: '#' },
    { key: 'name', title: formatMessage(commonMessages.label.memberName) },
    { key: 'email', title: 'Email' },
    { key: 'phone', title: formatMessage(commonMessages.label.phone) },
    { key: 'username', title: formatMessage(commonMessages.label.account) },
    { key: 'createdAt', title: formatMessage(commonMessages.label.createdDate) },
    { key: 'loginedAt', title: formatMessage(commonMessages.label.lastLogin) },
    { key: 'consumption', title: formatMessage(commonMessages.label.consumption) },
    { key: 'categories', title: formatMessage(commonMessages.label.category) },
    { key: 'tags', title: formatMessage(commonMessages.label.tags) },
    { key: 'managerName', title: formatMessage(memberMessages.label.manager) },
    ...properties
      .filter(property => visibleColumnIds.includes(property.id))
      .map(property => ({ key: property.id, title: property.name })),
  ]

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <MemberSelectControlPanel
          enabledModules={enabledModules}
          permissions={permissions}
          fieldFilter={fieldFilter}
          setFieldFilter={setFieldFilter}
        />

        <div className="d-flex">
          <MemberFieldFilter
            allColumns={allColumns}
            visibleColumnIds={visibleColumnIds}
            setVisibleColumnIds={setVisibleColumnIds}
          />
          <MemberImportExportControlPanel
            permissions={permissions}
            enabledModules={enabledModules}
            fieldFilter={fieldFilter}
            exportImportVersionTag={exportImportVersionTag}
            appId={appId}
            sortOrder={sortOrder}
            visibleColumnIds={visibleColumnIds}
            columns={columns}
          />
        </div>
      </div>

      <DuplicatePhoneBlock />

      <AdminCard className="mb-5">
        <MemberCollectionTableBlock
          visibleColumnIds={visibleColumnIds}
          loadingMembers={loadingMembers || !members}
          currentMembers={currentMembers}
          limit={limit}
          nextToken={nextToken}
          fieldFilter={fieldFilter}
          properties={properties}
          visibleShowMoreButton={true}
          visibleColumnSearchProps={true}
          fetchMembers={fetchMembers}
          onFieldFilterChange={(filter: MemberCollectionAdminFieldFilter) => setFieldFilter(filter)}
          onSortOrderChange={(createdAt: SortOrder, loginedAt: SortOrder, consumption: SortOrder) =>
            setSortOrder({ createdAt, loginedAt, consumption })
          }
          onCurrentMembersChange={(
            value: {
              id: string
              pictureUrl: string | null
              name: string
              email: string
              role: 'general-member' | 'content-creator' | 'app-owner'
              createdAt: Date
              username: string
              loginedAt: Date | null
              managerId: string | null
            }[],
          ) => setCurrentMembers(value)}
        />
      </AdminCard>
    </>
  )
}

export default MemberCollectionBlock
