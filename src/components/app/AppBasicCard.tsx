import { Button, Form, Input, message } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { useAppData, useUpdateApp } from '../../hooks/app'
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
  const { app, refetchApp, loadingApp } = useAppData(appId)
  const updateApp = useUpdateApp()
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: any) => {
    if (!app) {
      return
    }
    setLoading(true)
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
        refetchApp()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminCard {...cardProps} loading={loadingApp}>
      <StyledForm
        form={form}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 12 } }}
        colon={false}
        hideRequiredMark
        initialValues={{
          name: app?.name,
          vimeoProjectId: app?.vimeoProjectId,
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
      </StyledForm>
    </AdminCard>
  )
}

export default AppBasicCard
