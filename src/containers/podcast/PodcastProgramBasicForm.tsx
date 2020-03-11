import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Skeleton, Tooltip } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import LanguageSelector from '../../components/common/LanguageSelector'
import ProgramCategorySelector from '../../components/program/ProgramCategorySelector'
import AppContext from '../../contexts/AppContext'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import types from '../../types'

const PodcastProgramBasicForm: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useContext(AppContext)
  const { loadingPodcastProgram, errorPodcastProgram, podcastProgram, refetchPodcastProgram } = useContext(
    PodcastProgramContext,
  )
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramBasic] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BASIC,
    types.UPDATE_PODCAST_PROGRAM_BASICVariables
  >(UPDATE_PODCAST_PROGRAM_BASIC)

  if (loadingPodcastProgram) {
    return <Skeleton active />
  }

  if (errorPodcastProgram || !podcastProgram) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgramBasic({
        variables: {
          updatedAt: new Date(),
          podcastProgramId: podcastProgram.id,
          title: values.title,
          supportLocales: values.languages,
          podcastCategories: values.categoryIds
            ? values.categoryIds.map((categoryId: string, position: number) => ({
                podcast_program_id: podcastProgram.id,
                category_id: categoryId,
                position,
              }))
            : podcastProgram.categories.map((category, position) => ({
                podcast_program_id: podcastProgram.id,
                category_id: category.id,
                position,
              })),
        },
      })
        .then(() => {
          refetchPodcastProgram && refetchPodcastProgram()
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
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label={formatMessage(podcastMessages.label.podcastProgramTitle)}>
        {form.getFieldDecorator('title', {
          rules: [
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(commonMessages.term.title),
              }),
            },
          ],
          initialValue: podcastProgram.title,
        })(<Input />)}
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)}>
        {form.getFieldDecorator('categoryIds', {
          initialValue: podcastProgram.categories.map(category => category.id),
        })(<ProgramCategorySelector />)}
      </Form.Item>
      {enabledModules.locale && (
        <Form.Item
          label={
            <>
              {formatMessage(commonMessages.label.languages)}
              <Tooltip placement="topLeft" title="當前台為指定語系時才會顯示，若不選擇全語系皆顯示">
                <Icon type="question-circle" theme="filled" className="ml-2" />
              </Tooltip>
            </>
          }
        >
          {form.getFieldDecorator('languages', {
            initialValue: podcastProgram.supportLocales.map(supportLocale => supportLocale),
          })(<LanguageSelector />)}
        </Form.Item>
      )}
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

const UPDATE_PODCAST_PROGRAM_BASIC = gql`
  mutation UPDATE_PODCAST_PROGRAM_BASIC(
    $podcastProgramId: uuid!
    $title: String
    $podcastCategories: [podcast_program_category_insert_input!]!
    $updatedAt: timestamptz!
    $supportLocales: jsonb
  ) {
    update_podcast_program(
      where: { id: { _eq: $podcastProgramId } }
      _set: { title: $title, updated_at: $updatedAt, support_locales: $supportLocales }
    ) {
      affected_rows
    }
    delete_podcast_program_category(where: { podcast_program_id: { _eq: $podcastProgramId } }) {
      affected_rows
    }
    insert_podcast_program_category(objects: $podcastCategories) {
      affected_rows
    }
  }
`

export default Form.create()(PodcastProgramBasicForm)
