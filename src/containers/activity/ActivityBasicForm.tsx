import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Popover, Radio, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import LanguageSelector from '../../components/common/LanguageSelector'
import ProgramCategorySelector from '../../components/program/ProgramCategorySelector'
import ActivityContext from '../../contexts/ActivityContext'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { activityMessages, commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const StyledPopover = styled(Popover)`
  .ant-popover .ant-popover-inner-content {
    padding: 4px 8px;
    border-radius: 4px;
    width: 169px;
    color: white;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.58px;
    background-color: blue;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
  }
  .ant-popover .ant-popover-arrow {
    border-color: var(--gray-dark);
  }
`

const ActivityBasicForm: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { loadingActivity, errorActivity, activity, refetchActivity } = useContext(ActivityContext)
  const { enabledModules } = useContext(AppContext)
  const [updateActivityBasic] = useMutation<types.UPDATE_ACTIVITY_BASIC, types.UPDATE_ACTIVITY_BASICVariables>(
    UPDATE_ACTIVITY_BASIC,
  )
  const [loading, setLoading] = useState(false)

  if (loadingActivity) {
    return <Skeleton active />
  }

  if (errorActivity || !activity) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      const categoryIds: string[] = values.categoryIds

      updateActivityBasic({
        variables: {
          activityId: activity.id,
          title: values.title,
          supportLocales: values.languages,
          activityCategories: categoryIds.map((categoryId, index) => ({
            activity_id: activity.id,
            category_id: categoryId,
            position: index,
          })),
          isParticipantsVisible: values.isParticipantsVisible === 'public',
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
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label={formatMessage(commonMessages.term.title)}>
        {form.getFieldDecorator('title', {
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.title),
              }),
            },
          ],
          initialValue: activity.title,
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)}>
        {form.getFieldDecorator('categoryIds', {
          initialValue: activity.activityCategories.map(activityCategory => activityCategory.category.id),
        })(<ProgramCategorySelector />)}
      </Form.Item>
      {enabledModules.locale && (
        <Form.Item
          label={
            <div>
              {formatMessage(commonMessages.label.languages)}
              <StyledPopover content="當前台為指定語系時才會顯示，若不選擇全語系皆顯示">
                <Icon type="question-circle" theme="filled" className="ml-2" />
              </StyledPopover>
            </div>
          }
        >
          {form.getFieldDecorator('languages', {
            initialValue: activity.supportLocales.map(supportLocale => supportLocale),
          })(<LanguageSelector />)}
        </Form.Item>
      )}
      <Form.Item label={formatMessage(activityMessages.label.showParticipantsNumber)}>
        {form.getFieldDecorator('isParticipantsVisible', {
          initialValue: activity.isParticipantsVisible ? 'public' : 'private',
        })(
          <Radio.Group>
            <Radio value="public">{formatMessage(activityMessages.status.public)}</Radio>
            <Radio value="private">{formatMessage(activityMessages.status.hidden)}</Radio>
          </Radio.Group>,
        )}
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

export default Form.create<FormComponentProps>()(ActivityBasicForm)
