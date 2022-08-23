import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import TagSelector from '../../components/form/TagSelector'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProgramPackageProps } from '../../types/programPackage'
import CategorySelector from '../form/CategorySelector'
import ImageInput from '../form/ImageInput'
import programPackageMessages from './translation'

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
  const [updateProgramPackageBasic] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_BASIC,
    hasura.UPDATE_PROGRAM_PACKAGE_BASICVariables
  >(UPDATE_PROGRAM_PACKAGE_BASIC)
  const [updateProgramPackageCover] = useMutation<
    hasura.UPDATE_PROGRAM_PACKAGE_COVER,
    hasura.UPDATE_PROGRAM_PACKAGE_COVERVariables
  >(UPDATE_PROGRAM_PACKAGE_COVER)
  const [loading, setLoading] = useState(false)
  const coverId = uuid()

  if (!programPackage) {
    return <Skeleton active />
  }

  const handleUpload = () => {
    setLoading(true)
    updateProgramPackageCover({
      variables: {
        programPackageId: programPackage.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/program_package_covers/${appId}/${programPackage.id}/${coverId}/1080`,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateProgramPackageBasic({
      variables: {
        programPackageId: programPackage.id,
        title: values.title,
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
      .then(() => {
        onRefetch?.()
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
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: programPackage.title,
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
        <ImageInput
          path={`program_package_covers/${appId}/${programPackage.id}/${coverId}`}
          image={{
            width: '160px',
            ratio: 9 / 16,
            shape: 'rounded',
          }}
          value={programPackage.coverUrl}
          onChange={() => handleUpload()}
        />
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
