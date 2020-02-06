import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AdminPublishBlock, {
  ChecklistItemProps,
  PublishEvent,
  PublishStatus,
} from '../../components/admin/AdminPublishBlock'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'

const messages = defineMessages({
  noAudio: { id: 'podcast.text.noAudio', defaultMessage: '尚未上傳音頻檔案' },
  noDuration: { id: 'podcast.text.noDuration', defaultMessage: '尚未填寫時長' },
  noCover: { id: 'podcast.text.noCover', defaultMessage: '尚未上傳封面' },
  noPrice: { id: 'podcast.text.noPrice', defaultMessage: '尚未訂定價格' },
  noInstructor: { id: 'podcast.text.noInstructor', defaultMessage: '尚未指定講師' },
  notCompleteNotation: {
    id: 'podcast.text.notCompleteNotation',
    defaultMessage: '請填寫以下必填資料，填寫完畢即可由此發佈',
  },
  unpublishedNotation: {
    id: 'podcast.text.unpublishedNotation',
    defaultMessage: '因你的廣播未發佈，此廣播並不會顯示在頁面上，學生也不能購買此廣播。',
  },
  publishedNotation: {
    id: 'podcast.text.publishedNotation',
    defaultMessage: '現在你的廣播已經發佈，此廣播並會出現在頁面上，學生將能購買此廣播。',
  },
})

const PodcastProgramPublishBlock: React.FC = () => {
  const { formatMessage } = useIntl()
  const { loadingPodcastProgram, errorPodcastProgram, podcastProgram, refetchPodcastProgram } = useContext(
    PodcastProgramContext,
  )
  const [publishPodcastProgram] = useMutation<types.PUBLISH_PODCAST_PROGRAM, types.PUBLISH_PODCAST_PROGRAMVariables>(
    PUBLISH_PODCAST_PROGRAM,
  )

  if (loadingPodcastProgram) {
    return <Skeleton active />
  }

  if (errorPodcastProgram || !podcastProgram) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const checklist: ChecklistItemProps[] = []

  !podcastProgram.contentType &&
    checklist.push({
      id: 'NO_AUDIO',
      text: formatMessage(messages.noAudio),
      tabkey: 'content',
    })
  !podcastProgram.duration &&
    checklist.push({
      id: 'NO_DURATION',
      text: formatMessage(messages.noDuration),
      tabkey: 'content',
    })
  !podcastProgram.coverUrl &&
    checklist.push({
      id: 'NO_COVER',
      text: formatMessage(messages.noCover),
      tabkey: 'settings',
    })
  podcastProgram.listPrice <= 0 &&
    checklist.push({
      id: 'NO_PRICE',
      text: formatMessage(messages.noPrice),
      tabkey: 'plan',
    })
  podcastProgram.instructors.length === 0 &&
    checklist.push({
      id: 'NO_INSTRUCTOR',
      text: formatMessage(messages.noInstructor),
      tabkey: 'role',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !podcastProgram.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? [formatMessage(commonMessages.status.notComplete), formatMessage(messages.notCompleteNotation)]
      : publishStatus === 'ordinary'
      ? [formatMessage(commonMessages.status.unpublished), formatMessage(messages.unpublishedNotation)]
      : publishStatus === 'success'
      ? [formatMessage(commonMessages.status.published), formatMessage(messages.publishedNotation)]
      : ['', '']

  const handlePublish: (event: PublishEvent) => void = ({ values, onSuccess, onError, onFinally }) => {
    publishPodcastProgram({
      variables: {
        podcastProgramId: podcastProgram.id,
        publishedAt: values.publishedAt,
      },
    })
      .then(() => {
        refetchPodcastProgram && refetchPodcastProgram()
        onSuccess && onSuccess()
      })
      .catch(error => onError && onError(error))
      .finally(() => onFinally && onFinally())
  }

  return (
    <AdminPublishBlock
      type={publishStatus}
      title={title}
      description={description}
      checklist={checklist}
      onPublish={handlePublish}
    />
  )
}

const PUBLISH_PODCAST_PROGRAM = gql`
  mutation PUBLISH_PODCAST_PROGRAM($podcastProgramId: uuid!, $publishedAt: timestamptz) {
    update_podcast_program(where: { id: { _eq: $podcastProgramId } }, _set: { published_at: $publishedAt }) {
      affected_rows
    }
  }
`

export default PodcastProgramPublishBlock
