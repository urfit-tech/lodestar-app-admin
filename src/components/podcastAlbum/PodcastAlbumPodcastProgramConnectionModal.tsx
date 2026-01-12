import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Button, Form, message, Select } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, podcastAlbumMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'

const StyledSelect = styled(Select)<{ value?: any; onChange?: any }>`
  width: 100%;

  && .ant-select-selection__choice {
    padding-right: 2rem;
    background: var(--gray-lighter);
    color: var(--gray-darker);
  }

  .ant-select-selection--multiple .ant-select-selection__choice {
    border: none;
    border-radius: 4px;
  }

  .ant-select-selection--multiple .ant-select-selection__choice__remove {
    right: 0.5rem;
    color: #9b9b9b;
  }
`

type FieldProps = {
  podcastProgramValues: string[]
}

const PodcastAlbumPodcastProgramConnectionModal: React.VFC<{
  podcastAlbumId: string
  podcastPrograms: { id: string; title: string; podcastAlbumPodcastProgramId: string }[]
  onRefetch?: () => void
}> = ({ podcastAlbumId, podcastPrograms, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const { availablePodcastPrograms } = useGetAvailablePodcastProgramCollection(appId)
  const [upsertPodcastAlbum] = useMutation<
    hasura.UPSERT_PODCAST_ALBUM_PODCAST_PROGRAM,
    hasura.UPSERT_PODCAST_ALBUM_PODCAST_PROGRAMVariables
  >(UPSERT_PODCAST_ALBUM_PODCAST_PROGRAM)

  const [isLoading, setLoading] = useState<boolean>(false)

  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(() => {
        setLoading(true)
        const values = form.getFieldsValue()
        const podcastProgramsIds = values.podcastProgramValues.map((value: string) => value.split('_')[0])

        upsertPodcastAlbum({
          variables: {
            podcastPrograms: podcastProgramsIds.map((podcastProgramsId: string) => ({
              podcast_album_id: podcastAlbumId,
              podcast_program_id: podcastProgramsId,
            })),
            podcastAlbumId: podcastAlbumId,
            deletePodcastProgramsId: podcastPrograms
              .filter(podcastProgram => !podcastProgramsIds.includes(podcastProgram.id))
              .map(podcastProgram => podcastProgram.podcastAlbumPodcastProgramId),
          },
        })
          .then(() => {
            message.success(formatMessage(commonMessages.event.successfullySaved))
            setVisible(false)
            onRefetch?.()
          })
          .catch(handleError)
          .finally(() => setLoading(false))
      })
      .catch(() => {})
  }

  return (
    <AdminModal
      icon={<FileAddOutlined />}
      title={formatMessage(podcastAlbumMessages.ui.createAlbum)}
      destroyOnClose
      maskClosable={false}
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(podcastAlbumMessages.ui.addPodcastProgram)}
        </Button>
      )}
      onCancel={() => form.resetFields()}
      footer={null}
      renderFooter={({ setVisible }) => (
        <div>
          <Button
            onClick={() => {
              setVisible(false)
              form.resetFields()
            }}
            className="mr-2"
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => handleSubmit(setVisible)}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      )}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          podcastProgramValues: podcastPrograms.map(podcastProgram => `${podcastProgram.id}_${podcastProgram.title}`),
        }}
      >
        <Form.Item name="podcastProgramValues">
          <StyledSelect
            mode="multiple"
            allowClear
            showSearch
            placeholder={formatMessage(podcastAlbumMessages.text.connectionModalPlaceholder)}
          >
            {availablePodcastPrograms.map(availablePodcastProgram => (
              <Select.Option
                key={availablePodcastProgram.id}
                value={`${availablePodcastProgram.id}_${availablePodcastProgram.title}`}
              >
                {availablePodcastProgram.title}
              </Select.Option>
            ))}
          </StyledSelect>
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const useGetAvailablePodcastProgramCollection = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_AVAILABLE_PODCAST_PROGRAM_COLLECTION,
    hasura.GET_AVAILABLE_PODCAST_PROGRAM_COLLECTIONVariables
  >(
    gql`
      query GET_AVAILABLE_PODCAST_PROGRAM_COLLECTION($appId: String!) {
        podcast_program(where: { creator: { app_id: { _eq: $appId } }, published_at: { _is_null: false } }) {
          id
          title
          published_at
        }
      }
    `,
    { variables: { appId } },
  )

  const availablePodcastPrograms: {
    id: string
    title: string
    publishedAt: string
  }[] =
    data?.podcast_program?.map(v => ({
      id: v.id,
      title: v.title || '',
      publishedAt: v.published_at,
    })) || []

  return {
    loading,
    error,
    availablePodcastPrograms,
    refetch,
  }
}

const UPSERT_PODCAST_ALBUM_PODCAST_PROGRAM = gql`
  mutation UPSERT_PODCAST_ALBUM_PODCAST_PROGRAM(
    $podcastPrograms: [podcast_album_podcast_program_insert_input!]!
    $podcastAlbumId: uuid!
    $deletePodcastProgramsId: [uuid!]!
  ) {
    insert_podcast_album_podcast_program(
      objects: $podcastPrograms
      on_conflict: {
        constraint: podcast_album_podcast_program_podcast_album_id_podcast_program_
        update_columns: podcast_album_id
      }
    ) {
      affected_rows
    }
    delete_podcast_album_podcast_program(
      where: { _and: [{ podcast_album_id: { _eq: $podcastAlbumId } }, { id: { _in: $deletePodcastProgramsId } }] }
    ) {
      affected_rows
    }
  }
`
export default PodcastAlbumPodcastProgramConnectionModal
