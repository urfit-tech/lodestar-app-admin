import { Button } from 'antd'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import { StyledContent } from '.'
import { useRouteKeys } from '../../hooks/util'
import AdminMenu from '../admin/AdminMenu'
import Responsive from '../common/Responsive'
import DefaultLayout from './DefaultLayout'

const messages = defineMessages({
  backstage: { id: 'layout.label.backstage', defaultMessage: '管理後台' },
})

const AdminLayout: React.FC = ({ children }) => {
  const { formatMessage } = useIntl()
  const defaultSelectedKeys = useRouteKeys()

  return (
    <DefaultLayout
      noFooter
      renderTitle={() => (
        <Link to={`/`} className="d-flex">
          <Button type="link">{formatMessage(messages.backstage)}</Button>
        </Link>
      )}
    >
      <div className="d-flex">
        <Responsive.Desktop>
          <StyledContent noFooter white>
            <AdminMenu defaultSelectedKeys={defaultSelectedKeys} />
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
