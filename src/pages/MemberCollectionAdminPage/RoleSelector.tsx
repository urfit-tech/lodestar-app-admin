import { CaretDownOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { UserRoleName } from '../../components/common/UserRole'
import { useMemberRoleCount } from '../../hooks/member'
import { UserRole } from '../../types/member'
import pageMessages from '../translation'
import { FiledFilter } from './MemberCollectionAdminPage'

const StyledDropdown = styled(Dropdown)`
  width: 100%;
  color: var(--gray-darker);
`
const StyledMenuItem = styled(Menu.Item)`
  && {
    padding: 12px 16px;
  }
`

const RoleSelector: React.VFC<{ fieldFilter: FiledFilter; onFiledFilterChange: (filter: FiledFilter) => void }> = ({
  fieldFilter,
  onFiledFilterChange,
}) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()

  const { menu } = useMemberRoleCount(appId, {
    ...fieldFilter,
    properties: Object.entries(fieldFilter.properties || {}).map(([propertyId, value]) => ({
      id: propertyId,
      value,
    })),
  })
  const dropdownMenu = menu.map(menuItem => ({
    ...menuItem,
    text: formatMessage(menuItem.intlKey),
  }))

  return (
    <StyledDropdown
      trigger={['click']}
      overlay={
        <Menu>
          {dropdownMenu.map(item => (
            <StyledMenuItem
              key={item.text}
              onClick={() =>
                onFiledFilterChange({
                  ...fieldFilter,
                  role: item.role as UserRole,
                })
              }
            >
              {item.text} ({item.count})
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
          {` (${menu.filter(item => item.role === (fieldFilter.role || null))[0].count})`}
        </span>
        <CaretDownOutlined />
      </Button>
    </StyledDropdown>
  )
}
export default RoleSelector
