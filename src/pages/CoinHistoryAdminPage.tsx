import Icon from '@ant-design/icons'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CoinLogTabs from '../components/checkout/CoinLogTabs'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import { ReactComponent as CoinIcon } from '../images/icon/coin.svg'
import LoadingPage from './LoadingPage'
import NotFoundPage from './NotFoundPage'

const CoinHistoryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading: loadingApp, enabledModules } = useApp()

  if (loadingApp) {
    return <LoadingPage />
  }

  if (!enabledModules.coin) {
    return <NotFoundPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <CoinIcon />} className="mr-3" />
        <span>{formatMessage(commonMessages.menu.coinHistory)}</span>
      </AdminPageTitle>

      <CoinLogTabs />
    </AdminLayout>
  )
}

export default CoinHistoryAdminPage
