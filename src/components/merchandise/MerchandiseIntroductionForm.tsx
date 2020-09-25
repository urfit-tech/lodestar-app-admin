import '@ant-design/compatible/assets/index.css'
import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { UploadFile } from 'antd/lib/upload/interface'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
import { StyledTips } from '../admin'
import MultipleUploader from '../common/MultipleUploader'
import MemberShopSelector from './MemberShopSelector'
import MerchandiseImagesUploader from './MerchandiseImagesUploader'

type MerchandiseIntroductionFormProps = {
  merchandise: MerchandiseProps
  merchandiseId: string
  refetch?: () => void
}
const MerchandiseIntroductionForm: React.FC<MerchandiseIntroductionFormProps> = ({
  merchandise,
  merchandiseId,
  refetch,
}) => {
  const { formatMessage } = useIntl()
  const updateMerchandiseImages = useUpdateMerchandiseImages(merchandiseId)
  const updateMerchandiseIntroduction = useUpdateMerchandiseIntroduction(merchandiseId)
  const [loading, setLoading] = useState(false)
  const { id: appId } = useContext(AppContext)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState<UploadFile[]>(merchandise.files || [])
  const [form] = useForm()

  const handleSubmit = () => {
    form.validateFields().then(values => {
      const { abstract, meta, memberShopId } = values
      setLoading(true)
      updateMerchandiseIntroduction({
        abstract,
        meta,
        memberShopId,
        merchandiseFiles: files.map(v => ({
          merchandise_id: merchandise.id,
          data: v,
        })),
      })
        .then(() => {
          refetch && refetch()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .finally(() => setLoading(false))
    })
  }

  const handleUpload = (images: MerchandiseProps['images']) => {
    updateMerchandiseImages({ images }).then(() => refetch && refetch())
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        abstract: merchandise.abstract,
        meta: merchandise.meta,
        memberShopId: merchandise.memberShopId,
      }}
      onFinish={() => handleSubmit()}
    >
      <Form.Item
        label={
          <span>
            {formatMessage(merchandiseMessages.label.images)}
            <Tooltip
              placement="top"
              title={<StyledTips>{formatMessage(merchandiseMessages.text.imageTips)}</StyledTips>}
            >
              <QuestionCircleFilled />
            </Tooltip>
          </span>
        }
        wrapperCol={{ span: 24, md: { span: 16 } }}
      >
        <MerchandiseImagesUploader merchandiseId={merchandiseId} images={merchandise.images} onChange={handleUpload} />
      </Form.Item>
      <Form.Item label={formatMessage(merchandiseMessages.label.abstract)} name="abstract">
        <Input.TextArea rows={5} maxLength={200} placeholder={formatMessage(merchandiseMessages.text.abstractLimit)} />
      </Form.Item>
      <Form.Item
        label={formatMessage(merchandiseMessages.label.meta)}
        name="meta"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(merchandiseMessages.label.meta),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage(merchandiseMessages.label.memberShop)}
        name="memberShopId"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(merchandiseMessages.label.memberShop),
            }),
          },
        ]}
      >
        <MemberShopSelector />
      </Form.Item>
      {!merchandise.isPhysical && (
        <Form.Item label={formatMessage(merchandiseMessages.label.deliveryItem)} wrapperCol={{ span: 24 }}>
          <MultipleUploader
            path={`merchandise_files/${appId}/${merchandise.id}`}
            fileList={files}
            onSetFileList={setFiles}
            uploadText={formatMessage(commonMessages.ui.uploadFile)}
            onUploading={() => setUploading(true)}
            onSuccess={() => setUploading(false)}
            onError={() => setUploading(false)}
          />
        </Form.Item>
      )}

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button
          onClick={() => {
            form.resetFields()
            setFiles(merchandise.files)
          }}
          disabled={uploading}
          className="mr-2"
        >
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading} disabled={uploading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const useUpdateMerchandiseImages = (merchandiseId: string) => {
  const [updateImages] = useMutation<types.UPDATE_MERCHANDISE_IMAGES, types.UPDATE_MERCHANDISE_IMAGESVariables>(gql`
    mutation UPDATE_MERCHANDISE_IMAGES($merchandiseId: uuid!, $merchandiseImages: [merchandise_img_insert_input!]!) {
      delete_merchandise_img(where: { merchandise_id: { _eq: $merchandiseId } }) {
        affected_rows
      }
      insert_merchandise_img(objects: $merchandiseImages) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseImages: (data: {
    images: {
      url: string
      isCover: boolean
    }[]
  }) => Promise<void> = async ({ images }) => {
    try {
      await updateImages({
        variables: {
          merchandiseId,
          merchandiseImages: images.map((image, index) => ({
            merchandise_id: merchandiseId,
            url: image.url,
            type: image.isCover ? 'cover' : 'common',
            position: index,
          })),
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseImages
}

const useUpdateMerchandiseIntroduction = (merchandiseId: string) => {
  const [updateIntroduction] = useMutation<
    types.UPDATE_MERCHANDISE_INTRODUCTION,
    types.UPDATE_MERCHANDISE_INTRODUCTIONVariables
  >(gql`
    mutation UPDATE_MERCHANDISE_INTRODUCTION(
      $merchandiseId: uuid!
      $abstract: String
      $meta: String
      $memberShopId: uuid
      $merchandiseFiles: [merchandise_file_insert_input!]!
    ) {
      update_merchandise(
        where: { id: { _eq: $merchandiseId } }
        _set: { abstract: $abstract, meta: $meta, member_shop_id: $memberShopId }
      ) {
        affected_rows
      }
      delete_merchandise_file(where: { merchandise_id: { _eq: $merchandiseId } }) {
        affected_rows
      }
      insert_merchandise_file(objects: $merchandiseFiles) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseIntroduction: (data: {
    abstract: string
    meta: string
    memberShopId: string
    merchandiseFiles: {
      merchandise_id: string
      data: UploadFile
    }[]
  }) => Promise<void> = async ({ abstract, meta, memberShopId, merchandiseFiles }) => {
    try {
      await updateIntroduction({
        variables: {
          merchandiseId,
          abstract,
          meta,
          memberShopId,
          merchandiseFiles,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseIntroduction
}

export default MerchandiseIntroductionForm
