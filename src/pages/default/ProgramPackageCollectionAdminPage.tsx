import { Button, Icon, Tabs, Typography } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import CreatorAdminLayout from '../../components/layout/CreatorAdminLayout'
import OwnerAdminLayout from '../../components/layout/OwnerAdminLayout'
import ProgramPackageAdminCard from '../../components/programPackage/ProgramPackageAdminCard'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { commonMessages, programPackageMessage } from '../../helpers/translation'
import { useGetProgramPackageCollection, useInsertProgramPackage } from '../../hooks/programPackage'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

const ProgramPackageCollectionAdminPage: React.FC = () => {
  const { currentUserRole } = useAuth()
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const { id: appId } = useContext(AppContext)
  const { programPackages, refetch } = useGetProgramPackageCollection(appId)
  const createProgramPackage = useInsertProgramPackage(appId)

  const AdminLayout = currentUserRole === 'app-owner' ? OwnerAdminLayout : CreatorAdminLayout

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

  useEffect(() => {
    refetch && refetch()
  }, [])

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
            createProgramPackage(title).then(({ data }) => {
              const programPackageId = data?.insert_program_package?.returning[0].id
              history.push(`/program-packages/${programPackageId}`)
            })
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

export default ProgramPackageCollectionAdminPage
