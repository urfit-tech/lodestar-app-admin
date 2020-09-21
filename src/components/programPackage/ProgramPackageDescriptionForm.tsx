import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPackageProps } from '../../types/programPackage'
import AdminBraftEditor from '../form/AdminBraftEditor'

const ProgramPackageDescriptionForm: React.FC<{
  programPackage: ProgramPackageProps | null
  onRefetch?: () => void
}> = ({ programPackage, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updateProgramPackageDescription] = useMutation<
    types.UPDATE_PROGRAM_PACKAGE_DESCRIPTION,
    types.UPDATE_PROGRAM_PACKAGE_DESCRIPTIONVariables
  >(UPDATE_PROGRAM_PACKAGE_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  if (!programPackage) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateProgramPackageDescription({
      variables: {
        programPackageId: programPackage.id,
        description: values.description.toRAW(),
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
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          description: BraftEditor.createEditorState(programPackage.description),
        }}
        onFinish={handleSubmit}
      >
        <Form.Item name="description">
          <AdminBraftEditor />
        </Form.Item>

        <Form.Item>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

const UPDATE_PROGRAM_PACKAGE_DESCRIPTION = gql`
  mutation UPDATE_PROGRAM_PACKAGE_DESCRIPTION($description: String, $programPackageId: uuid!) {
    update_program_package(_set: { description: $description }, where: { id: { _eq: $programPackageId } }) {
      affected_rows
    }
  }
`

export default ProgramPackageDescriptionForm
