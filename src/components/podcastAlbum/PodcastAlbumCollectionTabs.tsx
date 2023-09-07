import { Skeleton, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import { usePodcastAlbumCounts } from '../../hooks/podcastAlbum'
import AdminCard from '../admin/AdminCard'
import PodcastAlbumCollectionTable from './PodcastAlbumCollectionTable'

const PodcastAlbumCollectionTabs: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()

  const { loadingPodcastAlbumCounts, counts } = usePodcastAlbumCounts(appId)

  const tabContents: {
    key: string
    tab: string
    condition: hasura.GET_PODCAST_ALBUM_PREVIEW_COLLECTIONVariables['condition']
  }[] = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      condition: {
        published_at: { _is_null: false },
        is_deleted: { _eq: false },
      },
    },
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.draft),
      condition: {
        published_at: { _is_null: true },
        is_deleted: { _eq: false },
      },
    },
  ]

  if (loadingPodcastAlbumCounts || !counts) {
    return <Skeleton active />
  }

  return (
    <Tabs defaultActiveKey={'published'}>
      {tabContents.map(tabContent => (
        <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${counts[tabContent.key]})`}>
          <AdminCard className="mt-4">
            <PodcastAlbumCollectionTable condition={tabContent.condition} />
          </AdminCard>
        </Tabs.TabPane>
      ))}
    </Tabs>
  )
}

export default PodcastAlbumCollectionTabs
