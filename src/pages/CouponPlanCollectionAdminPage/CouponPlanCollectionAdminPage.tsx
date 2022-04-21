import { FileAddOutlined } from '@ant-design/icons'
import { Button, Input, Tabs } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import CouponPlanAdminModal from '../../components/coupon/CouponPlanAdminModal'
import AdminLayout from '../../components/layout/AdminLayout'
import { DiscountIcon } from '../../images/icon'
import ForbiddenPage from '../ForbiddenPage'
import CouponPlanCollectionBlock from './CouponPlanCollectionBlock'
import CouponPlanCollectionAdminPageMessages from './translation'

const CouponPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [stateCode, setStateCode] = useState(Math.random())

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(CouponPlanCollectionAdminPageMessages['*'].available),
      condition: {
        _or: [
          { started_at: { _lte: 'now()' }, ended_at: { _gte: 'now()' } },
          { started_at: { _is_null: true }, ended_at: { _is_null: true } },
          { started_at: { _lte: 'now()' }, ended_at: { _is_null: true } },
          { started_at: { _is_null: true }, ended_at: { _gte: 'now()' } },
        ],
        title: searchText ? { _ilike: `%${searchText}%` } : undefined,
      },
    },
    {
      key: 'notYet',
      tab: formatMessage(CouponPlanCollectionAdminPageMessages['*'].notYet),
      condition: {
        started_at: { _gt: 'now()' },
        title: searchText ? { _ilike: `%${searchText}%` } : undefined,
      },
    },
    {
      key: 'unavailable',
      tab: formatMessage(CouponPlanCollectionAdminPageMessages['*'].unavailable),
      condition: {
        ended_at: { _lt: 'now()' },
        title: searchText ? { _ilike: `%${searchText}%` } : undefined,
      },
    },
  ]

  if (!permissions.COUPON_PLAN_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <DiscountIcon className="mr-3" />
        <span>{formatMessage(CouponPlanCollectionAdminPageMessages['*'].coupons)}</span>
      </AdminPageTitle>

      <div className="row mb-5">
        <div className="col-8">
          <CouponPlanAdminModal
            renderTrigger={({ setVisible }) => (
              <Button type="primary" onClick={() => setVisible(true)} icon={<FileAddOutlined />}>
                {formatMessage(CouponPlanCollectionAdminPageMessages['*'].createCouponPlan)}
              </Button>
            )}
            icon={<FileAddOutlined />}
            title={formatMessage(CouponPlanCollectionAdminPageMessages['*'].createCouponPlan)}
            onRefetch={() => setStateCode(Math.random())}
          />
        </div>
        <div className="col-4">
          <Input.Search
            placeholder={'search'}
            onChange={e => !e.target.value.trim() && setSearchText('')}
            onSearch={value => setSearchText(value.trim())}
          />
        </div>
      </div>

      <Tabs defaultActiveKey="available">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={`${tabContent.key}_${stateCode}`} tab={tabContent.tab}>
            <CouponPlanCollectionBlock
              key={stateCode}
              condition={tabContent.condition}
              isAvailable={tabContent.key === 'available'}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CouponPlanCollectionAdminPage
