import { Button, Form, Input, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useUpdateApp } from '../../hooks/app'
import AdminCard from '../admin/AdminCard'
import { StyledForm } from '../layout'

const messages = defineMessages({
  appName: { id: 'app.label.name', defaultMessage: '網站名稱' },
  appVimeoProjectId: { id: 'app.label.vimeoProjectId', defaultMessage: 'Vimeo ID' },
})

const AppBasicCard: React.FC<
  CardProps & {
    appId: string
  }
> = ({ appId, ...cardProps }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { refetch, ...app } = useContext(AppContext)
  const updateApp = useUpdateApp()
  const [updating, setUpdating] = useState(false)

  const handleSubmit = (values: any) => {
    setUpdating(true)
    updateApp({
      variables: {
        appId: app.id,
        name: values.name,
        title: values.title,
        description: values.description,
        vimeoProjectId: values.vimeoProjectId,
      },
    })
      .then(() => {
        setUpdating(false)
        message.success(formatMessage(commonMessages.event.successfullySaved))
        refetch && refetch()
      })
      .catch(error => handleError(error))
  }

  return (
    <AdminCard {...cardProps} loading={updating}>
      <StyledForm
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
          <Button type="primary" htmlType="submit" loading={updating}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </StyledForm>
    </AdminCard>
  )
}

export default AppBasicCard
