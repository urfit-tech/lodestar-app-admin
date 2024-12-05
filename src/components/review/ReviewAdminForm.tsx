import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Radio, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAdaptedReviewable } from 'lodestar-app-element/src/hooks/review'
import { FC, useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { AdminBlock, AdminBlockTitle } from '../admin'
import ReviewAdminFormMessages from './translation'

type FieldProps = {
  isWritable: boolean
  isItemViewable: boolean
  isScoreViewable: boolean
}

const ReviewAdminForm: FC<{
  path: string
  onRefetch?: () => void
}> = ({ path, onRefetch }) => {
  const { id: appId, enabledModules } = useApp()
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const [loading, setLoading] = useState(false)

  const { data: reviewable, loading: reviewableLoading } = useAdaptedReviewable(path, appId)

  const [upsertReviewable] = useMutation<hasura.UpsertReviewable, hasura.UpsertReviewableVariables>(UpsertReviewable)

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    upsertReviewable({
      variables: {
        path,
        appId,
        ...values,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  if (!path || !appId || reviewableLoading) {
    return <Skeleton active />
  }

  return !enabledModules.customer_review ? (
    <></>
  ) : (
    <AdminBlock>
      <AdminBlockTitle>{formatMessage(ReviewAdminFormMessages.common.title)}</AdminBlockTitle>
      <Form
        form={form}
        colon={false}
        hideRequiredMark
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 8 } }}
        initialValues={{
          isWritable: reviewable?.is_writable,
          isItemViewable: reviewable?.is_item_viewable,
          isScoreViewable: reviewable?.is_score_viewable,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          label={
            <span className="d-flex align-items-center">
              {formatMessage(ReviewAdminFormMessages.option.isWritable)}
            </span>
          }
          name="isWritable"
        >
          <Radio.Group>
            <Radio value={true}>{formatMessage(ReviewAdminFormMessages.common.yes)}</Radio>
            <Radio value={false}>{formatMessage(ReviewAdminFormMessages.common.no)}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={
            <span className="d-flex align-items-center">
              {formatMessage(ReviewAdminFormMessages.option.isItemViewable)}
            </span>
          }
          name="isItemViewable"
        >
          <Radio.Group>
            <Radio value={true}>{formatMessage(ReviewAdminFormMessages.common.yes)}</Radio>
            <Radio value={false}>{formatMessage(ReviewAdminFormMessages.common.no)}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label={
            <span className="d-flex align-items-center">
              {formatMessage(ReviewAdminFormMessages.option.isScoreViewable)}
            </span>
          }
          name="isScoreViewable"
        >
          <Radio.Group>
            <Radio value={true}>{formatMessage(ReviewAdminFormMessages.common.yes)}</Radio>
            <Radio value={false}>{formatMessage(ReviewAdminFormMessages.common.no)}</Radio>
          </Radio.Group>
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
    </AdminBlock>
  )
}

const UpsertReviewable = gql`
  mutation UpsertReviewable(
    $path: String!
    $appId: String!
    $isWritable: Boolean
    $isItemViewable: Boolean
    $isScoreViewable: Boolean
  ) {
    insert_reviewable_one(
      object: {
        app_id: $appId
        path: $path
        is_writable: $isWritable
        is_item_viewable: $isItemViewable
        is_score_viewable: $isScoreViewable
      }
      on_conflict: {
        constraint: reviewable_path_app_id_key
        update_columns: [is_writable, is_item_viewable, is_score_viewable]
      }
    ) {
      app_id
      is_item_viewable
      is_score_viewable
      is_writable
      path
    }
  }
`

export default ReviewAdminForm
