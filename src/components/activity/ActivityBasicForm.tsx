import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Radio, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { ActivityAdminProps } from '../../types/activity'
import { StyledTips } from '../admin'
import CategorySelector from '../form/CategorySelector'
import LanguageSelector from '../form/LanguageSelector'

type FieldProps = {
  title: string
  categoryIds: string[]
  languages?: string[]
  isParticipantsVisible: 'public' | 'private'
}

const ActivityBasicForm: React.FC<{
  activityAdmin: ActivityAdminProps | null
  onRefetch?: () => void
}> = ({ activityAdmin, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { enabledModules } = useApp()
  const [updateActivityBasic] = useMutation<types.UPDATE_ACTIVITY_BASIC, types.UPDATE_ACTIVITY_BASICVariables>(
    UPDATE_ACTIVITY_BASIC,
  )
  const [loading, setLoading] = useState(false)

  if (!activityAdmin) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateActivityBasic({
      variables: {
        activityId: activityAdmin.id,
        title: values.title,
        supportLocales: values.languages?.length ? values.languages : null,
        activityCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          activity_id: activityAdmin.id,
          category_id: categoryId,
          position: index,
        })),
        isParticipantsVisible: values.isParticipantsVisible === 'public',
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      colon={false}
      hideRequiredMark
      initialValues={{
        title: activityAdmin.title,
        categoryIds: activityAdmin.categories.map(category => category.id),
        languages: activityAdmin.supportLocales.map(supportLocale => supportLocale),
        isParticipantsVisible: activityAdmin.isParticipantsVisible ? 'public' : 'private',
      }}
      onFinish={handleSubmit}
    >
      <Form.Item
        label={formatMessage(commonMessages.term.title)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.term.title),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)} name="categoryIds">
        <CategorySelector classType="activity" />
      </Form.Item>
      {enabledModules.locale && (
        <Form.Item
          label={
            <span>
              {formatMessage(commonMessages.label.languages)}
              <Tooltip placement="top" title={<StyledTips>{formatMessage(commonMessages.text.locale)}</StyledTips>}>
                <QuestionCircleFilled className="ml-2" />
              </Tooltip>
            </span>
          }
          name="languages"
        >
          <LanguageSelector />
        </Form.Item>
      )}
      <Form.Item label={formatMessage(activityMessages.label.showParticipantsNumber)} name="isParticipantsVisible">
        <Radio.Group>
          <Radio value="public">{formatMessage(activityMessages.status.public)}</Radio>
          <Radio value="private">{formatMessage(activityMessages.status.hidden)}</Radio>
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
  )
}

const UPDATE_ACTIVITY_BASIC = gql`
  mutation UPDATE_ACTIVITY_BASIC(
    $activityId: uuid!
    $title: String!
    $isParticipantsVisible: Boolean!
    $activityCategories: [activity_category_insert_input!]!
    $supportLocales: jsonb
  ) {
    update_activity(
      where: { id: { _eq: $activityId } }
      _set: { title: $title, is_participants_visible: $isParticipantsVisible, support_locales: $supportLocales }
    ) {
      affected_rows
    }

    delete_activity_category(where: { activity_id: { _eq: $activityId } }) {
      affected_rows
    }

    insert_activity_category(objects: $activityCategories) {
      affected_rows
    }
  }
`

export default ActivityBasicForm
