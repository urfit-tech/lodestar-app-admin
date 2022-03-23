import { PlusOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Select } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import { FormListFieldData } from 'antd/lib/form/FormList'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminCard from '../../components/admin/AdminCard'
import * as hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { AppProps } from '../../types/app'

const blocks = ['header', 'footer', 'social_media'] as const

type AppNavAdminCardProps = CardProps
type FieldProps = Record<typeof blocks[number], AppProps['navs'][number][]>
const AppNavAdminCard: React.VFC<AppNavAdminCardProps> = ({ ...cardProps }) => {
  const { id: appId, navs, loading: loadingApp } = useApp()
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)
  const [form] = useForm<FieldProps>()
  const [updateAppNavs] = useMutation<hasura.UPDATE_APP_NAVS, hasura.UPDATE_APP_NAVSVariables>(UPDATE_APP_NAVS)
  const initialValues = blocks.reduce((accum, block) => {
    accum[block] = navs
      .filter(nav => nav.block === block)
      .map((nav, index) => ({
        isListField: true,
        name: index,
        key: index,
        fieldKey: index,
        ...nav,
      }))
    return accum
  }, {} as Record<string, FormListFieldData[]>)
  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppNavs({
      variables: {
        appId,
        appNavs: blocks.flatMap(block =>
          values[block].map((nav, index) => {
            return {
              app_id: appId,
              block,
              label: nav.label,
              href: nav.href,
              tag: nav.tag,
              external: nav.external,
              position: index,
              icon: nav.icon,
              locale: nav.locale,
              parent_id: nav.parentId,
            }
          }),
        ),
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
          {blocks.map(block => (
            <div className="mb-5">
              <h3 className="mb-3 text-center">{block}</h3>
              <Form.List key={block} name={block}>
                {(fields, { add, remove }) => {
                  return (
                    <div>
                      {fields.map(field => (
                        <Input.Group compact className="d-flex">
                          <Form.Item
                            {...field}
                            name={[field.name, 'label']}
                            style={{ flex: 1 }}
                            rules={[{ required: true, whitespace: true, message: 'required' }]}
                          >
                            <Input placeholder="label" />
                          </Form.Item>
                          <Form.Item
                            {...field}
                            name={[field.name, 'href']}
                            style={{ flex: 1 }}
                            rules={[{ required: true, whitespace: true, message: 'required' }]}
                          >
                            <Input placeholder="href" />
                          </Form.Item>
                          <Form.Item {...field} name={[field.name, 'tag']} style={{ width: 100 }}>
                            <Input placeholder="tag" />
                          </Form.Item>
                          <Form.Item {...field} name={[field.name, 'external']} style={{ width: 120 }}>
                            <ExternalSelector />
                          </Form.Item>
                          <Button
                            style={{ width: 100 }}
                            onClick={() => {
                              remove(field.name)
                            }}
                          >
                            Remove
                          </Button>
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
                          <PlusOutlined /> Add {block}
                        </Button>
                      </Form.Item>
                    </div>
                  )
                }}
              </Form.List>
            </div>
          ))}
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

const ExternalSelector: React.VFC<{ value?: boolean; onChange?: (value: boolean) => void }> = ({ value, onChange }) => {
  const v = value ? 'external' : 'internal'
  return (
    <Select value={v} onChange={u => onChange?.(u === 'external')}>
      <Select.Option value="external">External</Select.Option>
      <Select.Option value="internal">Internal</Select.Option>
    </Select>
  )
}

const UPDATE_APP_NAVS = gql`
  mutation UPDATE_APP_NAVS($appId: String!, $appNavs: [app_nav_insert_input!]!) {
    delete_app_nav(where: { app_id: { _eq: $appId } }) {
      affected_rows
    }
    insert_app_nav(objects: $appNavs, on_conflict: { constraint: app_nav_pkey, update_columns: [] }) {
      affected_rows
    }
  }
`

export default AppNavAdminCard
