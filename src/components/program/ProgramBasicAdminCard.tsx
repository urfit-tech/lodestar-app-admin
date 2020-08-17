import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { QuestionCircleFilled } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Input, message, Radio, Tooltip, Typography } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import TagSelector from '../../containers/common/TagSelector'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramAdminProps } from '../../types/program'
import { StyledTips } from '../admin'
import AdminCard from '../admin/AdminCard'
import CategorySelector from '../common/CategorySelector'
import LanguageSelector from '../common/LanguageSelector'

type ProgramBasicAdminCardProps = FormComponentProps & {
  program: ProgramAdminProps | null
  onRefetch?: () => void
}
const ProgramBasicAdminCard: React.FC<ProgramBasicAdminCardProps> = ({ program, form, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [updateProgramTitle] = useMutation<types.UPDATE_PROGRAM_TITLE, types.UPDATE_PROGRAM_TITLEVariables>(
    UPDATE_PROGRAM_TITLE,
  )
  const [updateProgramCategories] = useMutation<
    types.UPDATE_PROGRAM_CATEGORIES,
    types.UPDATE_PROGRAM_CATEGORIESVariables
  >(UPDATE_PROGRAM_CATEGORIES)

  const [updateProgramTags] = useMutation<types.UPDATE_PROGRAM_TAGS, types.UPDATE_PROGRAM_TAGSVariables>(
    UPDATE_PROGRAM_TAGS,
  )

  const { id: appId, enabledModules } = useContext(AppContext)

  const handleSubmit = () => {
    program &&
      form.validateFields((error, values) => {
        if (!error) {
          Promise.all([
            updateProgramTitle({
              variables: {
                programId: program.id,
                title: values.title,
                supportLocales: !values.languages || values.languages.length === 0 ? null : values.languages,
                isIssuesOpen: values.isIssuesOpen,
              },
            }),
            updateProgramCategories({
              variables: {
                programId: program.id,
                programCategories: values.categoryIds.map((categoryId: string, idx: number) => ({
                  program_id: program.id,
                  category_id: categoryId,
                  position: idx,
                })),
              },
            }),
            updateProgramTags({
              variables: {
                programId: program.id,
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
            }),
          ])
            .then(() => {
              onRefetch && onRefetch()
              message.success(formatMessage(commonMessages.event.successfullySaved))
            })
            .catch(handleError)
        }
      })
  }

  return (
    <AdminCard loading={!program}>
      <Typography.Title className="pb-4" level={4}>
        {formatMessage(commonMessages.label.basicSettings)}
      </Typography.Title>
      {program && (
        <Form
          colon={false}
          labelAlign="left"
          labelCol={{ md: { span: 4 } }}
          wrapperCol={{ md: { span: 8 } }}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Form.Item label={formatMessage(programMessages.label.programTitle)}>
            {form.getFieldDecorator('title', { initialValue: program.title })(<Input />)}
          </Form.Item>
          <Form.Item label={formatMessage(commonMessages.term.category)}>
            {form.getFieldDecorator('categoryIds', {
              initialValue: program.categories.map(programCategory => programCategory.id),
            })(<CategorySelector classType="program" />)}
          </Form.Item>
          <Form.Item label={formatMessage(commonMessages.term.tag)}>
            {form.getFieldDecorator('tags', {
              initialValue: program.tags.map(programTag => programTag),
            })(<TagSelector />)}
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
                initialValue: program.supportLocales.map(supportLocale => supportLocale),
              })(<LanguageSelector />)}
            </Form.Item>
          )}
          <Form.Item label={formatMessage(programMessages.label.isIssuesOpen)}>
            {form.getFieldDecorator('isIssuesOpen', {
              initialValue: program.isIssuesOpen,
            })(
              <Radio.Group>
                <Radio value={true}>{formatMessage(programMessages.status.active)}</Radio>
                <Radio value={false}>{formatMessage(programMessages.status.closed)}</Radio>
              </Radio.Group>,
            )}
          </Form.Item>
          <Form.Item wrapperCol={{ md: { offset: 4 } }}>
            <Button onClick={() => form.resetFields()}>{formatMessage(commonMessages.ui.cancel)}</Button>
            <Button className="ml-2" type="primary" htmlType="submit">
              {formatMessage(commonMessages.ui.save)}
            </Button>
          </Form.Item>
        </Form>
      )}
    </AdminCard>
  )
}

const UPDATE_PROGRAM_TITLE = gql`
  mutation UPDATE_PROGRAM_TITLE($programId: uuid!, $title: String, $supportLocales: jsonb, $isIssuesOpen: Boolean) {
    update_program(
      _set: { title: $title, support_locales: $supportLocales, is_issues_open: $isIssuesOpen }
      where: { id: { _eq: $programId } }
    ) {
      affected_rows
    }
  }
`

const UPDATE_PROGRAM_CATEGORIES = gql`
  mutation UPDATE_PROGRAM_CATEGORIES($programId: uuid!, $programCategories: [program_category_insert_input!]!) {
    delete_program_category(where: { program_id: { _eq: $programId } }) {
      affected_rows
    }
    insert_program_category(objects: $programCategories) {
      affected_rows
    }
  }
`

const UPDATE_PROGRAM_TAGS = gql`
  mutation UPDATE_PROGRAM_TAGS(
    $programId: uuid!
    $tags: [tag_insert_input!]!
    $programTags: [program_tag_insert_input!]!
  ) {
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

export default Form.create<ProgramBasicAdminCardProps>()(ProgramBasicAdminCard)
