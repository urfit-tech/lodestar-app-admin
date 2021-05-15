import Icon, { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Tabs } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { AdminPageTitle } from '../../components/admin'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import ProgramPackageAdminCard from '../../components/programPackage/ProgramPackageAdminCard'
import { useApp } from '../../contexts/AppContext'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import { useGetProgramPackageCollection } from '../../hooks/programPackage'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

const ProgramPackageCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { id: appId } = useApp()
  const { programPackages, refetch } = useGetProgramPackageCollection(appId)
  const [createProgramPackage] = useMutation<hasura.INSERT_PROGRAM_PACKAGE, hasura.INSERT_PROGRAM_PACKAGEVariables>(
    INSERT_PROGRAM_PACKAGE,
  )

  const publishedQuantity = programPackages.filter(programPackage => !!programPackage.publishedAt === true).length
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
  ]

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programPackage)}</span>
      </AdminPageTitle>

      <div className="mb-5">
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
      </div>

      <Tabs>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <div className="row py-5">
              {programPackages
                .filter(programPackage => !!programPackage.publishedAt === tabContent.isPublished)
                .map(programPackage => (
                  <div key={programPackage.id} className="col-md-6 col-lg-4 col-12 mb-5">
                    <ProgramPackageAdminCard
                      id={programPackage.id}
                      coverUrl={programPackage.coverUrl}
                      title={programPackage.title}
                      soldQuantity={programPackage.soldQuantity}
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
  mutation INSERT_PROGRAM_PACKAGE($title: String!, $appId: String!) {
    insert_program_package(objects: { app_id: $appId, title: $title }) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default ProgramPackageCollectionAdminPage
