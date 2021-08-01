import { GlobalOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Button, Form, Input, InputNumber, message, Switch } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { keys, trim } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import { useApp } from '../contexts/AppContext'
import * as hasura from '../hasura'
import { handleError } from '../helpers'
import { commonMessages } from '../helpers/translation'

const AppSettingAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { data: settingsData, loading } = useQuery<hasura.GET_SETTINGS, hasura.GET_SETTINGSVariables>(GET_SETTINGS, {
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
        <span>{formatMessage(commonMessages.menu.appSettingAdmin)}</span>
      </AdminPageTitle>
      {loading && <AppSettingCard appId={appId} title="---" settings={{}} loading className="mb-3" />}
      {keys(settings).map(namespace => (
        <AppSettingCard appId={appId} title={namespace} settings={settings[namespace]} className="mb-3" />
      ))}
    </AdminLayout>
  )
}

type AppSettings = {
  [key: string]: {
    value: string
    type: string
    options: any
    isProtected: boolean
    isRequired: boolean
  }
}

type FieldProps = { [key: string]: string }

const AppSettingCard: React.FC<
  CardProps & {
    appId: string
    settings: AppSettings
  }
> = ({ appId, settings, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { loading: loadingApp, refetch: refetchApp, settings: appSettings, ...app } = useApp()
  const [updateAppSettings] = useMutation<hasura.UPSERT_APP_SETTINGS, hasura.UPSERT_APP_SETTINGSVariables>(
    UPSERT_APP_SETTINGS,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppSettings({
      variables: {
        appSettings: Object.keys(values)
          .filter(key => values[key as keyof FieldProps])
          .map(key => ({
            app_id: app.id,
            key,
            value: trim(values[key as keyof FieldProps]),
          })),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        refetchApp?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      <Form
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 6 } }}
        wrapperCol={{ md: { span: 18 } }}
        colon={false}
        hideRequiredMark
        onFinish={handleSubmit}
        initialValues={appSettings}
      >
        {keys(settings)
          .sort()
          .map(key => {
            const setting = settings[key]
            const label = formatMessage({ id: `setting.key.${key}`, defaultMessage: key.toString() })
            return (
              <>
                {setting.type === 'string' && (
                  <Form.Item key={key} label={label} name={key}>
                    <Input disabled={setting.isProtected} />
                  </Form.Item>
                )}
                {setting.type === 'number' && (
                  <Form.Item key={key} label={label} name={key}>
                    <InputNumber disabled={setting.isProtected} />
                  </Form.Item>
                )}
                {setting.type === 'boolean' && (
                  <Form.Item key={key} label={label} name={key}>
                    <Switch disabled={setting.isProtected} />
                  </Form.Item>
                )}
              </>
            )
          })}
        <Form.Item wrapperCol={{ md: { offset: 6 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </Form>
    </AdminCard>
  )
}

const UPSERT_APP_SETTINGS = gql`
  mutation UPSERT_APP_SETTINGS($appSettings: [app_setting_insert_input!]!) {
    insert_app_setting(
      objects: $appSettings
      on_conflict: { update_columns: value, constraint: app_setting_app_id_key_key }
    ) {
      affected_rows
    }
  }
`

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
export default AppSettingAdminPage
