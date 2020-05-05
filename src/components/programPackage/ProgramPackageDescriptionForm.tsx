import { useMutation } from '@apollo/react-hooks'
import { Button, message } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import { ExecutionResult } from 'graphql'
import gql from 'graphql-tag'
import React from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramPackageProps } from '../../types/programPackage'
import AdminBraftEditor from '../admin/AdminBraftEditor'

type ProgramPackageDescriptionFromProps = {
  programPackage: ProgramPackageProps
  onRefetch?: () => void
} & FormComponentProps

const ProgramPackageDescriptionForm: React.FC<ProgramPackageDescriptionFromProps> = ({
  programPackage,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()
  const updateProgramPackageDescription = useUpdateProgramPackageDescription(programPackage.id)
  const handleSubmit = () => {
    validateFields((err, { description }) => {
      if (!err) {
        updateProgramPackageDescription(description.toRAW())
          .then(() => {
            onRefetch && onRefetch()
            message.success(formatMessage(commonMessages.event.successfullySaved))
          })
          .catch(handleError)
      }
    })
  }

  return (
    <>
      <Form
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item>
          {getFieldDecorator('description', {
            initialValue: programPackage.description && BraftEditor.createEditorState(programPackage.description),
          })(<AdminBraftEditor />)}
        </Form.Item>
        <Form.Item>
          <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
          <Button className="ml-2" type="primary" htmlType="submit">
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

const useUpdateProgramPackageDescription: (
  programPackageId: string,
) => (description: string) => Promise<ExecutionResult<types.UPDATE_PROGRAM_PACKAGE_DESCIRPTION>> = (
  programPackageId: string,
) => {
  const [updateProgramPackageDescriptionHandler] = useMutation<
    types.UPDATE_PROGRAM_PACKAGE_DESCIRPTION,
    types.UPDATE_PROGRAM_PACKAGE_DESCIRPTIONVariables
  >(gql`
    mutation UPDATE_PROGRAM_PACKAGE_DESCIRPTION($description: String, $programPackageId: uuid!) {
      update_program_package(_set: { description: $description }, where: { id: { _eq: $programPackageId } }) {
        affected_rows
      }
    }
  `)

  const updateProgramPackageDescription = (description: string) => {
    return updateProgramPackageDescriptionHandler({
      variables: {
        programPackageId,
        description,
      },
    })
  }

  return updateProgramPackageDescription
}

export default Form.create<ProgramPackageDescriptionFromProps>()(ProgramPackageDescriptionForm)
