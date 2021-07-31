import { GlobalOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { keys } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../../../components/admin'
import AppBasicCard from '../../../components/app/AppBasicCard'
import AppSettingCard, { AppSettings } from '../../../components/app/AppSettingCard'
import AdminLayout from '../../../components/layout/AdminLayout'
import { useApp } from '../../../contexts/AppContext'
import * as hasura from '../../../hasura'
import { commonMessages } from '../../../helpers/translation'
import AppHostAdminCard from './AppHostAdminCard'

const AppAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { data: settingsData } = useQuery<hasura.GET_SETTINGS, hasura.GET_SETTINGSVariables>(GET_SETTINGS, {
    variables: { appId },
  })
  const settings =
    settingsData?.setting.reduce((accum, v) => {
      const namespace = v.key.includes('.') ? v.key.split('.')[0] : ''
      if (!accum[namespace]) {
        accum[namespace] = {}
      }
      accum[namespace][v.key] = {
        value: v.app_settings.pop()?.value || '',
        type: v.type,
        options: v.options,
        isProtected: v.is_protected,
        isRequired: v.is_required,
      }
      return accum
    }, {} as Record<string, AppSettings>) || {}

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <GlobalOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appAdmin)}</span>
      </AdminPageTitle>

      <AppBasicCard appId={appId} title="基本資料" className="mb-3" />

      <AppHostAdminCard className="mb-3" title="App Hosts"></AppHostAdminCard>
      {keys(settings).map(namespace => (
        <AppSettingCard appId={appId} title={namespace} settings={settings[namespace]} className="mb-3" />
      ))}
    </AdminLayout>
  )
}

const GET_SETTINGS = gql`
  query GET_SETTINGS($appId: String!) {
    setting {
      key
      type
      options
      is_protected
      is_required
      app_settings(where: { app_id: { _eq: $appId } }) {
        value
      }
    }
  }
`

export default AppAdminPage
