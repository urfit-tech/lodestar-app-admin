import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import ProgramCategorySelector from '../../components/program/ProgramCategorySelector'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { handleError } from '../../helpers'
import types from '../../types'

const PodcastProgramBasicForm: React.FC<FormComponentProps> = ({ form }) => {
  const { loadingPodcastProgram, podcastProgram, refetchPodcastProgram } = useContext(PodcastProgramContext)
  const [loading, setLoading] = useState(false)

  const [updatePodcastProgramBasic] = useMutation<
    types.UPDATE_PODCAST_PROGRAM_BASIC,
    types.UPDATE_PODCAST_PROGRAM_BASICVariables
  >(UPDATE_PODCAST_PROGRAM_BASIC)

  if (loadingPodcastProgram || !podcastProgram) {
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
          message.success('儲存成功')
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
      <Form.Item label="廣播名稱">
        {form.getFieldDecorator('title', {
          rules: [{ required: true, message: '請輸入名稱' }],
          initialValue: podcastProgram.title,
        })(<Input />)}
      </Form.Item>
      <Form.Item label="類別">
        {form.getFieldDecorator('categoryIds', {
          initialValue: podcastProgram.categories.map(category => category.id),
        })(<ProgramCategorySelector />)}
      </Form.Item>
      <Form.Item wrapperCol={{ md: { offset: 4 } }}>
        <Button onClick={() => form.resetFields()} className="mr-2">
          取消
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          儲存
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
  ) {
    update_podcast_program(where: { id: { _eq: $podcastProgramId } }, _set: { title: $title, updated_at: $updatedAt }) {
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
