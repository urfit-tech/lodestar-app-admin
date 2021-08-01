import { PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import { FormListFieldData } from 'antd/lib/form/FormList'
import gql from 'graphql-tag'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminCard from '../../components/admin/AdminCard'
import { useApp } from '../../contexts/AppContext'
import * as hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'

type AppHostAdminCardProps = CardProps
type FieldProps = { hosts: { value: string }[] }
const AppHostAdminCard: React.VFC<AppHostAdminCardProps> = ({ ...cardProps }) => {
  const { id: appId, hosts, loading: loadingApp } = useApp()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [form] = useForm<FieldProps>()
  const [updateAppHosts] = useMutation<hasura.UPDATE_APP_HOSTS, hasura.UPDATE_APP_HOSTSVariables>(UPDATE_APP_HOSTS)
  const initialValues: Record<string, FormListFieldData[]> = {
    hosts: hosts.map((host, index) => ({
      isListField: true,
      name: index,
      key: index,
      fieldKey: index,
      value: host,
    })),
  }
  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppHosts({
      variables: {
        appId,
        appHosts: values.hosts.map((host, index) => {
          return {
            app_id: appId,
            host: host.value,
            priority: index,
          }
        }),
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }
  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      {!loadingApp && (
        <Form form={form} initialValues={initialValues} onFinish={handleSubmit}>
          <Form.List name="hosts">
            {(fields, { add, remove }) => {
              return (
                <div>
                  {fields.map(field => (
                    <Input.Group compact className="d-flex">
                      <Form.Item
                        {...field}
                        name={[field.name, 'value']}
                        style={{ flex: 1 }}
                        rules={[{ required: true, whitespace: true }]}
                      >
                        <Input placeholder="Host" />
                      </Form.Item>
                      {field.key > 0 && (
                        <Button
                          style={{ width: 100 }}
                          onClick={() => {
                            remove(field.name)
                          }}
                        >
                          Remove
                        </Button>
                      )}
                    </Input.Group>
                  ))}
                  <Form.Item>
                    <Button
                      type="dashed"
                      onClick={() => {
                        add()
                      }}
                      block
                    >
                      <PlusOutlined /> Add host
                    </Button>
                  </Form.Item>
                </div>
              )
            }}
          </Form.List>
          <Form.Item>
            <Button className="mr-2" onClick={() => form.resetFields()}>
              {formatMessage(commonMessages.ui.cancel)}
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      )}
    </AdminCard>
  )
}

const UPDATE_APP_HOSTS = gql`
  mutation UPDATE_APP_HOSTS($appId: String!, $appHosts: [app_host_insert_input!]!) {
    delete_app_host(where: { app_id: { _eq: $appId } }) {
      affected_rows
    }
    insert_app_host(objects: $appHosts, on_conflict: { constraint: app_host_pkey, update_columns: [] }) {
      affected_rows
    }
  }
`

export default AppHostAdminCard
