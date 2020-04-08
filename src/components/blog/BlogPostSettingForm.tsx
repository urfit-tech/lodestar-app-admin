import { Button, Form, Icon, Select, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { BlogPostProps } from '../../types/blog'
import { StyledTips } from '../admin'
import SingleUploader from '../common/SingleUploader'

type BlogPostSettingFormProps = BlogPostProps & FormComponentProps

// repeat styled single uploader
const StyledSingleUploader = styled(SingleUploader)`
  && {
    width: auto;
  }

  .ant-upload.ant-upload-select-picture-card {
    margin: 0;
    height: auto;
    width: 120px;
    border: none;
    background: none;

    .ant-upload {
      padding: 0;
    }
  }
`

const BlogPostSettingForm: React.FC<BlogPostSettingFormProps> = ({
  post,
  onRefetch,
  form: { getFieldDecorator, resetFields, validateFields },
}) => {
  const { formatMessage } = useIntl()

  const handleSubmit = () => {
    validateFields((err, { cover, merchndises }) => {
      if (!err) {
      }
    })
  }
  return (
    <Form
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item
        label={
          <>
            {formatMessage(commonMessages.term.cover)}
            <Tooltip placement="topLeft" title={<StyledTips>建議圖片尺寸：1200*675px</StyledTips>}>
              <Icon type="question-circle" theme="filled" className="ml-2" />
            </Tooltip>
          </>
        }
      >
        {getFieldDecorator('coverImg')(
          <StyledSingleUploader
            accept="image/*"
            listType="picture-card"
            path={''}
            showUploadList={false}
            // onSuccess={() => handleUpdateCover()}
            isPublic
          />,
        )}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)}>
        {getFieldDecorator('merchandises', {
          initialValue: [],
        })(<Select />)}
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
        <Button className="ml-2" type="primary" htmlType="submit">
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Form.create<BlogPostSettingFormProps>()(BlogPostSettingForm)
