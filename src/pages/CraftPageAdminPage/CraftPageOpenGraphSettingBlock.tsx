import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { handleError, uploadFile } from 'lodestar-app-element/src/helpers'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import { AdminBlock, AdminBlockTitle } from '../../components/admin'
import ImageUploader from '../../components/common/ImageUploader'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { useMutateAppPage } from '../../hooks/appPage'
import { CraftPageAdminProps } from '../../types/craft'

type FieldProps = {
  title: string
  description: string
  image: string
  imageAlt: string
}

const CraftPageOpenGraphSettingBlock: React.VFC<{
  pageAdmin: CraftPageAdminProps | null
  onRefetch?: () => void
}> = ({ pageAdmin, onRefetch }) => {
  const { id: appId } = useApp()
  const { currentMemberId, authToken } = useAuth()
  const { formatMessage } = useIntl()
  const uploadCanceler = useRef<Canceler>()
  const { updateAppPage } = useMutateAppPage()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [ogImage, setOgImage] = useState<File | null>(null)

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
      metaTags: {
        ...pageAdmin.metaTags,
        openGraph: {
          title: values.title,
          description: values.description,
          image: values.image,
          imageAlt: values.imageAlt,
        },
      },
    })
      .then(async () => {
        if (ogImage) {
          const ogImageId = uuid()
          try {
            await uploadFile(`og_images/${appId}/${pageAdmin.id}/${ogImageId}`, ogImage, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
          }
          await updateAppPage({
            pageId: pageAdmin.id,
            metaTags: {
              ...pageAdmin.metaTags,
              openGraph: {
                title: values.title,
                description: values.description,
                image: `https://${process.env.REACT_APP_S3_BUCKET}/og_images/${appId}/${pageAdmin.id}/${ogImageId}`,
                imageAlt: values.imageAlt,
              },
            },
          })
        }
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>{formatMessage(craftPageMessages.label.openGraphSettings)}</AdminBlockTitle>
      <Form
        form={form}
        colon={false}
        requiredMark={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        initialValues={{
          title: pageAdmin?.metaTags?.openGraph?.title,
          description: pageAdmin?.metaTags?.openGraph?.description,
          image: pageAdmin?.metaTags?.openGraph?.image,
          imageAlt: pageAdmin?.metaTags?.openGraph?.imageAlt,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item name="title" label={formatMessage(craftPageMessages.label.ogTitle)}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={formatMessage(craftPageMessages.label.ogDescription)}>
          <Input />
        </Form.Item>
        <Form.Item name="image" label={formatMessage(craftPageMessages.label.ogImage)}>
          <ImageUploader
            file={ogImage}
            initialCoverUrl={pageAdmin?.metaTags?.openGraph?.image}
            onChange={file => setOgImage(file)}
          />
        </Form.Item>
        <Form.Item name="imageAlt" label={formatMessage(craftPageMessages.label.ogImageAlt)}>
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

export default CraftPageOpenGraphSettingBlock