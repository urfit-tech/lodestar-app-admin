import { useMutation } from '@apollo/react-hooks'
import { Skeleton } from 'antd'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import AdminPublishBlock, {
  ChecklistItemProps,
  PublishEvent,
  PublishStatus,
} from '../../components/admin/AdminPublishBlock'
import PodcastProgramContext from '../../contexts/PodcastProgramContext'
import types from '../../types'

const PodcastProgramPublishBlock: React.FC = () => {
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
    return <div>讀取錯誤</div>
  }

  const checklist: ChecklistItemProps[] = []

  !podcastProgram.contentType &&
    checklist.push({
      id: 'NO_AUDIO',
      text: '尚未上傳音頻檔案',
      tabkey: 'content',
    })
  !podcastProgram.duration &&
    checklist.push({
      id: 'NO_DURATION',
      text: '尚未填寫時長',
      tabkey: 'content',
    })
  !podcastProgram.coverUrl &&
    checklist.push({
      id: 'NO_COVER',
      text: '尚未上傳封面',
      tabkey: 'settings',
    })
  podcastProgram.listPrice <= 0 &&
    checklist.push({
      id: 'NO_PRICE',
      text: '尚未訂定價格',
      tabkey: 'plan',
    })
  podcastProgram.instructors.length === 0 &&
    checklist.push({
      id: 'NO_INSTRUCTOR',
      text: '尚未指定講師',
      tabkey: 'role',
    })

  const publishStatus: PublishStatus =
    checklist.length > 0 ? 'alert' : !podcastProgram.publishedAt ? 'ordinary' : 'success'

  const [title, description] =
    publishStatus === 'alert'
      ? ['尚有未完成項目', '請填寫以下必填資料，填寫完畢即可由此發佈']
      : publishStatus === 'ordinary'
      ? ['尚未發佈', '因你的廣播未發佈，此廣播並不會顯示在頁面上，學生也不能購買此廣播。']
      : publishStatus === 'success'
      ? ['已發佈', '現在你的廣播已經發佈，此廣播並會出現在頁面上，學生將能購買此廣播。']
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
