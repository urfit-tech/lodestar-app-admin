import { Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProgramPackageProps } from '../../types/programPackage'
import { CustomRatioImage } from '../common/Image'
import { CoverBlock, StyledSingleUploader } from '../program/ProgramIntroAdminCard'

type ProgramPackageBasicFormProps = ProgramPackageProps & FormComponentProps

const ProgramPackageBasicForm: React.FC<ProgramPackageBasicFormProps> = ({
  programPackage,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useContext(AppContext)

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
        <StyledSingleUploader
          accept="image/*"
          listType="picture-card"
          path={`program_package_covers/${appId}/${programPackage.id}`}
          showUploadList={false}
          onSuccess={() => {}}
          isPublic
        />
      </Form.Item>
    </Form>
  )
}

export default Form.create<ProgramPackageBasicFormProps>()(ProgramPackageBasicForm)
