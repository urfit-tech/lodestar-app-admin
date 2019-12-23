import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Typography } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React from 'react'
import { InferType } from 'yup'
import { handleError } from '../../helpers'
import { programSchema } from '../../schemas/program'
import types from '../../types'
import AdminCard from '../admin/AdminCard'
import ProgramCategorySelector from './ProgramCategorySelector'

type ProgramBasicAdminCardProps = FormComponentProps & {
  program: InferType<typeof programSchema> | null
  onRefetch?: () => void
}
const ProgramBasicAdminCard: React.FC<ProgramBasicAdminCardProps> = ({ program, form, onRefetch }) => {
  const [updateProgramTitle] = useMutation<types.UPDATE_PROGRAM_TITLE, types.UPDATE_PROGRAM_TITLEVariables>(
    UPDATE_PROGRAM_TITLE,
  )
  const [updateProgramCategories] = useMutation<
    types.UPDATE_PROGRAM_CATEGORIES,
    types.UPDATE_PROGRAM_CATEGORIESVariables
  >(UPDATE_PROGRAM_CATEGORIES)

  const handleSubmit = () => {
    program &&
      form.validateFields((error, values) => {
        if (!error) {
          Promise.all([
            updateProgramTitle({
              variables: { programId: program.id, title: values.title },
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
              message.success('儲存成功')
            })
            .catch(handleError)
        }
      })
  }

  return (
    <AdminCard loading={!program}>
      <Typography.Title className="pb-4" level={4}>
        基本設定
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
          <Form.Item label="課程名稱">
            {form.getFieldDecorator('title', { initialValue: program.title })(<Input />)}
          </Form.Item>
          <Form.Item label="類別">
            {form.getFieldDecorator('categoryIds', {
              initialValue: program.programCategories.map(programCategories => programCategories.category.id),
            })(<ProgramCategorySelector />)}
          </Form.Item>
          <Form.Item wrapperCol={{ md: { offset: 4 } }}>
            <Button onClick={() => form.resetFields()}>取消</Button>
            <Button className="ml-2" type="primary" htmlType="submit">
              儲存
            </Button>
          </Form.Item>
        </Form>
      )}
    </AdminCard>
  )
}

const UPDATE_PROGRAM_TITLE = gql`
  mutation UPDATE_PROGRAM_TITLE($programId: uuid!, $title: String) {
    update_program(_set: { title: $title }, where: { id: { _eq: $programId } }) {
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
