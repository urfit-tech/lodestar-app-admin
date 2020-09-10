import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPackageProps } from '../../types/programPackage'
import ImageInput from '../admin/ImageInput'

const ProgramPackageBasicForm: React.FC<{
  programPackage: ProgramPackageProps | null
  onRefetch?: () => void
}> = ({ programPackage, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { id: appId } = useContext(AppContext)
  const [updateProgramPackageBasic] = useMutation<
    types.UPDATE_PROGRAM_PACKAGE_BASIC,
    types.UPDATE_PROGRAM_PACKAGE_BASICVariables
  >(UPDATE_PROGRAM_PACKAGE_BASIC)
  const [updateProgramPackageCover] = useMutation<
    types.UPDATE_PROGRAM_PACKAGE_COVER,
    types.UPDATE_PROGRAM_PACKAGE_COVERVariables
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
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateProgramPackageBasic({
      variables: {
        programPackageId: programPackage.id,
        title: values.title,
      },
    })
      .then(() => {
        onRefetch && onRefetch()
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
  mutation UPDATE_PROGRAM_PACKAGE_BASIC($programPackageId: uuid!, $title: String) {
    update_program_package(where: { id: { _eq: $programPackageId } }, _set: { title: $title }) {
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
