import { Button, Input, Radio } from 'antd'
import Form, { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import React, { useState } from 'react'
import styled from 'styled-components'
import { AdminBlock, AdminBlockTitle, AdminPaneTitle } from '../admin'
import SingleUploader from '../common/SingleUploader'
import StyledBraftEditor from '../common/StyledBraftEditor'
import ProgramCategorySelector from '../program/ProgramCategorySelector'
import { ActivityAdminProps } from './ActivityAdminBlock'

const StyledCover = styled.div<{ src: string }>`
  width: 160px;
  height: 90px;
  overflow: hidden;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 4px;
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

const ActivitySettingsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps
  onUpdateBasic?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      categoryIds: string[]
      isParticipantsVisible: boolean
    },
  ) => void
  onUpdateIntroduction?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      coverUrl: string
      description: string
    },
  ) => void
}> = ({ activityAdmin, onUpdateBasic, onUpdateIntroduction }) => {
  return (
    <div className="container py-5">
      <AdminPaneTitle>相關設定</AdminPaneTitle>

      <BasicAdminBlock
        title={activityAdmin.title}
        categoryIds={activityAdmin.activityCategories.map(activityCategory => activityCategory.category.id)}
        isParticipantsVisible={activityAdmin.isParticipantsVisible}
        onUpdateBasic={onUpdateBasic}
      />

      <IntroductionAdminBlock
        activityId={activityAdmin.id}
        title={activityAdmin.title}
        coverUrl={activityAdmin.coverUrl}
        description={activityAdmin.description}
        onUpdateIntroduction={onUpdateIntroduction}
      />
    </div>
  )
}

type BasicAdminBlockComponentProps = FormComponentProps & {
  title: string
  categoryIds: string[]
  isParticipantsVisible: boolean
  onUpdateBasic?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      title: string
      categoryIds: string[]
      isParticipantsVisible: boolean
    },
  ) => void
}
const BasicAdminBlockComponent: React.FC<BasicAdminBlockComponentProps> = ({
  form,
  title,
  categoryIds,
  isParticipantsVisible,
  onUpdateBasic,
}) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onUpdateBasic) {
        onUpdateBasic(setLoading, {
          title: values.title,
          categoryIds: values.categoryIds,
          isParticipantsVisible: values.isParticipantsVisible === 'public',
        })
      }
    })
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>基本設定</AdminBlockTitle>

      <Form
        hideRequiredMark
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item label="名稱">
          {form.getFieldDecorator('title', {
            rules: [{ required: true, message: '請輸入名稱' }],
            initialValue: title,
          })(<Input />)}
        </Form.Item>
        <Form.Item label="類別">
          {form.getFieldDecorator('categoryIds', {
            initialValue: categoryIds,
          })(<ProgramCategorySelector />)}
        </Form.Item>
        <Form.Item label="顯示人數">
          {form.getFieldDecorator('isParticipantsVisible', {
            initialValue: isParticipantsVisible ? 'public' : 'private',
          })(
            <Radio.Group>
              <Radio value="public">公開</Radio>
              <Radio value="private">不公開</Radio>
            </Radio.Group>,
          )}
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
const BasicAdminBlock = Form.create<BasicAdminBlockComponentProps>()(BasicAdminBlockComponent)

type IntroductionAdminBlockComponentProps = FormComponentProps & {
  activityId: string
  title: string
  coverUrl: string | null
  description: string
  onUpdateIntroduction?: (
    setLoading: React.Dispatch<React.SetStateAction<boolean>>,
    data: {
      coverUrl: string
      description: string
    },
  ) => void
  refetch?: () => void
}
const IntroductionAdminBlockComponent: React.FC<IntroductionAdminBlockComponentProps> = ({
  form,
  activityId,
  title,
  coverUrl,
  description,
  onUpdateIntroduction,
}) => {
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }
      if (onUpdateIntroduction) {
        const uploadTime = Date.now()

        onUpdateIntroduction(setLoading, {
          coverUrl: values.coverImg
            ? `https://${process.env.REACT_APP_S3_PUBLIC_BUCKET}/activity_covers/${localStorage.getItem(
                'kolable.app.id',
              )}/${activityId}?t=${uploadTime}`
            : '',
          description: values.description.toRAW(),
        })
      }
    })
  }

  return (
    <AdminBlock>
      <AdminBlockTitle>活動介紹</AdminBlockTitle>
      <Form
        hideRequiredMark
        labelCol={{ span: 24, md: { span: 4 } }}
        wrapperCol={{ span: 24, md: { span: 8 } }}
        onSubmit={e => {
          e.preventDefault()
          handleSubmit()
        }}
      >
        <Form.Item label="封面">
          <div className="d-flex align-items-center justify-content-between">
            {coverUrl && <StyledCover className="flex-shrink-0 mr-3" src={coverUrl} />}
            {form.getFieldDecorator('coverImg', {
              initialValue: coverUrl && {
                uid: '-1',
                name: title,
                status: 'done',
                url: coverUrl,
              },
            })(
              <StyledSingleUploader
                accept="image/*"
                listType="picture-card"
                showUploadList={false}
                path={`activity_covers/${localStorage.getItem('kolable.app.id')}/${activityId}`}
                isPublic
                onSuccess={() => handleSubmit()}
              />,
            )}
          </div>
        </Form.Item>
        <Form.Item label="描述" wrapperCol={{ md: { span: 20 } }}>
          {form.getFieldDecorator('description', {
            initialValue: BraftEditor.createEditorState(description),
          })(
            <StyledBraftEditor
              language="zh-hant"
              controls={[
                'headings',
                { key: 'font-size', title: '字級' },
                'line-height',
                'text-color',
                'bold',
                'italic',
                'underline',
                'strike-through',
                { key: 'remove-styles', title: '清除樣式' },
                'separator',
                'text-align',
                'separator',
                'list-ol',
                'list-ul',
                'blockquote',
                { key: 'code', title: '程式碼' },
                'separator',
                'media',
                { key: 'link', title: '連結' },
                { key: 'hr', title: '水平線' },
                'separator',
                { key: 'fullscreen', title: '全螢幕' },
              ]}
            />,
          )}
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
const IntroductionAdminBlock = Form.create<IntroductionAdminBlockComponentProps>()(IntroductionAdminBlockComponent)

export default ActivitySettingsAdminBlock
