import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import AdminCard from '../admin/AdminCard'

const messages = defineMessages({
  appName: { id: 'app.label.name', defaultMessage: '網站名稱' },
  appVimeoProjectId: { id: 'app.label.vimeoProjectId', defaultMessage: 'Vimeo ID' },
})

type FieldProps = {
  name: string
  vimeoProjectId: string
}

const AppBasicCard: React.FC<
  CardProps & {
    appId: string
  }
> = ({ appId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { loading: loadingApp, refetch, ...app } = useApp()
  const [updateAppBasic] = useMutation<types.UPDATE_APP_BASIC, types.UPDATE_APP_BASICVariables>(UPDATE_APP_BASIC)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateAppBasic({
      variables: {
        appId: app.id,
        name: values.name,
        vimeoProjectId: values.vimeoProjectId,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        refetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      <Form
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 12 } }}
        initialValues={{
          name: app.name,
          vimeoProjectId: app.vimeoProjectId,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label={formatMessage(messages.appName)}
          name="name"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(messages.appName),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item label={formatMessage(messages.appVimeoProjectId)} name="vimeoProjectId">
          <Input />
        </Form.Item>

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
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

const UPDATE_APP_BASIC = gql`
  mutation UPDATE_APP_BASIC(
    $appId: String!
    $name: String
    $title: String
    $description: String
    $vimeoProjectId: String
  ) {
    update_app(
      where: { id: { _eq: $appId } }
      _set: { name: $name, title: $title, description: $description, vimeo_project_id: $vimeoProjectId }
    ) {
      affected_rows
    }
  }
`

export default AppBasicCard
