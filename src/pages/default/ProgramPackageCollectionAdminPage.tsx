import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Button, Tabs, Typography } from 'antd'
import React, { useContext, useEffect } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import ProductCreationModal from '../../components/common/ProductCreationModal'
import AdminLayout from '../../components/layout/AdminLayout'
import ProgramPackageAdminCard from '../../components/programPackage/ProgramPackageAdminCard'
import AppContext from '../../contexts/AppContext'
import { commonMessages, programPackageMessages } from '../../helpers/translation'
import { useGetProgramPackageCollection, useInsertProgramPackage } from '../../hooks/programPackage'
import { ReactComponent as BookIcon } from '../../images/icon/book.svg'

const ProgramPackageCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { id: appId } = useContext(AppContext)
  const { programPackages, refetch } = useGetProgramPackageCollection(appId)
  const createProgramPackage = useInsertProgramPackage(appId)

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
    refetch()
  }, [refetch])

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
            <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
              {formatMessage(programPackageMessages.ui.createProgramPackage)}
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
