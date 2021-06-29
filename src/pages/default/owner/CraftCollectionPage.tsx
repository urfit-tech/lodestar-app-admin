import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../../../components/admin'
import CraftPageCollectionTable from '../../../components/craft/CraftPageCollectionTable'
import CraftPageCreationModel from '../../../components/craft/CraftPageCreationModel'
import AdminLayout from '../../../components/layout/AdminLayout'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as PageIcon } from '../../../images/icon/page.svg'

const CraftCollectionPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      //TODO: pages filter published_at is not null
      pages: [],
    },
    {
      key: 'unpublished',
      tab: formatMessage(commonMessages.status.unpublished),
      //TODO: pages filter published_at is null
      pages: [],
    },
  ]

  return (
    <AdminLayout>
      <div className="mb-3 d-flex justify-content-between align-items-center">
        <AdminPageTitle className="d-flex align-items-center mb-0">
          <Icon className="mr-3" component={() => <PageIcon />} />
          <span>{formatMessage(commonMessages.menu.pageSetup)}</span>
        </AdminPageTitle>
      </div>

      <div className="mb-4">
        <CraftPageCreationModel
          visible={isModalVisible}
          icon={<FileAddOutlined />}
          setModalVisible={setIsModalVisible}
        />
      </div>

      <Tabs defaultActiveKey="selling">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.pages.length})`}>
            <AdminPageBlock>
              <CraftPageCollectionTable />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CraftCollectionPage
