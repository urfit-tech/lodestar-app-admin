import { ArrowLeftOutlined, FileAddOutlined } from '@ant-design/icons'
import { Button, Tabs } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
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
import ProgramPackagePlanAdminModal from '../../components/programPackage/ProgramPackagePlanAdminModal'
import ProgramPackagePlanCollectionBlock from '../../components/programPackage/ProgramPackagePlanCollectionBlock'
import ProgramPackageProgramCollectionBlock from '../../components/programPackage/ProgramPackageProgramCollectionBlock'
import ProgramPackageProgramConnectionModal from '../../components/programPackage/ProgramPackageProgramConnectionModal'
import ProgramPackagePublishBlock from '../../components/programPackage/ProgramPackagePublishBlock'
import { useApp } from '../../contexts/AppContext'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import { useGetProgramPackage } from '../../hooks/programPackage'

const ProgramPackageAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { programPackageId } = useParams<{ programPackageId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { settings } = useApp()
  const { programPackage, refetch } = useGetProgramPackage(programPackageId)

  return (
    <>
      <AdminHeader>
        <Link to="/program-packages">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{programPackage?.title || programPackageId}</AdminHeaderTitle>

        <a
          href={`//${settings['host']}/program-packages/${programPackageId}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button>{formatMessage(commonMessages.ui.preview)}</Button>
        </a>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        <Tabs
          activeKey={activeKey || 'programs'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="programs" tab={formatMessage(programPackageMessages.label.program)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(programPackageMessages.label.program)}</AdminPaneTitle>

              <ProgramPackageProgramConnectionModal
                programPackageId={programPackageId}
                programs={
                  programPackage?.programs.map(program => ({
                    id: program.program.id,
                    title: program.program.title,
                    programPackageProgramId: program.id,
                  })) || []
                }
                onRefetch={refetch}
              />
              <ProgramPackageProgramCollectionBlock
                programPackageId={programPackageId}
                programs={programPackage?.programs || []}
                onRefetch={refetch}
              />
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="basic" tab={formatMessage(commonMessages.label.basicSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.basicSettings)}</AdminPaneTitle>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(programPackageMessages.label.generalSetting)}</AdminBlockTitle>
                <ProgramPackageBasicForm programPackage={programPackage} onRefetch={refetch} />
              </AdminBlock>

              <AdminBlock>
                <AdminBlockTitle>{formatMessage(commonMessages.term.description)}</AdminBlockTitle>
                <ProgramPackageDescriptionForm programPackage={programPackage} onRefetch={refetch} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="sales" tab={formatMessage(commonMessages.label.salesPlan)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.salesPlan)}</AdminPaneTitle>

              <ProgramPackagePlanAdminModal
                programPackageId={programPackageId}
                onRefetch={refetch}
                title={formatMessage(commonMessages.ui.createPlan)}
                renderTrigger={({ setVisible }) => (
                  <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                    {formatMessage(commonMessages.ui.createPlan)}
                  </Button>
                )}
              />

              <ProgramPackagePlanCollectionBlock
                programPackageId={programPackageId}
                plans={programPackage?.plans || []}
                onRefetch={refetch}
              />
            </div>
          </Tabs.TabPane>

          <Tabs.TabPane key="publish" tab={formatMessage(commonMessages.label.publishSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(commonMessages.label.publishAdmin)}</AdminPaneTitle>

              <AdminBlock>
                <ProgramPackagePublishBlock programPackage={programPackage} onRefetch={refetch} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default ProgramPackageAdminPage
