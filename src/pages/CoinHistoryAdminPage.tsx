import Icon from '@ant-design/icons'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import CoinLogTabs from '../components/coin/MemberCoinAdminBlock'
import AdminLayout from '../components/layout/AdminLayout'
import { commonMessages } from '../helpers/translation'
import { ReactComponent as CoinIcon } from '../images/icon/coin.svg'
import ForbiddenPage from './ForbiddenPage'
import LoadingPage from './LoadingPage'

const CoinHistoryAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loading: loadingApp, enabledModules } = useApp()
  const { permissions } = useAuth()

  if (loadingApp) {
    return <LoadingPage />
  }

  if (!enabledModules.coin || !permissions.COIN_ADMIN) {
    return <ForbiddenPage />
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
