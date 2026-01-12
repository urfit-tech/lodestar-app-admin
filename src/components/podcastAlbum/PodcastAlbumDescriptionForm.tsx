import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { PodcastAlbum } from '../../types/podcastAlbum'
import AdminBraftEditor from '../form/AdminBraftEditor'

type FieldProps = {
  description: EditorState
}

const PodcastAlbumDescriptionForm: React.FC<{
  podcastAlbum: PodcastAlbum
  onRefetch?: () => void
}> = ({ podcastAlbum, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const [updatePodcastAlbumDescription] = useMutation<
    hasura.UPDATE_PODCAST_ALBUM_DESCRIPTION,
    hasura.UPDATE_PODCAST_ALBUM_DESCRIPTIONVariables
  >(UPDATE_PODCAST_ALBUM_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  if (!podcastAlbum) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updatePodcastAlbumDescription({
      variables: {
        id: podcastAlbum.id,
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
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
      layout="vertical"
      initialValues={{
        description: BraftEditor.createEditorState(podcastAlbum.description),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="description">
        <AdminBraftEditor />
      </Form.Item>

      <Form.Item>
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

const UPDATE_PODCAST_ALBUM_DESCRIPTION = gql`
  mutation UPDATE_PODCAST_ALBUM_DESCRIPTION($id: uuid!, $description: String) {
    update_podcast_album(where: { id: { _eq: $id } }, _set: { description: $description }) {
      affected_rows
    }
  }
`

export default PodcastAlbumDescriptionForm
