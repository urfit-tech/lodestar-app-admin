import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Tabs } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock, AdminPageTitle } from '../../../components/admin'
import AdminLayout from '../../../components/layout/AdminLayout'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as PageIcon } from '../../../images/icon/page.svg'
import CraftPageCollectionTable from './CraftPageCollectionTable'
import CraftPageCreationModel from './CraftPageCreationModel'

const CraftPageCollectionPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)

  const tabContents = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      //TODO: pages filter published_at is not null
      pages: [
        {
          id: '123',
          pageName: 'pageName',
          path: `${process.env.PUBLIC_URL}/demo`,
          updatedAt: new Date('2021-06-26T14:55:47.665035+00:00'),
          editor: '修改人員',
        },
      ],
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

      <Tabs defaultActiveKey="published">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${tabContent.pages.length})`}>
            <AdminPageBlock>
              <CraftPageCollectionTable pages={tabContent.pages} />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CraftPageCollectionPage
