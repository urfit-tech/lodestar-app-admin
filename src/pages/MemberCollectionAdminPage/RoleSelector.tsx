import { CaretDownOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, Spin } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { UserRoleName } from '../../components/common/UserRole'
import { useMemberRoleCount } from '../../hooks/member'
import { MemberCollectionAdminFieldFilter, UserRole } from '../../types/member'
import pageMessages from '../translation'

const StyledDropdown = styled(Dropdown)`
  width: 100%;
  color: var(--gray-darker);
`
const StyledMenuItem = styled(Menu.Item)`
  && {
    padding: 12px 16px;
  }
`

const RoleSelector: React.VFC<{
  fieldFilter: MemberCollectionAdminFieldFilter
  onFiledFilterChange: (filter: MemberCollectionAdminFieldFilter) => void
}> = ({ fieldFilter, onFiledFilterChange }) => {
  const { formatMessage } = useIntl()
  const { loading, id: appId } = useApp()
  const { loading: loadingMemberRoleCount, menu } = useMemberRoleCount(appId, {
    ...fieldFilter,
    properties: Object.entries(fieldFilter.properties || {}).map(([propertyId, value]) => ({
      id: propertyId,
      value,
    })),
  })

  return (
    <StyledDropdown
      trigger={['click']}
      overlay={
        <Menu>
          {menu.map(item => (
            <StyledMenuItem
              key={item.intlKey.id}
              onClick={() =>
                onFiledFilterChange({
                  ...fieldFilter,
                  role: item.role as UserRole,
                })
              }
            >
              {formatMessage(item.intlKey)} (
              {loading || loadingMemberRoleCount ? <Spin className="ml-2" /> : item.count})
            </StyledMenuItem>
          ))}
        </Menu>
      }
    >
      <Button className="d-flex justify-content-between align-items-center">
        <span>
          {fieldFilter.role ? (
            <UserRoleName userRole={fieldFilter.role} />
          ) : (
            formatMessage(pageMessages['*'].allMembers)
          )}
          {loading || loadingMemberRoleCount ? (
            <Spin className="ml-2" />
          ) : (
            ` (${menu.filter(item => item.role === (fieldFilter.role || null))[0].count})`
          )}
        </span>
        <CaretDownOutlined />
      </Button>
    </StyledDropdown>
  )
}
export default RoleSelector
