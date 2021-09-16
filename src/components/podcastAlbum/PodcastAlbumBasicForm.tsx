import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios, { Canceler } from 'axios'
import gql from 'graphql-tag'
import React, { useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import hasura from '../../hasura'
import { handleError, uploadFile } from '../../helpers'
import { commonMessages, programMessages } from '../../helpers/translation'
import { PodcastAlbum } from '../../types/podcastAlbum'
import ImageUploader from '../common/ImageUploader'
import CategorySelector from '../form/CategorySelector'

type FieldProps = {
  title: string
  categoryIds: string[]
}

const PodcastAlbumBasicForm: React.FC<{
  podcastAlbum: PodcastAlbum | null
  onRefetch?: () => void
}> = ({ podcastAlbum, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()

  const { id: appId } = useApp()
  const { authToken } = useAuth()
  const uploadCanceler = useRef<Canceler>()

  const [updatePodcastAlbumBasic] = useMutation<
    hasura.UPDATE_PODCAST_ALBUM_BASIC,
    hasura.UPDATE_PODCAST_ALBUM_BASICVariables
  >(UPDATE_PODCAST_ALBUM_BASIC)
  const [updatePodcastAlbumCover] = useMutation<
    hasura.UPDATE_PODCAST_ALBUM_COVER,
    hasura.UPDATE_PODCAST_ALBUM_COVERVariables
  >(UPDATE_PODCAST_ALBUM_COVER)

  const [loading, setLoading] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)

  if (!podcastAlbum) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    const uploadTime = Date.now()
    updatePodcastAlbumBasic({
      variables: {
        id: podcastAlbum.id,
        title: values.title,
        podcastAlbumCategories: values.categoryIds.map((categoryId: string, index: number) => ({
          podcast_album_id: podcastAlbum.id,
          category_id: categoryId,
          position: index,
        })),
      },
    })
      .then(() => {
        if (coverImage) {
          try {
            uploadFile(`podcast_album_covers/${appId}/${podcastAlbum.id}/400`, coverImage, authToken, {
              cancelToken: new axios.CancelToken(canceler => {
                uploadCanceler.current = canceler
              }),
            })
          } catch (error) {
            process.env.NODE_ENV === 'development' && console.log(error)
            return error
          }
          updatePodcastAlbumCover({
            variables: {
              id: podcastAlbum.id,
              coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/podcast_album_covers/${appId}/${podcastAlbum.id}/400?t=${uploadTime}`,
            },
          })
        }
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
      colon={false}
      labelAlign="left"
      hideRequiredMark
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: podcastAlbum.title,
        categoryIds: podcastAlbum.categories.map(category => category.id),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(programMessages.label.programTitle)} name="title">
        <Input />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.category)} name="categoryIds">
        <CategorySelector classType="podcastAlbum" />
      </Form.Item>
      <Form.Item label={formatMessage(commonMessages.label.cover)}>
        <ImageUploader
          file={coverImage}
          initialCoverUrl={podcastAlbum ? podcastAlbum?.coverUrl : null}
          onChange={file => setCoverImage(file)}
        />
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

const UPDATE_PODCAST_ALBUM_BASIC = gql`
  mutation UPDATE_PODCAST_ALBUM_BASIC(
    $id: uuid!
    $title: String
    $coverUrl: String
    $podcastAlbumCategories: [podcast_album_category_insert_input!]!
  ) {
    update_podcast_album(where: { id: { _eq: $id } }, _set: { title: $title, cover_url: $coverUrl }) {
      affected_rows
    }
    # update categories
    delete_podcast_album_category(where: { podcast_album_id: { _eq: $id } }) {
      affected_rows
    }
    insert_podcast_album_category(objects: $podcastAlbumCategories) {
      affected_rows
    }
  }
`
const UPDATE_PODCAST_ALBUM_COVER = gql`
  mutation UPDATE_PODCAST_ALBUM_COVER($id: uuid!, $coverUrl: String) {
    update_podcast_album(where: { id: { _eq: $id } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`

export default PodcastAlbumBasicForm
