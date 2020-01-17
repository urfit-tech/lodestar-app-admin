import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import SingleUploader from '../../components/common/SingleUploader'
import StyledBraftEditor from '../../components/common/StyledBraftEditor'
import ActivityContext from '../../contexts/ActivityContext'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import types from '../../types'

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

const ActivityIntroductionForm: React.FC<FormComponentProps> = ({ form }) => {
  const app = useContext(AppContext)
  const { loadingActivity, errorActivity, activity, refetchActivity } = useContext(ActivityContext)
  const [updateActivityIntroduction] = useMutation<
    types.UPDATE_ACTIVITY_INTRODUCTION,
    types.UPDATE_ACTIVITY_INTRODUCTIONVariables
  >(UPDATE_ACTIVITY_INTRODUCTION)
  const [loading, setLoading] = useState(false)

  if (loadingActivity) {
    return <Skeleton active />
  }

  if (errorActivity || !activity) {
    return <div>讀取錯誤</div>
  }

  const handleUpdateCover = () => {
    setLoading(true)
    const uploadTime = Date.now()

    updateActivityIntroduction({
      variables: {
        activityId: activity.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/activity_covers/${app.id}/${activity.id}?t=${uploadTime}`,
      },
    })
      .then(() => {
        refetchActivity && refetchActivity()
        message.success('儲存成功')
      })
      .catch(error => handleError(error))
      .finally(() => setLoading(false))
  }

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updateActivityIntroduction({
        variables: {
          activityId: activity.id,
          description: values.description.toRAW(),
        },
      })
        .then(() => {
          refetchActivity && refetchActivity()
          message.success('儲存成功')
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
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
          {activity.coverUrl && <StyledCover className="flex-shrink-0 mr-3" src={activity.coverUrl} />}
          {form.getFieldDecorator('coverImg', {
            initialValue: activity.coverUrl && {
              uid: '-1',
              name: activity.title,
              status: 'done',
              url: activity.coverUrl,
            },
          })(
            <StyledSingleUploader
              accept="image/*"
              listType="picture-card"
              showUploadList={false}
              path={`activity_covers/${localStorage.getItem('kolable.app.id')}/${activity.id}`}
              isPublic
              onSuccess={() => handleUpdateCover()}
            />,
          )}
        </div>
      </Form.Item>
      <Form.Item label="描述" wrapperCol={{ md: { span: 20 } }}>
        {form.getFieldDecorator('description', {
          initialValue: BraftEditor.createEditorState(activity.description),
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
  )
}

const UPDATE_ACTIVITY_INTRODUCTION = gql`
  mutation UPDATE_ACTIVITY_INTRODUCTION($activityId: uuid!, $coverUrl: String, $description: String) {
    update_activity(where: { id: { _eq: $activityId } }, _set: { cover_url: $coverUrl, description: $description }) {
      affected_rows
    }
  }
`

export default Form.create<FormComponentProps>()(ActivityIntroductionForm)
