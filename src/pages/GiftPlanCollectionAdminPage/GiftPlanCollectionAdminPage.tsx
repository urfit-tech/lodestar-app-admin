import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Button, Skeleton, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as DiscountIcon } from '../..//images/icon/discount.svg'
import { AdminPageTitle } from '../../components/admin'
import GiftPlanCollectionAdminModal from '../../components/gift/GiftPlanCollectionAdminModal'
import AdminLayout from '../../components/layout/AdminLayout'
import { commonMessages, promotionMessages } from '../../helpers/translation'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'
import GiftPlanCollectionBlock from './GiftPlanCollectionBlock'

type GiftPlanFields = {
  giftPlanTitle: string
  giftName: string
  shipping: string
}

const GiftPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions, currentMemberId } = useAuth()
  const [createGiftPlanForm] = useForm<GiftPlanFields>()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (setVisible: (visible: boolean) => void) => {
    createGiftPlanForm
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = createGiftPlanForm.getFieldsValue()
        console.log(values)
      })
      .catch(() => {})
  }

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(pageMessages['*'].available),
    },
    {
      key: 'discontinued',
      tab: formatMessage(pageMessages['*'].discontinued),
    },
  ]

  if (Object.keys(enabledModules).length === 0 || Object.keys(permissions).length === 0) {
    return <Skeleton active />
  }

  if (!enabledModules.gift || (!permissions.GIFT_PLAN_ADMIN && !permissions.GIFT_PLAN_NORMAL)) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlan)}</span>
      </AdminPageTitle>
      <div className="row mb-5">
        <div className="col-8">
          <GiftPlanCollectionAdminModal
            title={formatMessage(promotionMessages.ui.createGiftPlan)}
            destroyOnClose
            footer={null}
            renderTrigger={({ setVisible }) => (
              <Button className="mb-4" type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(promotionMessages.ui.createGiftPlan)}
              </Button>
            )}
            renderFooter={({ setVisible }) => (
              <>
                <Button className="mr-2" onClick={() => setVisible(false)}>
                  {formatMessage(commonMessages.ui.cancel)}
                </Button>
                <Button type="primary" loading={loading} onClick={() => handleSubmit(setVisible)}>
                  {formatMessage(commonMessages.ui.confirm)}
                </Button>
              </>
            )}
            maskClosable={false}
            createGiftPlanForm={createGiftPlanForm}
          />
        </div>
      </div>

      <Tabs defaultActiveKey="activeKey">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={tabContent.tab}>
            <GiftPlanCollectionBlock tab={tabContent.key} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default GiftPlanCollectionAdminPage
