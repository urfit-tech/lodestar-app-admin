import { Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProgramPackageProps } from '../../types/programPackage'
import { CustomRatioImage } from '../common/Image'
import { CoverBlock } from '../program/ProgramIntroAdminCard'

type ProgramPackageBasicFormProps = ProgramPackageProps & FormComponentProps

const ProgramPackageBasicForm: React.FC<ProgramPackageBasicFormProps> = ({
  programPackageId,
  programPackage,
  onRefetch,
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
          initialValue: programPackage.title,
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.title),
              }),
            },
          ],
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.cover)}>
        {programPackage.coverUrl && (
          <CoverBlock>
            <CustomRatioImage src={programPackage.coverUrl} width="100%" ratio={9 / 16} />
          </CoverBlock>
        )}
      </Form.Item>
    </Form>
  )
}

export default Form.create<ProgramPackageBasicFormProps>()(ProgramPackageBasicForm)
