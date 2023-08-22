import { CopyOutlined, GlobalOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { IconButton } from '@chakra-ui/button'
import { Textarea } from '@chakra-ui/textarea'
import { Button, Form, Input, InputNumber, message, Switch } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { keys, trim } from 'ramda'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../components/admin'
import AdminCard from '../components/admin/AdminCard'
import AdminLayout from '../components/layout/AdminLayout'
import * as hasura from '../hasura'
import { copyToClipboard, handleError } from '../helpers'
import { commonMessages, errorMessages } from '../helpers/translation'
import ForbiddenPage from './ForbiddenPage'
import pageMessages from './translation'

const StyledPassHashBlock = styled.div`
  padding: 12px;
  border: 1px solid #cccccc;
  background-color: #cbe5f3;
  width: fit-content;
`

const AppSecretAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId, secrets: appSecrets } = useApp()
  const { permissions } = useAuth()
  const { data: secretsData, loading } = useQuery<hasura.GET_SECRETS, hasura.GET_SECRETSVariables>(GET_SECRETS, {
    variables: { appId },
  })

  const secrets =
    secretsData?.setting
      .filter(v => v.app_secrets.length)
      .reduce((accum, v) => {
        const appSecrets = [...v.app_secrets]
        const namespace = v.key.includes('.') ? v.key.split('.')[0] : ''
        if (!accum[namespace]) {
          accum[namespace] = {}
        }
        const value = appSecrets.pop()?.value || ''
        accum[namespace][v.key] = {
          value,
          type: v.type,
          options: v.options,
          isProtected: v.is_protected,
          isRequired: v.is_required,
        }
        return accum
      }, {} as Record<string, AppSecrets>) || {}

  if (!permissions.APP_SETTING_ADMIN) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <GlobalOutlined className="mr-3" />
        <span>{formatMessage(commonMessages.menu.appSecretAdmin)}</span>
      </AdminPageTitle>
      {loading && <AdminCard loading className="mb-3" />}
      {keys(secrets)
        .sort()
        .map(namespace => (
          <AppSecretCard
            appId={appId}
            title={namespace}
            secrets={secrets[namespace]}
            appSecrets={appSecrets}
            className="mb-3"
          />
        ))}
      <TemporaryPasswordRequestCard />
    </AdminLayout>
  )
}

type AppSecrets = {
  [key: string]: {
    value: string
    type: string
    options: any
    isProtected: boolean
    isRequired: boolean
  }
}

type FieldProps = { [key: string]: string }

const AppSecretCard: React.FC<
  CardProps & {
    appId: string
    secrets: AppSecrets
    appSecrets: Record<string, string>
  }
> = ({ appId, secrets, appSecrets, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateAppSecrets] = useMutation<hasura.UPSERT_APP_SECRETS, hasura.UPSERT_APP_SECRETSVariables>(
    UPSERT_APP_SECRETS,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    form.validateFields().then(() => {
      setLoading(true)
      updateAppSecrets({
        variables: {
          appSecrets: Object.keys(values)
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
        initialValues={appSecrets}
        requiredMark
      >
        {keys(secrets)
          .sort()
          .map(key => {
            const secret = secrets[key]
            const label = formatMessage({ id: `secret.key.${key}`, defaultMessage: key.toString() })
            return (
              <>
                {secret.type === 'string' && (
                  <Form.Item
                    key={key}
                    label={label}
                    name={key}
                    rules={[{ required: secret.isRequired, whitespace: true }]}
                  >
                    <Input disabled={secret.isProtected} />
                  </Form.Item>
                )}
                {secret.type === 'number' && (
                  <Form.Item key={key} label={label} name={key} required={secret.isRequired}>
                    <InputNumber disabled={secret.isProtected} />
                  </Form.Item>
                )}
                {secret.type === 'boolean' && (
                  <Form.Item key={key} label={label} name={key} required={secret.isRequired}>
                    <Switch disabled={secret.isProtected} />
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

const TemporaryPasswordRequestCard: React.FC<{}> = ({}) => {
  const { currentMember } = useAuth()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [passHash, setPassHash] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [expiredAt, setExpiredAt] = useState<string | null>(null)

  const handleSubmit = async (values: FieldProps) => {
    form.validateFields().then(() => {
      // call lodestar-server api
      // create tmp password
      setLoading(true)
      setLoading(false)
      setPassHash('ksdf@*(RJK@_#@R$JHB')
      setExpiredAt(dayjs('2023-08-21T08:23:12Z').format('YYYY-MM-DD HH:mm:ss'))
    })
  }
  return (
    <AdminCard title={formatMessage(pageMessages.SecretAdminPage.temporaryPasswordRequest)}>
      <Form
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 6 } }}
        wrapperCol={{ md: { span: 18 } }}
        colon={false}
        onFinish={handleSubmit}
        initialValues={{ applicantEmail: currentMember?.email }}
        requiredMark
      >
        <Form.Item label={formatMessage(pageMessages.SecretAdminPage.applicant)} name={'applicantEmail'} required>
          <Input width={200} disabled />
        </Form.Item>
        <Form.Item
          label={formatMessage(pageMessages.SecretAdminPage.userEmail)}
          name={'userEmail'}
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(pageMessages.SecretAdminPage.userEmail),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label={formatMessage(pageMessages.SecretAdminPage.purposeOfApplication)}
          name={'purpose'}
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(pageMessages.SecretAdminPage.purposeOfApplication),
              }),
            },
          ]}
        >
          <Textarea />
        </Form.Item>
        {passHash && expiredAt ? (
          <StyledPassHashBlock>
            <div className="items-center flex">
              <div className="mr-2">
                {formatMessage(pageMessages.SecretAdminPage.tempPassword)}：{passHash}
              </div>
              <IconButton
                aria-label="copy password"
                icon={<CopyOutlined />}
                onClick={() => {
                  copyToClipboard(passHash)
                  message.success(formatMessage(commonMessages.text.copiedToClipboard))
                }}
              />
            </div>
            <div>
              {formatMessage(pageMessages.SecretAdminPage.expirationDate)}：{expiredAt}
            </div>
          </StyledPassHashBlock>
        ) : (
          <Form.Item wrapperCol={{ md: { offset: 6 } }}>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(pageMessages.SecretAdminPage.requestTemporaryPassword)}
            </Button>
          </Form.Item>
        )}
      </Form>
    </AdminCard>
  )
}

const UPSERT_APP_SECRETS = gql`
  mutation UPSERT_APP_SECRETS($appSecrets: [app_secret_insert_input!]!) {
    insert_app_secret(
      objects: $appSecrets
      on_conflict: { update_columns: value, constraint: app_secret_app_id_key_key }
    ) {
      affected_rows
    }
  }
`

const GET_SECRETS = gql`
  query GET_SECRETS($appId: String!) {
    setting(where: { is_secret: { _eq: true } }) {
      key
      type
      options
      is_protected
      is_required
      app_secrets(where: { app_id: { _eq: $appId } }) {
        value
      }
    }
  }
`
export default AppSecretAdminPage
