import { Button, Icon, Tabs } from 'antd'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import useRouter from 'use-react-router'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import ProgramPackageBasicForm from '../../components/programPackage/ProgramPackageBasicFrom'
import ProgramPackageDescriptionForm from '../../components/programPackage/ProgramPackageDescriptionForm'
import AppContext from '../../contexts/AppContext'
import { commonMessages, programPackageMessage } from '../../helpers/translation'
import { useGetProgramPackage } from '../../hooks/programPackage'

const ProgramPackageAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { settings } = useContext(AppContext)
  const [activeKey, setActiveKey] = useState('basic')
  const {
    match: {
      params: { programPackageId: id },
    },
  } = useRouter<{ programPackageId: string }>()
  const { programPackage, refetch } = useGetProgramPackage(id)

  return (
    <>
      <AdminHeader>
        <Link to="/program-packages">
          <Button type="link" className="mr-3">
            <Icon type="arrow-left" />
          </Button>
        </Link>

        <AdminHeaderTitle>{id}</AdminHeaderTitle>

        <a href={`//${settings['host']}/program-packages/${id}`} target="_blank" rel="noopener noreferrer">
          <Button>預覽</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          defaultActiveKey="program"
          activeKey={activeKey}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="program" tab={formatMessage(programPackageMessage.label.program)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(programPackageMessage.label.program)}</AdminPaneTitle>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="basic" tab={formatMessage(commonMessages.label.basicSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminPaneTitle>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(programPackageMessage.label.generalSetting)}</AdminBlockTitle>
                <ProgramPackageBasicForm programPackage={{ id, ...programPackage }} onRefetch={refetch} />
              </AdminBlock>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.term.description)}</AdminBlockTitle>
                <ProgramPackageDescriptionForm programPackage={{ id, ...programPackage }} onRefetch={refetch} />
              </AdminBlock>

              {/* <AdminBlock>
                <AdminBlockTitle>{formatMessage(programPackageMessage.label.deleteProgramPackage)}</AdminBlockTitle>
                <ProgramPackageDeletionBlock />
              </AdminBlock> */}
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="sales" tab={formatMessage(commonMessages.label.salesPlan)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.publishAdmin)}</AdminPaneTitle>

              <AdminBlock></AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default ProgramPackageAdminPage
