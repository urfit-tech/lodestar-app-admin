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
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import CouponPlanCollectionBlock from './CouponPlanCollectionBlock'

const CouponPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { permissions, currentMemberId } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [stateCode, setStateCode] = useState(Math.random())

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(pageMessages['*'].available),
      condition: {
        _and: [
          {
            _or: [
              { started_at: { _lte: 'now()' }, ended_at: { _gte: 'now()' } },
              { started_at: { _is_null: true }, ended_at: { _is_null: true } },
              { started_at: { _lte: 'now()' }, ended_at: { _is_null: true } },
              { started_at: { _is_null: true }, ended_at: { _gte: 'now()' } },
            ],
          },
          {
            _or: [
              { title: searchText ? { _ilike: `%${searchText}%` } : undefined },
              { coupon_codes: searchText ? { code: { _ilike: `%${searchText}%` } } : undefined },
            ],
          },
        ],
        editor_id:
          permissions.COUPON_PLAN_ADMIN || permissions.COUPON_PLAN_ADMIN_VIEW
            ? undefined
            : permissions.COUPON_PLAN_NORMAL
            ? { _eq: currentMemberId }
            : { _eq: '' },
      },
    },
    {
      key: 'notYet',
      tab: formatMessage(pageMessages['*'].notYet),
      condition: {
        started_at: { _gt: 'now()' },
        _or: [
          { title: searchText ? { _ilike: `%${searchText}%` } : undefined },
          { coupon_codes: searchText ? { code: { _ilike: `%${searchText}%` } } : undefined },
        ],
      },
      editor_id:
        permissions.COUPON_PLAN_ADMIN || permissions.COUPON_PLAN_ADMIN_VIEW
          ? undefined
          : permissions.COUPON_PLAN_NORMAL
          ? { _eq: currentMemberId }
          : { _eq: '' },
    },
    {
      key: 'unavailable',
      tab: formatMessage(pageMessages['*'].unavailable),
      condition: {
        ended_at: { _lt: 'now()' },
        _or: [
          { title: searchText ? { _ilike: `%${searchText}%` } : undefined },
          { coupon_codes: searchText ? { code: { _ilike: `%${searchText}%` } } : undefined },
        ],
      },
      editor_id:
        permissions.COUPON_PLAN_ADMIN || permissions.COUPON_PLAN_ADMIN_VIEW
          ? undefined
          : permissions.COUPON_PLAN_NORMAL
          ? { _eq: currentMemberId }
          : { _eq: '' },
    },
  ]

  if (Object.keys(permissions).length === 0) {
    return <LoadingPage />
  }

  if (!permissions.COUPON_PLAN_ADMIN && !permissions.COUPON_PLAN_NORMAL && !permissions.COUPON_PLAN_ADMIN_VIEW) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <DiscountIcon className="mr-3" />
        <span>{formatMessage(pageMessages['*'].coupons)}</span>
      </AdminPageTitle>

      <div className="row mb-5">
        <div className="col-8">
          {(Boolean(permissions.COUPON_PLAN_ADMIN) || Boolean(permissions.COUPON_PLAN_ADMIN_EDIT)) && (
            <CouponPlanAdminModal
              renderTrigger={({ setVisible }) => (
                <Button type="primary" onClick={() => setVisible(true)} icon={<FileAddOutlined />}>
                  {formatMessage(pageMessages['*'].createCouponPlan)}
                </Button>
              )}
              icon={<FileAddOutlined />}
              title={formatMessage(pageMessages['*'].createCouponPlan)}
              onRefetch={() => setStateCode(Math.random())}
            />
          )}
        </div>
        <div className="col-4">
          <Input.Search
            placeholder={formatMessage(pageMessages.CouponPlanCollectionAdminPage.searchPlaceholder)}
            onChange={e => !e.target.value.trim() && setSearchText('')}
            onSearch={value => setSearchText(value.trim())}
          />
        </div>
      </div>

      <Tabs defaultActiveKey="available">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={`${tabContent.key}_${stateCode}`} tab={tabContent.tab}>
            <CouponPlanCollectionBlock
              condition={tabContent.condition}
              isAvailable={tabContent.key === 'available'}
              stateCode={stateCode}
              onRefetch={() => setStateCode(Math.random())}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default CouponPlanCollectionAdminPage
