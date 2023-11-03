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
  position: relative;
  bottom: 0%;
  border: 1px solid var(--gray);
  border-left: none;
`

const NavbarBackStageButton = styled(Button)`
  @media screen and (max-width: 480px) {
    font-size: 15px;
    padding: 5px 5px;
  }
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
          <NavbarBackStageButton type="link">{formatMessage(commonMessages.ui.backstage)}</NavbarBackStageButton>
        </Link>
      )}
    >
      <div className="d-flex">
        <Responsive.Desktop>
          <div className="d-flex align-items-end">
            <StyledContent noFooter white variant={open ? 'opened' : 'unopened'}>
              <AdminMenu defaultSelectedKeys={defaultSelectedKeys} opened={open} />
            </StyledContent>

            <SettingBlockToggleButton onClick={() => setOpen(!open)}>
              {open ? <LeftOutlined /> : <RightOutlined />}
            </SettingBlockToggleButton>
          </div>
        </Responsive.Desktop>

        <StyledContent className="flex-grow-1 p-3 p-sm-5" noFooter>
          {children}
        </StyledContent>
      </div>
    </DefaultLayout>
  )
}

export default AdminLayout
