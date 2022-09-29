import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError } from 'lodestar-app-element/src/helpers'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { CraftPageAdminProps } from '../../types/craft'

type FieldProps = {
  pageTitle: string
  keywords: string
}

const CraftPageSeoSettingBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const { currentMemberId } = useAuth()
  const { formatMessage } = useIntl()
  const { updateAppPage } = useMutateAppPage()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)

  if (!pageAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    if (!currentMemberId) {
      return
    }
    setLoading(true)
    updateAppPage({
      pageId: pageAdmin.id,
      metaTags: { ...pageAdmin.metaTags, seo: { pageTitle: values.pageTitle, keywords: values.keywords } },
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
      <AdminBlockTitle>{formatMessage(craftPageMessages.label.seoSettings)}</AdminBlockTitle>
      <Form
        form={form}
        colon={false}
        requiredMark={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        initialValues={{
          pageTitle: pageAdmin?.metaTags?.seo?.pageTitle,
          keywords: pageAdmin?.metaTags?.seo?.keywords,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item name="pageTitle" label={formatMessage(craftPageMessages.label.pageTitle)}>
          <Input />
        </Form.Item>
        <Form.Item name="keywords" label={formatMessage(craftPageMessages.label.keywords)}>
          <Input />
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

export default CraftPageSeoSettingBlock
