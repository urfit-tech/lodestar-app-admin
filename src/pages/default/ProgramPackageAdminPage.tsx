import { Button, Icon, Tabs } from 'antd'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import useRouter from 'use-react-router'
import { AdminHeader, AdminHeaderTitle } from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import AppContext from '../../contexts/AppContext'
import { commonMessages, programPackageMessage } from '../../helpers/translation'

const ProgramPackageAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { settings } = useContext(AppContext)
  const {
    match: {
      params: { programPackageId },
    },
  } = useRouter<{ programPackageId: string }>()

  return (
    <>
      <AdminHeader>
        <Link to="/program-packages">
          <Button type="link" className="mr-3">
            <Icon type="arrow-left" />
          </Button>
        </Link>

        <AdminHeaderTitle>{programPackageId}</AdminHeaderTitle>

        <a
          href={`//${settings['host']}/program-packages/${programPackageId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>預覽</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          defaultActiveKey="program"
          // activeKey={activeKey || 'settings'}
          // onChange={key => setActiveKey(key)}
          // renderTabBar={(props, DefaultTabBar) => (
          //   <AdminTabBarWrapper>
          //     <DefaultTabBar {...props} />
          //   </AdminTabBarWrapper>
          // )}
        >
          <Tabs.TabPane key="program" tab={formatMessage(programPackageMessage.label.program)}></Tabs.TabPane>
          <Tabs.TabPane key="basic" tab={formatMessage(commonMessages.label.basicSettings)}></Tabs.TabPane>
          <Tabs.TabPane key="sales" tab={formatMessage(commonMessages.label.salesPlan)}></Tabs.TabPane>
          <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishSettings)}></Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default ProgramPackageAdminPage
