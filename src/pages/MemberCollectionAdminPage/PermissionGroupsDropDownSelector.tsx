import { Select } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import { usePermissionGroupsDropdownMenu } from '../../hooks/permission'
import { MemberCollectionAdminFieldFilter } from '../../types/member'
import pageMessages from '../translation'

const PermissionGroupsDropDownSelector: React.VFC<{
  fieldFilter: MemberCollectionAdminFieldFilter
  onFiledFilterChange: (filter: MemberCollectionAdminFieldFilter) => void
}> = ({ fieldFilter, onFiledFilterChange }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { permissionGroupDropdownMenu } = usePermissionGroupsDropdownMenu(appId, {
    ...fieldFilter,
    properties: Object.entries(fieldFilter.properties || {}).map(([propertyId, value]) => ({
      id: propertyId,
      value,
    })),
  })

  return (
    <Select
      allowClear
      placeholder={formatMessage(pageMessages.PermissionGroupsDropDownSelector.permissionGroupsSelectorPlaceholder)}
      value={fieldFilter.permissionGroup}
      onChange={value => {
        onFiledFilterChange({
          ...fieldFilter,
          permissionGroup: value,
        })
      }}
    >
      {permissionGroupDropdownMenu.map(item => (
        <Select.Option key={item.permissionGroup} value={item.permissionGroup}>
          {item.permissionGroup} ({item.count})
        </Select.Option>
      ))}
    </Select>
  )
}

export default PermissionGroupsDropDownSelector
