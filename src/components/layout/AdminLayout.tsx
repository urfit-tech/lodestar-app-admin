import { Button } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { StyledContent } from '.'
import { useAuth } from '../../contexts/AuthContext'
import { useRouteKeys } from '../../hooks/util'
import { CreatorAdminMenu, OwnerAdminMenu } from '../admin/AdminMenu'
import Responsive from '../common/Responsive'
import DefaultLayout from './DefaultLayout'

const messages = defineMessages({
  ownerBackstage: { id: 'layout.label.ownerBackstage', defaultMessage: '平台管理者專區' },
  creatorStudio: { id: 'layout.label.creatorStudio', defaultMessage: '創作者工作室' },
})

const AdminLayout: React.FC = ({ children }) => {
  const { formatMessage } = useIntl()
  const defaultSelectedKeys = useRouteKeys()
  const { currentUserRole } = useAuth()

  return (
    <DefaultLayout
      noFooter
      renderTitle={() => (
        <Link to={`/`} className="d-flex">
          <Button type="link">
            {currentUserRole === 'app-owner'
              ? formatMessage(messages.ownerBackstage)
              : currentUserRole === 'content-creator'
              ? formatMessage(messages.creatorStudio)
              : null}
          </Button>
        </Link>
      )}
    >
      <div className="d-flex">
        <Responsive.Desktop>
          <StyledContent noFooter white>
            {currentUserRole === 'app-owner' ? (
              <OwnerAdminMenu defaultSelectedKeys={defaultSelectedKeys} />
            ) : currentUserRole === 'content-creator' ? (
              <CreatorAdminMenu defaultSelectedKeys={defaultSelectedKeys} />
            ) : null}
          </StyledContent>
        </Responsive.Desktop>

        <StyledContent className="flex-grow-1 p-3 p-sm-5" noFooter>
          {children}
        </StyledContent>
      </div>
    </DefaultLayout>
  )
}

export default AdminLayout
