import { useMutation } from '@apollo/react-hooks'
import { Button, Icon, Tabs, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, programPackageMessage } from '../../helpers/translation'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

const ProgramPackageCollectionAdminPage: React.FC = () => {
  const { currentUserRole } = useAuth()
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const app = useContext(AppContext)

  const createProgramPackage = useInsertProgramPackage()

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

  const tabContents = [
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
    },
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
    },
  ]

  return (
    <AdminLayout>
      <Typography.Title level={3} className="mb-4">
        <Icon component={() => <BookIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.programPackage)}</span>
      </Typography.Title>

      <div className="mb-5">
        <ProductCreationModal
          classType="programPackage"
          renderTrigger={({ setVisible }) => (
            <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
              {formatMessage(programPackageMessage.ui.createProgramPackage)}
            </Button>
          )}
          onCreate={({ title }) =>
            createProgramPackage({
              variables: {
                title,
                appId: app.id,
              },
            }).then(({ data }) => {
              const programPackageId = data?.insert_program_package?.returning[0].id
              history.push(`/program-packages/${programPackageId}`)
            })
          }
        />
      </div>

      <Tabs>
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}></Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

const useInsertProgramPackage = () => {
  const [createProgramPackage] = useMutation(gql`
    mutation INSERT_PROGRAM_PACKAGE($title: String!, $appId: String!) {
      insert_program_package(objects: { title: $title, app_id: $appId }) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  return createProgramPackage
}

export default ProgramPackageCollectionAdminPage
