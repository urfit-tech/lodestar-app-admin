import { Button } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { StyledContent } from '.'
import { useRouteKeys } from '../../hooks/util'
import { OwnerAdminMenu } from '../admin/AdminMenu'
import Responsive from '../common/Responsive'
import DefaultLayout from './DefaultLayout'

const OwnerAdminLayout: React.FC = ({ children }) => {
  const defaultSelectedKeys = useRouteKeys()

  return (
    <DefaultLayout
      noFooter
      renderTitle={() => (
        <Link to={`/`} className="d-flex">
          <Button type="link">平台管理者專區</Button>
        </Link>
      )}
    >
      <div className="d-flex">
        <Responsive.Desktop>
          <StyledContent noFooter white>
            <OwnerAdminMenu defaultSelectedKeys={defaultSelectedKeys} />
          </StyledContent>
        </Responsive.Desktop>
        <StyledContent className="flex-grow-1 p-3 p-sm-5" noFooter>
          {children}
        </StyledContent>
      </div>
    </DefaultLayout>
  )
}

export default OwnerAdminLayout
