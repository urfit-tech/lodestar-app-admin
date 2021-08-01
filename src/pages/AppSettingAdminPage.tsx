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
  const { id: appId, settings: appSettings } = useApp()
  const { data: settingsData, loading } = useQuery<hasura.GET_SETTINGS, hasura.GET_SETTINGSVariables>(GET_SETTINGS, {
    variables: { appId },
  })
  const settings =
    settingsData?.setting.reduce((accum, v) => {
      const namespace = v.key.includes('.') ? v.key.split('.')[0] : ''
      if (!accum[namespace]) {
        accum[namespace] = {}
      }
      const value = v.app_settings.pop()?.value || ''
      accum[namespace][v.key] = {
        value,
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
      {loading && <AdminCard loading className="mb-3" />}
      {keys(settings)
        .sort()
        .map(namespace => (
          <AppSettingCard
            appId={appId}
            title={namespace}
            settings={settings[namespace]}
            appSettings={appSettings}
            className="mb-3"
          />
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
    appSettings: Record<string, string>
  }
> = ({ appId, settings, appSettings, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateAppSettings] = useMutation<hasura.UPSERT_APP_SETTINGS, hasura.UPSERT_APP_SETTINGSVariables>(
    UPSERT_APP_SETTINGS,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    form.validateFields().then(() => {
      setLoading(true)
      updateAppSettings({
        variables: {
          appSettings: Object.keys(values)
            .filter(key => values[key as keyof FieldProps])
            .map(key => ({
              app_id: appId,
              key,
              value: trim(values[key as keyof FieldProps]),
            })),
        },
      })
        .then(() => {
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .catch(handleError)
        .finally(() => setLoading(false))
    })
  }

  return (
    <AdminCard {...cardProps}>
      <Form
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 6 } }}
        wrapperCol={{ md: { span: 18 } }}
        colon={false}
        hideRequiredMark
        onFinish={handleSubmit}
        initialValues={appSettings}
        requiredMark
      >
        {keys(settings)
          .sort()
          .map(key => {
            const setting = settings[key]
            const label = formatMessage({ id: `setting.key.${key}`, defaultMessage: key.toString() })
            return (
              <>
                {setting.type === 'string' && (
                  <Form.Item
                    key={key}
                    label={label}
                    name={key}
                    rules={[{ required: setting.isRequired, whitespace: true }]}
                  >
                    <Input disabled={setting.isProtected} />
                  </Form.Item>
                )}
                {setting.type === 'number' && (
                  <Form.Item key={key} label={label} name={key} required={setting.isRequired}>
                    <InputNumber disabled={setting.isProtected} />
                  </Form.Item>
                )}
                {setting.type === 'boolean' && (
                  <Form.Item key={key} label={label} name={key} required={setting.isRequired}>
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
    setting(where: { is_secret: { _eq: false } }) {
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
