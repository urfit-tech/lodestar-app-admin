import { gql, useMutation } from '@apollo/client'
import { Button, Checkbox, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { isEmpty } from 'ramda'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { v4 as uuid } from 'uuid'
import TagSelector from '../../components/form/TagSelector'
import hasura from '../../hasura'
import { getImageSizedUrl, handleError, isImageUrlResized, uploadFile } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProgramPackageProps } from '../../types/programPackage'
import ImageUploader from '../common/ImageUploader'
import CategorySelector from '../form/CategorySelector'
import programPackageMessages from './translation'

const StyledUploadWarning = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  height: 100%;
`

type FieldProps = {
  title: string
  categoryIds: string[]
  tags: string[]
}

const ProgramPackageBasicForm: React.FC<{
  programPackage: ProgramPackageProps | null
  onRefetch?: () => void
}> = ({ programPackage, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()
  const [updateProgramPackageBasic] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_BASIC,
    hasura.UPDATE_PROGRAM_PACKAGE_BASICVariables
  >(UPDATE_PROGRAM_PACKAGE_BASIC)
  const [updateProgramPackageCover] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_COVER,
    hasura.UPDATE_PROGRAM_PACKAGE_COVERVariables
  >(UPDATE_PROGRAM_PACKAGE_COVER)
  const [loading, setLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)
  const [isUseOriginSizeCoverImage, setIsUseOriginSizeCoverImage] = useState(
    programPackage?.coverUrl === '' || !programPackage?.coverUrl ? false : !isImageUrlResized(programPackage.coverUrl),
  )

  const coverId = uuid()
  const coverUrl = programPackage?.coverUrl || ''

  if (!programPackage) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProgramPackageBasic({
      variables: {
        programPackageId: programPackage.id,
        title: values.title || '',
        programPackageCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          program_package_id: programPackage.id,
          category_id: categoryId,
          position: index,
        })),
        tags: values.tags.map(tag => ({
          name: tag,
          type: '',
        })),
        programPackageTags: values.tags.map((programPackageTag, index) => ({
          program_package_id: programPackage.id,
          tag_name: programPackageTag,
          position: index,
        })),
      },
    })
      .then(async () => {
        if (coverImage) {
          try {
            await uploadFile(`program_package_covers/${appId}/${programPackage.id}/${coverId}`, coverImage, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
          }
        }
        const uploadImageUrl = getImageSizedUrl(
          isUseOriginSizeCoverImage,
          coverImage
            ? `https://${process.env.REACT_APP_S3_BUCKET}/program_package_covers/${appId}/${programPackage.id}/${coverId}`
            : coverUrl,
        )
        await updateProgramPackageCover({
          variables: {
            programPackageId: programPackage.id,
            coverUrl: uploadImageUrl,
          },
        })
      })
      .then(() => {
        onRefetch?.()
        setCoverImage(null)
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      labelAlign="left"
      colon={false}
      hideRequiredMark
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 11 } }}
      initialValues={{
        title: programPackage.title || '',
        categoryIds: programPackage.categories.map(category => category.id),
        tags: programPackage.tags,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(commonMessages.label.title)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.label.title),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item label={formatMessage(commonMessages.label.category)} name="categoryIds">
        <CategorySelector classType="programPackage" />
      </Form.Item>
      <Form.Item label={formatMessage(programPackageMessages.ProgramPackageBasicFrom.tag)} name="tags">
        <TagSelector />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.cover)}>
        <div className="d-flex align-items-center">
          <ImageUploader
            file={coverImage}
            initialCoverUrl={coverUrl}
            onChange={file => {
              setCoverImage(file)
              setIsUseOriginSizeCoverImage(false)
            }}
          />
          {(!isEmpty(coverUrl) || coverImage) && (
            <Checkbox
              className="ml-2"
              checked={isUseOriginSizeCoverImage}
              onChange={e => {
                setIsUseOriginSizeCoverImage(e.target.checked)
              }}
            >
              {formatMessage(programPackageMessages.ProgramPackageBasicFrom.showOriginSize)}
            </Checkbox>
          )}
          {coverImage && (
            <StyledUploadWarning className="ml-2">
              {formatMessage(programPackageMessages.ProgramPackageBasicFrom.notUploaded)}
            </StyledUploadWarning>
          )}
        </div>
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button htmlType="submit" type="primary" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_PROGRAM_PACKAGE_BASIC = gql`
  mutation UPDATE_PROGRAM_PACKAGE_BASIC(
    $programPackageId: uuid!
    $title: String
    $programPackageCategories: [program_package_category_insert_input!]!
    $tags: [tag_insert_input!]!
    $programPackageTags: [program_package_tag_insert_input!]!
  ) {
    update_program_package(where: { id: { _eq: $programPackageId } }, _set: { title: $title }) {
      affected_rows
    }
    delete_program_package_category(where: { program_package_id: { _eq: $programPackageId } }) {
      affected_rows
    }
    insert_program_package_category(objects: $programPackageCategories) {
      affected_rows
    }
    # update tags
    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    delete_program_package_tag(where: { program_package_id: { _eq: $programPackageId } }) {
      affected_rows
    }
    insert_program_package_tag(objects: $programPackageTags) {
      affected_rows
    }
  }
`
const UPDATE_PROGRAM_PACKAGE_COVER = gql`
  mutation UPDATE_PROGRAM_PACKAGE_COVER($programPackageId: uuid!, $coverUrl: String) {
    update_program_package(where: { id: { _eq: $programPackageId } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`

export default ProgramPackageBasicForm
