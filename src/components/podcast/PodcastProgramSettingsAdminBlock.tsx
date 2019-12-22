import { Button, Form, Icon, Input, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle, StyledTips } from '../admin'
import { CustomRatioImage } from '../common/Image'
import SingleUploader from '../common/SingleUploader'
import ProgramCategorySelector from '../program/ProgramCategorySelector'

const StyledCoverBlock = styled.div`
  overflow: hidden;
  width: 120px;
  max-width: 120px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
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

const PodcastProgramSettingsAdminBlock: React.FC = () => {
  return (
    <div className="container py-5">
      <AdminPaneTitle>廣播設定</AdminPaneTitle>

      <BasicAdminBlock />
      <IntroAdminBlock />
    </div>
  )
}

const BasicAdminBlockComponent: React.FC<FormComponentProps> = ({ form }) => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgram({
        onFinally: () => setLoading(false),
        data: {
          title: values.title,
          categoryIds: values.categoryIds,
        },
      })
    })
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>基本設定</AdminBlockTitle>

      <Form
        hideRequiredMark
        colon={false}
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item label="廣播名稱">
          {form.getFieldDecorator('title', {
            rules: [{ required: true, message: '請輸入名稱' }],
            initialValue: podcastProgramAdmin.title,
          })(<Input />)}
        </Form.Item>
        <Form.Item label="類別">
          {form.getFieldDecorator('categoryIds', {
            initialValue: podcastProgramAdmin.categories.map(category => category.id),
          })(<ProgramCategorySelector />)}
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button onClick={() => form.resetFields()} className="mr-2">
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            儲存
          </Button>
        </Form.Item>
      </Form>
    </AdminBlock>
  )
}
const BasicAdminBlock = Form.create()(BasicAdminBlockComponent)

const IntroAdminBlockComponent: React.FC<FormComponentProps> = ({ form }) => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgram({
        onFinally: () => setLoading(false),
        data: {
          coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/podcast_program_covers/${localStorage.getItem(
            'kolable.app.id',
          )}/${podcastProgramAdmin.id}?t=${Date.now()}`,
          abstract: values.abstract,
        },
      })
    })
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>廣播介紹</AdminBlockTitle>

      <Form
        hideRequiredMark
        colon={false}
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item
          label={
            <span>
              <span className="mr-2">廣播封面</span>
              <Tooltip title={<StyledTips>{'建議尺寸：1080*1080px'}</StyledTips>}>
                <Icon type="question-circle" theme="filled" />
              </Tooltip>
            </span>
          }
        >
          <div className="d-flex align-items-center">
            {!!podcastProgramAdmin.coverUrl && (
              <StyledCoverBlock className="mr-4">
                <CustomRatioImage src={podcastProgramAdmin.coverUrl} width="100%" ratio={1} />
              </StyledCoverBlock>
            )}

            {form.getFieldDecorator('coverUrl', {
              initialValue: podcastProgramAdmin.coverUrl && {
                uid: '-1',
                name: podcastProgramAdmin.title,
                status: 'done',
                url: podcastProgramAdmin.coverUrl,
              },
            })(
              <StyledSingleUploader
                accept="image/*"
                listType="picture-card"
                showUploadList={false}
                path={`podcast_program_covers/${localStorage.getItem('kolable.app.id')}/${podcastProgramAdmin.id}`}
                isPublic
                onSuccess={() => handleSubmit()}
              />,
            )}
          </div>
        </Form.Item>
        <Form.Item label="廣播摘要">
          {form.getFieldDecorator('abstract', {
            initialValue: podcastProgramAdmin.abstract,
          })(<Input.TextArea rows={4} />)}
        </Form.Item>
        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button onClick={() => form.resetFields()} className="mr-2">
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            儲存
          </Button>
        </Form.Item>
      </Form>
    </AdminBlock>
  )
}
const IntroAdminBlock = Form.create()(IntroAdminBlockComponent)

export default PodcastProgramSettingsAdminBlock
