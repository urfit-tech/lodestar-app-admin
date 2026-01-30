import Icon, { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../components/admin'
import ProductCreationModal from '../components/common/ProductCreationModal'
import AdminLayout from '../components/layout/AdminLayout'
import ProgramPackageAdminCard from '../components/programPackage/ProgramPackageAdminCard'
import hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages, programPackageMessages } from '../helpers/translation'
import { useProgramPackageCollection } from '../hooks/programPackage'
import { ReactComponent as BookIcon } from '../images/icon/book.svg'
import ForbiddenPage from './ForbiddenPage'

const ProgramPackageCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { id: appId, enabledModules } = useApp()
  const { permissions, currentMemberId } = useAuth()
  const { programPackages, refetch } = useProgramPackageCollection()
  const [createProgramPackage] = useMutation<hasura.INSERT_PROGRAM_PACKAGE, hasura.INSERT_PROGRAM_PACKAGEVariables>(
    INSERT_PROGRAM_PACKAGE,
  )

  const publishedQuantity = programPackages.filter(
    programPackage => !!programPackage.publishedAt === true && programPackage.isPrivate !== true,
  ).length
  const privatePublishedQuantity = programPackages.filter(
    programPackage => !!programPackage.publishedAt === true && programPackage.isPrivate === true,
  ).length
  const tabContents = [
    {
      key: 'published',
      tab: `${formatMessage(commonMessages.status.published)} (${publishedQuantity})`,
      isPublished: true,
    },
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
      isPublished: false,
    },
    {
      key: 'privatelyPublish',
      tab: `${formatMessage(commonMessages.status.privatelyPublish)} (${privatePublishedQuantity})`,
      isPublished: true,
      isPrivate: true,
      hidden: !enabledModules.private_program_package,
    },
  ]

  if (!enabledModules.program_package && !permissions.PROGRAM_PACKAGE_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programPackage)}</span>
      </AdminPageTitle>

      <div className="mb-5">
        {currentMemberId && (
          <ProductCreationModal
            categoryClassType="programPackage"
            renderTrigger={({ setVisible }) => (
              <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(programPackageMessages.ui.createProgramPackage)}
              </Button>
            )}
            onCreate={({ title }) =>
              createProgramPackage({
                variables: {
                  appId,
                  title,
                  creatorId: currentMemberId,
                },
              })
                .then(({ data }) => {
                  refetch().then(() => {
                    const programPackageId = data?.insert_program_package?.returning[0].id
                    programPackageId && history.push(`/program-packages/${programPackageId}`)
                  })
                })
                .catch(handleError)
            }
          />
        )}
      </div>

      <Tabs>
        {tabContents
          .filter(tabContent => !tabContent.hidden)
          .map(tabContent => (
            <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
              <div className="row py-5">
                {programPackages
                  .filter(
                    programPackage =>
                      !!programPackage.publishedAt === tabContent.isPublished &&
                      programPackage.isPrivate === Boolean(tabContent.isPrivate),
                  )
                  .map(programPackage => (
                    <div key={programPackage.id} className="col-md-6 col-lg-4 col-12 mb-5">
                      <ProgramPackageAdminCard
                        id={programPackage.id}
                        coverUrl={programPackage.coverUrl}
                        title={programPackage.title}
                        programPackageEnrollment={programPackage.programPackageEnrollment}
                        listPrice={programPackage.listPrice}
                        salePrice={programPackage.salePrice}
                        periodAmount={programPackage.periodAmount}
                        periodType={programPackage.periodType}
                      />
                    </div>
                  ))}
              </div>
            </Tabs.TabPane>
          ))}
      </Tabs>
    </AdminLayout>
  )
}

const INSERT_PROGRAM_PACKAGE = gql`
  mutation INSERT_PROGRAM_PACKAGE($title: String!, $appId: String!, $creatorId: String!) {
    insert_program_package(objects: { app_id: $appId, title: $title, creator_id: $creatorId }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default ProgramPackageCollectionAdminPage
