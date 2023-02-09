import { Form, Input } from 'antd'
import { CardProps } from 'antd/lib/card'
import { FormListFieldData } from 'antd/lib/form/FormList'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import AdminCard from '../../components/admin/AdminCard'

type AppHostAdminCardProps = CardProps

const AppHostAdminCard: React.VFC<AppHostAdminCardProps> = ({ ...cardProps }) => {
  const { hosts, loading: loadingApp } = useApp()
  const initialValues: Record<string, FormListFieldData[]> = {
    hosts: hosts.map((host, index) => ({
      isListField: true,
      name: index,
      key: index,
      fieldKey: index,
      value: host,
    })),
  }

  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      {!loadingApp && (
        <Form initialValues={initialValues}>
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
                        <Input placeholder="Host" disabled />
                      </Form.Item>
                    </Input.Group>
                  ))}
                </div>
              )
            }}
          </Form.List>
        </Form>
      )}
    </AdminCard>
  )
}

export default AppHostAdminCard
