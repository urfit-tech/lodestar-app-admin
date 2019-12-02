import { Button, Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { CustomRatioImage } from '../common/Image'
import SingleUploader from '../common/SingleUploader'
import ProgramCategorySelector from '../program/ProgramCategorySelector'
import { StyledAdminBlock, StyledAdminBlockTitle, StyledAdminPaneTitle } from './PodcastProgramAdminBlock'

const StyledCoverBlock = styled.div`
  max-width: 120px;
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
      <StyledAdminPaneTitle>廣播設定</StyledAdminPaneTitle>

      <BasicAdminBlock />
      <ContentAdminBlock />
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

      updatePodcastProgram({
        onBefore: () => setLoading(true),
        onFinally: () => setLoading(false),
        data: {
          title: values.title,
          categoryIds: values.categoryIds,
        },
      })
    })
  }

  return (
    <StyledAdminBlock>
      <StyledAdminBlockTitle>基本設定</StyledAdminBlockTitle>

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
    </StyledAdminBlock>
  )
}
const BasicAdminBlock = Form.create()(BasicAdminBlockComponent)

const ContentAdminBlockComponent: React.FC<FormComponentProps> = ({ form }) => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      updatePodcastProgram({
        onBefore: () => setLoading(true),
        onFinally: () => setLoading(false),
        data: {
          coverUrl: values.coverUrl,
          abstract: values.abstract,
        },
      })
    })
  }

  return (
    <StyledAdminBlock>
      <StyledAdminBlockTitle>廣播介紹</StyledAdminBlockTitle>

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
        <Form.Item label="廣播封面">
          <div className="d-flex align-items-center">
            <StyledCoverBlock>
              {!!podcastProgramAdmin.coverUrl && (
                <CustomRatioImage src={podcastProgramAdmin.coverUrl} width="100%" ratio={1} />
              )}
            </StyledCoverBlock>
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
                path={`activity_covers/${localStorage.getItem('kolable.app.id')}/${podcastProgramAdmin.id}`}
                isPublic
                onSuccess={() => {
                  handleSubmit()
                }}
              />,
            )}
          </div>
        </Form.Item>
        <Form.Item label="廣播摘要">
          {form.getFieldDecorator('abstract', {
            initialValue: podcastProgramAdmin.categories.map(category => category.id),
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
    </StyledAdminBlock>
  )
}
const ContentAdminBlock = Form.create()(ContentAdminBlockComponent)

export default PodcastProgramSettingsAdminBlock
