import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Icon, Input, message, Popover, Typography } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import AppContext from '../../contexts/AppContext'
import { handleError } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import types from '../../types'
import { ProgramType } from '../../types/program'
import AdminCard from '../admin/AdminCard'
import LanguageSelector from '../common/LanguageSelector'
import ProgramCategorySelector from './ProgramCategorySelector'

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

type ProgramBasicAdminCardProps = FormComponentProps & {
  program: ProgramType | null
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
  const { enabledModules } = useContext(AppContext)

  const handleSubmit = () => {
    program &&
      form.validateFields((error, values) => {
        if (!error) {
          Promise.all([
            updateProgramTitle({
              variables: { programId: program.id, title: values.title, supportLocales: values.languages },
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
          ])
            .then(() => {
              onRefetch && onRefetch()
              message.success(formatMessage(commonMessages.event.successfullySaved))
            })
            .catch(error => handleError(handleError))
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
          labelCol={{ span: 24, md: { span: 4 } }}
          wrapperCol={{ span: 24, md: { span: 8 } }}
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
              initialValue: program.categories.map(programCategories => programCategories.category.id),
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
                initialValue: program.supportLocales.map(supportLocale => supportLocale),
              })(<LanguageSelector />)}
            </Form.Item>
          )}
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
  mutation UPDATE_PROGRAM_TITLE($programId: uuid!, $title: String, $supportLocales: jsonb) {
    update_program(_set: { title: $title, support_locales: $supportLocales }, where: { id: { _eq: $programId } }) {
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

export default Form.create<ProgramBasicAdminCardProps>()(ProgramBasicAdminCard)
