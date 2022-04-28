import Icon, { FileAddOutlined } from '@ant-design/icons'
import { Button, Input, Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as DiscountIcon } from '../..//images/icon/discount.svg'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import VoucherPlanAdminModal from '../../components/voucher/VoucherPlanAdminModal'
import ForbiddenPage from '../ForbiddenPage'
import VoucherPlanCollectionAdminPageMessages from './translation'
import VoucherPlanCollectionBlock from './VoucherPlanCollectionBlock'

const VoucherPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [stateCode, setStateCode] = useState(Math.random())

  const tabContents = [
    {
      key: 'available',
      tab: formatMessage(VoucherPlanCollectionAdminPageMessages['*'].available),
      condition: {
        _or: [
          { ended_at: { _gte: 'now()' } },
          { started_at: { _is_null: true }, ended_at: { _is_null: true } },
          { ended_at: { _is_null: true } },
          { started_at: { _is_null: true }, ended_at: { _gte: 'now()' } },
        ],
        title: searchText ? { _ilike: `%${searchText}%` } : undefined,
        voucher_codes: { remaining: { _nin: [0] } },
      },
    },
    {
      key: 'unavailable',
      tab: formatMessage(VoucherPlanCollectionAdminPageMessages['*'].unavailable),
      condition: {
        _or: [{ voucher_codes: { remaining: { _eq: 0 } } }, { ended_at: { _lt: 'now()' } }],
        title: searchText ? { _ilike: `%${searchText}%` } : undefined,
      },
    },
  ]

  if (Object.keys(enabledModules).length === 0 || Object.keys(permissions).length === 0) {
    return <Skeleton active />
  }

  if (!enabledModules.voucher || !permissions.VOUCHER_PLAN_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(VoucherPlanCollectionAdminPageMessages['*'].vouchers)}</span>
      </AdminPageTitle>

      <div className="row mb-5">
        <div className="col-8">
          <VoucherPlanAdminModal
            renderTrigger={({ setVisible }) => (
              <Button type="primary" onClick={() => setVisible(true)} icon={<FileAddOutlined />}>
                {formatMessage(VoucherPlanCollectionAdminPageMessages['*'].create)}
              </Button>
            )}
            icon={<FileAddOutlined />}
            title={formatMessage(VoucherPlanCollectionAdminPageMessages['*'].createVoucherPlan)}
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

      <Tabs defaultActiveKey="activeKey">
        {tabContents.map(tabContent => (
          <Tabs.TabPane key={`${tabContent.key}_${stateCode}`} tab={tabContent.tab}>
            <VoucherPlanCollectionBlock
              key={stateCode}
              available={tabContent.key === 'available'}
              condition={tabContent.condition}
            />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminLayout>
  )
}

export default VoucherPlanCollectionAdminPage
