import Icon, { FileAddOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../../components/admin'
import CraftPageCollectionBlock from '../../../components/craft/CraftPageCollectionBlock'
import CraftPageCreationModel from '../../../components/craft/CraftPageCreationModel'
import AdminLayout from '../../../components/layout/AdminLayout'
import { commonMessages } from '../../../helpers/translation'
import { ReactComponent as PageIcon } from '../../../images/icon/page.svg'

const CraftCollectionPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const [isModalVisible, setIsModalVisible] = useState(false)

  // const tabContents: {
  //   key: string
  //   tab: string
  // }[] = [
  //   {
  //     key: 'published',
  //     tab: formatMessage(commonMessages.status.published),
  //   },
  //   {
  //     key: 'unpublished',
  //     tab: formatMessage(commonMessages.status.unpublished),
  //   },
  // ]

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

      <CraftPageCollectionBlock />
    </AdminLayout>
  )
}

export default CraftCollectionPage
