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
import { commonMessages } from '../../helpers/translation'
import { MetaTag } from '../../types/general'

type FieldProps = {
  title: string
  description: string
  image: string
  imageAlt: string
}

const OpenGraphSettingsBlock: React.VFC<{
  id?: string
  type: string
  metaTag?: MetaTag | null
  updateMetaTag: (options?: any) => Promise<any>
  onRefetch?: () => void
}> = ({ id, type, metaTag, updateMetaTag, onRefetch }) => {
  const { id: appId } = useApp()
  const { currentMemberId, authToken } = useAuth()
  const { formatMessage } = useIntl()
  const uploadCanceler = useRef<Canceler>()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [ogImage, setOgImage] = useState<File | null>(null)

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
        metaTag: {
          ...metaTag,
          openGraph: {
            title: values.title,
            description: values.description,
            image: values.image,
            imageAlt: values.imageAlt,
          },
        },
      },
    })
      .then(async () => {
        if (ogImage) {
          const ogImageId = uuid()
          try {
            await uploadFile(`og_images/${appId}/${type}/${id}/${ogImageId}`, ogImage, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
          }

          await updateMetaTag({
            variables: {
              id: id,
              metaTag: {
                ...metaTag,
                openGraph: {
                  title: values.title,
                  description: values.description,
                  image: `https://${process.env.REACT_APP_S3_BUCKET}/og_images/${appId}/${type}/${id}/${ogImageId}`,
                  imageAlt: values.imageAlt,
                },
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
      <AdminBlockTitle>{formatMessage(commonMessages.label.openGraphSettings)}</AdminBlockTitle>
      <Form
        form={form}
        colon={false}
        requiredMark={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        initialValues={{
          title: metaTag?.openGraph?.title,
          description: metaTag?.openGraph?.description,
          image: metaTag?.openGraph?.image,
          imageAlt: metaTag?.openGraph?.imageAlt,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item name="title" label={formatMessage(commonMessages.label.ogTitle)}>
          <Input />
        </Form.Item>
        <Form.Item name="description" label={formatMessage(commonMessages.label.ogDescription)}>
          <Input />
        </Form.Item>
        <Form.Item name="image" label={formatMessage(commonMessages.label.ogImage)}>
          <ImageUploader
            file={ogImage}
            initialCoverUrl={metaTag?.openGraph?.image}
            onChange={file => setOgImage(file)}
          />
        </Form.Item>
        <Form.Item name="imageAlt" label={formatMessage(commonMessages.label.ogImageAlt)}>
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

export default OpenGraphSettingsBlock
