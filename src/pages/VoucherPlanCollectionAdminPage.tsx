import Icon from '@ant-design/icons'
import { Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminLayout from '../components/layout/AdminLayout'
import DefaultLayout from '../components/layout/DefaultLayout'
import VoucherPlanCollectionBlock from '../components/voucher/VoucherPlanCollectionBlock'
import { commonMessages } from '../helpers/translation'
import { ReactComponent as DiscountIcon } from '../images/icon/discount.svg'
import ForbiddenPage from './ForbiddenPage'

const VoucherPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading, enabledModules } = useApp()
  const { permissions } = useAuth()

  if (loading) {
    return (
      <DefaultLayout>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (!enabledModules.voucher || !permissions.VOUCHER_PLAN_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.vouchers)}</span>
      </AdminPageTitle>

      <VoucherPlanCollectionBlock />
    </AdminLayout>
  )
}

export default VoucherPlanCollectionAdminPage
