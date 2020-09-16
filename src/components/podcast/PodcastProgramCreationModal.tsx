import { FileAddOutlined } from '@ant-design/icons'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import AdminModal from '../admin/AdminModal'
import CategorySelector from '../admin/CategorySelector'

const messages = defineMessages({
  createPodcastProgram: { id: 'podcast.ui.createPodcastProgram', defaultMessage: '建立廣播' },
})

const PodcastProgramCreationModal: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const [form] = useForm()
  const [createPodcastProgram] = useMutation<types.CREATE_PODCAST_PROGRAM, types.CREATE_PODCAST_PROGRAMVariables>(
    CREATE_PODCAST_PROGRAM,
  )
  const [loading, setLoading] = useState(false)

  const handleCreate = () => {
    form
      .validateFields()
      .then((values: any) => {
        setLoading(true)
        createPodcastProgram({
          variables: {
            title: values.title,
            creatorId: memberId,
            podcastCategories:
              values.categoryIds?.map((categoryId: string, index: number) => ({
                category_id: categoryId,
                position: index,
              })) || [],
          },
        })
          .then(({ data }) => {
            const podcastProgramId = data?.insert_podcast_program?.returning[0]?.id
            podcastProgramId && history.push(`/podcast-programs/${podcastProgramId}`)
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button icon={<FileAddOutlined />} type="primary" loading={loading} onClick={() => setVisible(true)}>
          {formatMessage(messages.createPodcastProgram)}
        </Button>
      )}
      title={formatMessage(messages.createPodcastProgram)}
      icon={<FileAddOutlined />}
      okText={formatMessage(commonMessages.ui.create)}
      okButtonProps={{ loading }}
      onOk={handleCreate}
    >
      <Form
        form={form}
        layout="vertical"
        colon={false}
        hideRequiredMark
        initialValues={{
          title: 'Untitled',
        }}
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
          <CategorySelector classType="podcastProgram" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const CREATE_PODCAST_PROGRAM = gql`
  mutation CREATE_PODCAST_PROGRAM(
    $title: String!
    $creatorId: String!
    $podcastCategories: [podcast_program_category_insert_input!]!
  ) {
    insert_podcast_program(
      objects: {
        title: $title
        creator_id: $creatorId
        podcast_program_categories: { data: $podcastCategories }
        podcast_program_bodies: { data: { description: "" } }
        podcast_program_roles: { data: { member_id: $creatorId, name: "instructor" } }
      }
    ) {
      affected_rows
      returning {
        id
      }
    }
  }
`

export default PodcastProgramCreationModal
