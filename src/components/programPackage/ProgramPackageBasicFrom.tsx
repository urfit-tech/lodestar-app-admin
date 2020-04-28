import { Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
import { ProgramPackageProps } from '../../types/programPackage'

type ProgramPackageBasicFormProps = ProgramPackageProps & FormComponentProps

const ProgramPackageBasicForm: React.FC<ProgramPackageBasicFormProps> = ({
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()

  return (
    <Form
      hideRequiredMark
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
      }}
    >
      <Form.Item label={formatMessage(commonMessages.term.title)}>
        {getFieldDecorator('title', {
          initialValue: '',
        })(<Input />)}
      </Form.Item>
    </Form>
  )
}

export default Form.create<ProgramPackageBasicFormProps>()(ProgramPackageBasicForm)
