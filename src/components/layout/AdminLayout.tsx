import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { StyledContent } from '.'
import { commonMessages } from '../../helpers/translation'
import AdminMenu from '../admin/AdminMenu'
import { useRouteKeys } from '../common/AdminRouter'
import Responsive from '../common/Responsive'
import DefaultLayout from './DefaultLayout'

const SettingBlockToggleButton = styled(Button)<{ variant?: 'opened' | 'unopened' }>`
  position: absolute;
  bottom: 0%;
  left: ${props => (props.variant === 'unopened' ? '0px' : '240px')};
  border: 1px solid var(--gray);
  border-left: none;
`

const AdminLayout: React.FC = ({ children }) => {
  const { formatMessage } = useIntl()
  const defaultSelectedKeys = useRouteKeys()
  const [open, setOpen] = useState(true)
  return (
    <DefaultLayout
      noFooter
      renderTitle={() => (
        <Link to={`/`} className="d-flex">
          <Button type="link">{formatMessage(commonMessages.ui.backstage)}</Button>
        </Link>
      )}
    >
      <SettingBlockToggleButton onClick={() => setOpen(!open)} variant={open ? 'opened' : 'unopened'}>
        {open ? <LeftOutlined /> : <RightOutlined />}
      </SettingBlockToggleButton>
      <div className="d-flex">
        <Responsive.Desktop>
          <StyledContent noFooter white variant={open ? 'opened' : 'unopened'}>
            <AdminMenu defaultSelectedKeys={defaultSelectedKeys} opened={open} />
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
