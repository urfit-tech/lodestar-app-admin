import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProgramPackageProps } from '../../types/programPackage'
import CategorySelector from '../form/CategorySelector'
import ImageInput from '../form/ImageInput'

type FieldProps = {
  title: string
  categoryIds: string[]
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

  if (!programPackage) {
    return <Skeleton active />
  }

  const handleUpload = () => {
    setLoading(true)
    const uploadTime = Date.now()
    updateProgramPackageCover({
      variables: {
        programPackageId: programPackage.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/program_package_covers/${appId}/${programPackage.id}?t=${uploadTime}`,
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
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(commonMessages.term.title)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.term.title),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item label={formatMessage(commonMessages.term.category)} name="categoryIds">
        <CategorySelector classType="programPackage" />
      </Form.Item>

      <Form.Item label={formatMessage(commonMessages.term.cover)}>
        <ImageInput
          path={`program_package_covers/${appId}/${programPackage.id}`}
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
