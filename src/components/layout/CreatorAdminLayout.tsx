import { Button } from 'antd'
import React from 'react'
import { Link } from 'react-router-dom'
import { StyledContent } from '.'
import { useRouteKeys } from '../../hooks/util'
import { CreatorAdminMenu } from '../admin/AdminMenu'
import Responsive from '../common/Responsive'
import DefaultLayout from './DefaultLayout'

const CreatorAdminLayout: React.FC = ({ children }) => {
  const defaultSelectedKeys = useRouteKeys()

  return (
    <DefaultLayout
      noFooter
      renderTitle={() => (
        <Link to={`/studio`} className="d-flex">
          <Button type="link">創作者工作室</Button>
        </Link>
      )}
    >
      <div className="d-flex">
        <Responsive.Desktop>
          <StyledContent noFooter white>
            <CreatorAdminMenu defaultSelectedKeys={defaultSelectedKeys} />
          </StyledContent>
        </Responsive.Desktop>
        <StyledContent className="flex-grow-1 p-3 p-sm-5" noFooter>
          {children}
        </StyledContent>
      </div>
    </DefaultLayout>
  )
}

export default CreatorAdminLayout
