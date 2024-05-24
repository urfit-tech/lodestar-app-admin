import Icon from '@ant-design/icons'
import { Button, Checkbox, Popover } from 'antd'
import { SortOrder } from 'antd/lib/table/interface'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { memberMessages } from '../../helpers/translation'
import { TableIcon } from '../../images/icon'
import PermissionGroupsDropDownSelector from '../../pages/MemberCollectionAdminPage/PermissionGroupsDropDownSelector'
import RoleSelector from '../../pages/MemberCollectionAdminPage/RoleSelector'
import { MemberCollectionAdminFieldFilter } from '../../types/member'
import MemberCreationModal from '../member/MemberCreationModal'
import MemberExportModal from '../member/MemberExportModal'
import MemberImportModal from '../member/MemberImportModal'
import OldMemberExportModal from '../member/OldMemberExportModal'
import OldMemberImportModal from '../member/OldMemberImportModal'

const StyledButton = styled(Button)`
  && {
    color: var(--gray-darker);
  }
`
const StyledOverlay = styled.div`
  padding: 1rem;
  max-width: 20rem;
  max-height: 20rem;
  overflow: auto;
  background: white;
  border-radius: 4px;
  box-shadow: 0 5px 10px 0 var(--black-10);
`
const OverlayTitle = styled.div`
  margin-bottom: 0.75rem;
  color: var(--gray-dark);
  font-size: 14px;
`
const FilterWrapper = styled.div`
  columns: 2;
  .ant-checkbox-wrapper.ant-checkbox-wrapper {
    display: block;
    margin-left: 0;
    margin-bottom: 1rem;
  }
`

export const MemberSelectControlPanel: React.FC<{
  permissions: { [key: string]: boolean }
  enabledModules: { [key: string]: boolean | undefined }
  fieldFilter: MemberCollectionAdminFieldFilter
  setFieldFilter: (filter: MemberCollectionAdminFieldFilter) => void
}> = ({ permissions, enabledModules, fieldFilter, setFieldFilter }) => {
  return (
    <div className="d-flex">
      {permissions.MEMBER_ROLE_SELECT && (
        <div className="mr-3">
          <RoleSelector fieldFilter={fieldFilter} onFiledFilterChange={setFieldFilter} />
        </div>
      )}

      {enabledModules.permission_group && permissions.MEMBER_PERMISSION_GROUP_SELECT ? (
        <PermissionGroupsDropDownSelector fieldFilter={fieldFilter} onFiledFilterChange={setFieldFilter} />
      ) : null}
    </div>
  )
}

export const MemberFieldFilter: React.FC<{
  allColumns: ({
    id: string
    title: string
  } | null)[]
  visibleColumnIds: string[]
  setVisibleColumnIds: (value: string[]) => void
}> = ({ allColumns, visibleColumnIds, setVisibleColumnIds }) => {
  const { formatMessage } = useIntl()
  return (
    <Popover
      trigger="click"
      placement="bottomLeft"
      content={
        <StyledOverlay>
          <OverlayTitle>{formatMessage(memberMessages.label.fieldVisible)}</OverlayTitle>
          <Checkbox.Group value={visibleColumnIds} onChange={value => setVisibleColumnIds(value as string[])}>
            <FilterWrapper>
              {allColumns.map(column =>
                column ? (
                  <Checkbox key={column.id} value={column.id}>
                    {column.title}
                  </Checkbox>
                ) : null,
              )}
            </FilterWrapper>
          </Checkbox.Group>
        </StyledOverlay>
      }
    >
      <StyledButton type="link" icon={<Icon component={() => <TableIcon />} />}>
        {formatMessage(memberMessages.label.field)}
      </StyledButton>
    </Popover>
  )
}

export const MemberImportExportControlPanel: React.FC<{
  permissions: { [key: string]: boolean }
  enabledModules: { [key: string]: boolean | undefined }
  fieldFilter: MemberCollectionAdminFieldFilter
  exportImportVersionTag: boolean
  appId: string
  sortOrder: {
    createdAt: SortOrder
    loginedAt: SortOrder
    consumption: SortOrder
  }
  visibleColumnIds: string[]
  columns: { key: string; title: string }[]
}> = ({
  permissions,
  enabledModules,
  fieldFilter,
  exportImportVersionTag,
  appId,
  sortOrder,
  visibleColumnIds,
  columns,
}) => {
  return (
    <>
      <div className="mr-2">{permissions.MEMBER_CREATE && <MemberCreationModal />}</div>
      <div className="mr-2">
        {exportImportVersionTag ? (
          <MemberImportModal />
        ) : (
          <OldMemberImportModal /> // TODO: remove this after new export import completed
        )}
      </div>
      {enabledModules.member_info_export ? (
        exportImportVersionTag ? (
          <MemberExportModal appId={appId} filter={fieldFilter} sortOrder={sortOrder} />
        ) : (
          <OldMemberExportModal // TODO: remove this after new export import completed
            appId={appId}
            visibleFields={visibleColumnIds}
            columns={columns}
            filter={fieldFilter}
            sortOrder={sortOrder}
          />
        )
      ) : null}
    </>
  )
}
