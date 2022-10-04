import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { MetaTag } from '../../types/general'
import { AdminBlock, AdminBlockTitle } from '../admin'

type FieldProps = {
  pageTitle: string
  description: string
  keywords: string
}

const SeoSettingsBlock: React.VFC<{
  id?: string
  metaTags?: MetaTag | null
  updateMetaTag: (options?: any) => Promise<any>
  onRefetch?: () => void
}> = ({ id, metaTags, updateMetaTag, onRefetch }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  if (!id) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    if (!currentMemberId) {
      return
    }
    if (!id) {
      message.error(formatMessage(commonMessages.event.failedSave))
      setLoading(false)
      return
    }

    setLoading(true)

    updateMetaTag({
      variables: {
        id: id,
        metaTags: {
          ...metaTags,
          seo: { pageTitle: values.pageTitle, description: values.description, keywords: values.keywords },
        },
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>{formatMessage(commonMessages.label.seoSettings)}</AdminBlockTitle>
      <Form
        form={form}
        colon={false}
        requiredMark={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        initialValues={{
          pageTitle: metaTags?.seo?.pageTitle,
          description: metaTags?.seo?.description,
          keywords: metaTags?.seo?.keywords,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item name="pageTitle" label={formatMessage(commonMessages.label.pageTitle)}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={formatMessage(commonMessages.label.seoDescription)}>
          <Input />
        </Form.Item>
        <Form.Item name="keywords" label={formatMessage(commonMessages.label.keywords)}>
          <Input placeholder={formatMessage(commonMessages.placeholder.useCommaToSeparateKeywords)} />
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button
            className="mr-2"
            onClick={() => {
              form.resetFields()
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </Form>
    </AdminBlock>
  )
}

export default SeoSettingsBlock
