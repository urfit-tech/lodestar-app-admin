import Icon from '@ant-design/icons'
import { Skeleton } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../components/admin'
import AdminLayout from '../../components/layout/AdminLayout'
import DefaultLayout from '../../components/layout/DefaultLayout'
import VoucherPlanCollectionBlock from '../../components/voucher/VoucherPlanCollectionBlock'
import { useApp } from '../../contexts/AppContext'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as DiscountIcon } from '../../images/icon/discount.svg'
import NotFoundPage from '../NotFoundPage'

const VoucherPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading, enabledModules } = useApp()

  if (loading) {
    return (
      <DefaultLayout>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (!enabledModules.voucher) {
    return <NotFoundPage />
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
