import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Input, message, Skeleton, Tooltip } from 'antd'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { StyledTips } from '../../components/admin'
import CategorySelector from '../../components/common/CategorySelector'
import LanguageSelector from '../../components/common/LanguageSelector'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import types from '../../types'
import { PodcastProgramProps } from '../../types/podcast'

type PodcastProgramBasicFormProps = FormComponentProps & {
  podcastProgram: PodcastProgramProps | null
  onRefetch?: () => Promise<any>
}
const PodcastProgramBasicForm: React.FC<PodcastProgramBasicFormProps> = ({ form, podcastProgram, onRefetch }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useContext(AppContext)
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramBasic] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BASIC,
    types.UPDATE_PODCAST_PROGRAM_BASICVariables
  >(UPDATE_PODCAST_PROGRAM_BASIC)

  if (!podcastProgram) {
    return <Skeleton active />
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
          supportLocales: !values.languages || values.languages.length === 0 ? null : values.languages,
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
          onRefetch && onRefetch().then(() => message.success(formatMessage(commonMessages.event.successfullySaved)))
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
        })(<CategorySelector classType="podcastProgram" />)}
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

export default Form.create<PodcastProgramBasicFormProps>()(PodcastProgramBasicForm)
