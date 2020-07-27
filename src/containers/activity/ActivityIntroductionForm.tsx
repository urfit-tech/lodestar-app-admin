import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, message, Skeleton, Tooltip } from 'antd'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StyledTips } from '../../components/admin'
import AdminBraftEditor from '../../components/admin/AdminBraftEditor'
import { StyledSingleUploader } from '../../components/program/ProgramIntroAdminCard'
import ActivityContext from '../../contexts/ActivityContext'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
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

const ActivityIntroductionForm: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const app = useContext(AppContext)
  const { loadingActivity, errorActivity, activity, refetchActivity } = useContext(ActivityContext)
  const [updateActivityCover] = useMutation<types.UPDATE_ACTIVITY_COVER, types.UPDATE_ACTIVITY_COVERVariables>(
    UPDATE_ACTIVITY_COVER,
  )
  const [updateActivityIntroduction] = useMutation<
    types.UPDATE_ACTIVITY_INTRODUCTION,
    types.UPDATE_ACTIVITY_INTRODUCTIONVariables
  >(UPDATE_ACTIVITY_INTRODUCTION)
  const [loading, setLoading] = useState(false)

  if (loadingActivity) {
    return <Skeleton active />
  }

  if (errorActivity || !activity) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const handleUpdateCover = () => {
    setLoading(true)
    const uploadTime = Date.now()

    updateActivityCover({
      variables: {
        activityId: activity.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/activity_covers/${app.id}/${activity.id}?t=${uploadTime}`,
      },
    })
      .then(() => {
        refetchActivity && refetchActivity()
        message.success(formatMessage(commonMessages.event.successfullySaved))
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
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .catch(error => handleError(error))
        .finally(() => setLoading(false))
    })
  }

  return (
    <Form
      hideRequiredMark
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item
        label={
          <span>
            {formatMessage(commonMessages.term.cover)}
            <Tooltip placement="top" title={<StyledTips>{formatMessage(activityMessages.text.imageTips)}</StyledTips>}>
              <QuestionCircleFilled className="ml-2" />
            </Tooltip>
          </span>
        }
      >
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
              path={`activity_covers/${app.id}/${activity.id}`}
              isPublic
              onSuccess={() => handleUpdateCover()}
            />,
          )}
        </div>
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.description)} wrapperCol={{ md: { span: 20 } }}>
        {form.getFieldDecorator('description', {
          initialValue: BraftEditor.createEditorState(activity.description),
        })(<AdminBraftEditor />)}
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_ACTIVITY_COVER = gql`
  mutation UPDATE_ACTIVITY_COVER($activityId: uuid!, $coverUrl: String) {
    update_activity(where: { id: { _eq: $activityId } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`
const UPDATE_ACTIVITY_INTRODUCTION = gql`
  mutation UPDATE_ACTIVITY_INTRODUCTION($activityId: uuid!, $description: String) {
    update_activity(where: { id: { _eq: $activityId } }, _set: { description: $description }) {
      affected_rows
    }
  }
`

export default Form.create<FormComponentProps>()(ActivityIntroductionForm)
