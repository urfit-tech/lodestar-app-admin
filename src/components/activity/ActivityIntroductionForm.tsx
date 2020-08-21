import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { activityMessages, commonMessages } from '../../helpers/translation'
import types from '../../types'
import { ActivityAdminProps } from '../../types/activity'
import { StyledTips } from '../admin'
import AdminBraftEditor from '../admin/AdminBraftEditor'
import ImageInput from '../admin/ImageInput'

const ActivityIntroductionForm: React.FC<{
  activityAdmin: ActivityAdminProps | null
  onRefetch?: () => void
}> = ({ activityAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const app = useContext(AppContext)
  const [updateActivityCover] = useMutation<types.UPDATE_ACTIVITY_COVER, types.UPDATE_ACTIVITY_COVERVariables>(
    UPDATE_ACTIVITY_COVER,
  )
  const [updateActivityIntroduction] = useMutation<
    types.UPDATE_ACTIVITY_INTRODUCTION,
    types.UPDATE_ACTIVITY_INTRODUCTIONVariables
  >(UPDATE_ACTIVITY_INTRODUCTION)
  const [loading, setLoading] = useState(false)

  if (!activityAdmin) {
    return <Skeleton active />
  }

  const handleUpdateCover = () => {
    setLoading(true)
    const uploadTime = Date.now()
    updateActivityCover({
      variables: {
        activityId: activityAdmin.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/activity_covers/${app.id}/${activityAdmin.id}?t=${uploadTime}`,
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateActivityIntroduction({
      variables: {
        activityId: activityAdmin.id,
        description: values.description.toRAW(),
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        description: BraftEditor.createEditorState(activityAdmin.description),
      }}
      onFinish={handleSubmit}
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
        <ImageInput
          path={`activity_covers/${app.id}/${activityAdmin.id}`}
          image={{
            width: '160px',
            ratio: 9 / 16,
            shape: 'rounded',
          }}
          value={activityAdmin.coverUrl}
          onChange={() => handleUpdateCover()}
        />
      </Form.Item>
      <Form.Item
        label={formatMessage(commonMessages.term.description)}
        wrapperCol={{ md: { span: 20 } }}
        name="description"
      >
        <AdminBraftEditor />
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

export default ActivityIntroductionForm
