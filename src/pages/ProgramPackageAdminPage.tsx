import { ArrowLeftOutlined, FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Tabs } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
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
} from '../components/admin'
import ItemsSortingModal from '../components/common/ItemsSortingModal'
import { StyledLayoutContent } from '../components/layout/DefaultLayout'
import ProgramPackageBasicForm from '../components/programPackage/ProgramPackageBasicFrom'
import ProgramPackageDescriptionForm from '../components/programPackage/ProgramPackageDescriptionForm'
import ProgramPackagePlanAdminModal from '../components/programPackage/ProgramPackagePlanAdminModal'
import ProgramPackagePlanCollectionBlock from '../components/programPackage/ProgramPackagePlanCollectionBlock'
import ProgramPackageProgramCollectionBlock from '../components/programPackage/ProgramPackageProgramCollectionBlock'
import ProgramPackageProgramConnectionModal from '../components/programPackage/ProgramPackageProgramConnectionModal'
import ProgramPackagePublishBlock from '../components/programPackage/ProgramPackagePublishBlock'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages, programMessages, programPackageMessages } from '../helpers/translation'
import { useProgramPackage } from '../hooks/programPackage'

const ProgramPackageAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { programPackageId } = useParams<{ programPackageId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { host } = useApp()
  const { programPackage, refetch } = useProgramPackage(programPackageId)
  const [updatePosition] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION,
    hasura.UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTIONVariables
  >(UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION)

  return (
    <>
      <AdminHeader>
        <Link to="/program-packages">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{programPackage?.title || programPackageId}</AdminHeaderTitle>

        <a href={`//${host}/program-packages/${programPackageId}`} target="_blank" rel="noopener noreferrer">
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
              <div className="d-flex justify-content-between align-items-center">
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
                <ItemsSortingModal
                  items={
                    programPackage?.programs.map(program => ({
                      id: program.id,
                      title: program.program.title,
                      programId: program.program.id,
                    })) || []
                  }
                  triggerText={formatMessage(programMessages.ui.sortProgram)}
                  onSubmit={values =>
                    updatePosition({
                      variables: {
                        data: values.map((value, index) => ({
                          id: value.id,
                          program_id: value.programId,
                          program_package_id: programPackageId,
                          position: index,
                        })),
                      },
                    })
                      .then(() => refetch())
                      .catch(handleError)
                  }
                />
              </div>

              <ProgramPackageProgramCollectionBlock
                programPackageId={programPackageId}
                programs={programPackage?.programs || []}
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
                <AdminBlockTitle>{formatMessage(commonMessages.label.description)}</AdminBlockTitle>
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
                renderTrigger={({ setVisible, setProgramPackagePlanType }) => (
                  <div className="d-flex mb-4">
                    <Button
                      icon={<FileAddOutlined />}
                      type="primary"
                      className="mr-2"
                      onClick={() => {
                        setVisible?.(true)
                        setProgramPackagePlanType?.('perpetual')
                      }}
                    >
                      {formatMessage(commonMessages.ui.perpetualPlan)}
                    </Button>
                    <Button
                      icon={<FileAddOutlined />}
                      type="primary"
                      className="mr-2"
                      onClick={() => {
                        setVisible?.(true)
                        setProgramPackagePlanType?.('period')
                      }}
                    >
                      {formatMessage(commonMessages.ui.periodPlan)}
                    </Button>
                    <Button
                      icon={<FileAddOutlined />}
                      type="primary"
                      className="mr-2"
                      onClick={() => {
                        setVisible?.(true)
                        setProgramPackagePlanType?.('subscription')
                      }}
                    >
                      {formatMessage(commonMessages.ui.subscriptionPlan)}
                    </Button>
                  </div>
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

const UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION = gql`
  mutation UPDATE_PROGRAM_PACKAGE_PROGRAM_POSITION_COLLECTION($data: [program_package_program_insert_input!]!) {
    insert_program_package_program(
      objects: $data
      on_conflict: { constraint: program_package_program_pkey, update_columns: position }
    ) {
      affected_rows
    }
  }
`

export default ProgramPackageAdminPage
