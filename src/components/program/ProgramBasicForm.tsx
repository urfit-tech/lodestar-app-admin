import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Radio, Skeleton, Tooltip } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import TagSelector from '../../containers/common/TagSelector'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramAdminProps } from '../../types/program'
import { StyledTips } from '../admin'
import CategorySelector from '../admin/CategorySelector'
import LanguageSelector from '../admin/LanguageSelector'

const ProgramBasicForm: React.FC<{
  program: ProgramAdminProps | null
  onRefetch?: () => void
}> = ({ program, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { id: appId, enabledModules } = useContext(AppContext)
  const [updateProgramBasic] = useMutation<types.UPDATE_PROGRAM_BASIC, types.UPDATE_PROGRAM_BASICVariables>(
    UPDATE_PROGRAM_BASIC,
  )
  const [loading, setLoading] = useState(false)

  if (!program) {
    return <Skeleton active />
  }

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateProgramBasic({
      variables: {
        programId: program.id,
        title: values.title,
        supportLocales: !values.languages || values.languages.length === 0 ? null : values.languages,
        isIssuesOpen: values.isIssuesOpen,
        programCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          program_id: program.id,
          category_id: categoryId,
          position: index,
        })),
        tags: values.tags.map((programTag: string) => ({
          app_id: appId,
          name: programTag,
          type: '',
        })),
        programTags: values.tags.map((programTag: string, index: number) => ({
          program_id: program.id,
          tag_name: programTag,
          position: index,
        })),
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
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: program.title,
        categoryIds: program.categories.map(category => category.id),
        tags: program.tags,
        languages: program.supportLocales,
        isIssuesOpen: program.isIssuesOpen,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(programMessages.label.programTitle)} name="title">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.category)} name="categoryIds">
        <CategorySelector classType="program" />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.term.tag)} name="tags">
        <TagSelector />
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
      <Form.Item label={formatMessage(programMessages.label.isIssuesOpen)} name="isIssuesOpen">
        <Radio.Group>
          <Radio value={true}>{formatMessage(programMessages.status.active)}</Radio>
          <Radio value={false}>{formatMessage(programMessages.status.closed)}</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_PROGRAM_BASIC = gql`
  mutation UPDATE_PROGRAM_BASIC(
    $programId: uuid!
    $title: String
    $supportLocales: jsonb
    $isIssuesOpen: Boolean
    $programCategories: [program_category_insert_input!]!
    $tags: [tag_insert_input!]!
    $programTags: [program_tag_insert_input!]!
  ) {
    update_program(
      where: { id: { _eq: $programId } }
      _set: { title: $title, support_locales: $supportLocales, is_issues_open: $isIssuesOpen }
    ) {
      affected_rows
    }

    delete_program_category(where: { program_id: { _eq: $programId } }) {
      affected_rows
    }
    insert_program_category(objects: $programCategories) {
      affected_rows
    }

    insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
      affected_rows
    }
    delete_program_tag(where: { program_id: { _eq: $programId } }) {
      affected_rows
    }
    insert_program_tag(objects: $programTags) {
      affected_rows
    }
  }
`

export default ProgramBasicForm
