import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, message, Skeleton, Tabs } from 'antd'
import { handleError } from 'lodestar-app-element/src/helpers'
import { useMemo } from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import AdminPublishBlock, { PublishEvent, PublishStatus } from '../../components/admin/AdminPublishBlock'
import AnnouncementBasicSettingsForm from '../../components/announcement/AnnouncementBasicSettingsForm'
import AnnouncementPageSettingsForm from '../../components/announcement/AnnouncementPageSettingsForm'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import { commonMessages } from '../../helpers/translation'
import { useAnnouncement } from '../../hooks/announcement'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'

const AnnouncementPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { announcementId } = useParams<{ announcementId: string }>()
  const {
    announcement,
    loading,
    error,
    updateAnnouncement,
    updateAnnouncementLoading,
    refetch,
    upsertAnnouncementPages,
    upsertAnnouncementPagesLoading,
  } = useAnnouncement(announcementId)
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)

  const publishProps: { type: PublishStatus; title: string; onPublish: (event: PublishEvent) => void } = useMemo(() => {
    const isPublished = !!announcement?.publishedAt
    return {
      type: isPublished ? 'success' : 'ordinary',
      title: isPublished
        ? formatMessage(commonMessages.status.published)
        : formatMessage(commonMessages.status.unpublished),
      onPublish: event => {
        announcement &&
          updateAnnouncement({
            variables: { id: announcement.id, data: { published_at: isPublished ? null : new Date() } },
          })
            .then(() => {
              event.onSuccess?.()
              refetch()
            })
            .catch(error => event.onError?.(error))
            .finally(() => event.onFinally?.())
      },
    }
  }, [announcement])

  if (error) return <ForbiddenPage />
  if (!announcement || loading) return <Skeleton active />

  return (
    <>
      <AdminHeader>
        <Link to="/announcements">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        <AdminHeaderTitle>{announcement?.title || ''}</AdminHeaderTitle>
      </AdminHeader>
      <StyledLayoutContent variant="gray">
        <Tabs
          activeKey={activeKey || 'settings'}
          onChange={key => setActiveKey(key)}
          renderTabBar={(props, DefaultTabBar) => (
            <AdminTabBarWrapper>
              <DefaultTabBar {...props} className="mb-0" />
            </AdminTabBarWrapper>
          )}
        >
          <Tabs.TabPane key="settings" tab={formatMessage(pageMessages.AnnouncementPage.announcementSettings)}>
            <div className="container py-5">
              <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                {formatMessage(pageMessages.AnnouncementPage.announcementSettings)}
              </AdminPaneTitle>
              <AdminBlock>
                <AdminBlockTitle>{formatMessage(pageMessages.AnnouncementPage.basicSettings)}</AdminBlockTitle>
                <AnnouncementBasicSettingsForm
                  announcement={announcement}
                  saveLoading={updateAnnouncementLoading}
                  onSave={async data => {
                    try {
                      await updateAnnouncement({
                        variables: {
                          id: data.id,
                          data: {
                            title: data.title,
                            content: data.content,
                            started_at: data.startedAt,
                            ended_at: data.endedAt,
                            remind_period_amount: data.remindPeriodAmount,
                            remind_period_type: data.remindPeriodType,
                            is_universal_display: data.isUniversalDisplay,
                          },
                        },
                      })
                      message.success(formatMessage(pageMessages.AnnouncementPage.successfullySaved))
                      refetch()
                    } catch (error) {
                      handleError(error)
                    }
                  }}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane key="page" tab={formatMessage(pageMessages.AnnouncementPage.pageSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(pageMessages.AnnouncementPage.pageSettings)}</AdminPaneTitle>
              <AdminBlock>
                <AnnouncementPageSettingsForm
                  announcementPages={announcement.announcementPages}
                  saveLoading={upsertAnnouncementPagesLoading}
                  onSave={async data => {
                    try {
                      await upsertAnnouncementPages({
                        variables: {
                          id: announcementId,
                          data: data.map(page => ({ announcement_id: page.announcementId, path: page.path })),
                        },
                      })
                      message.success(formatMessage(pageMessages.AnnouncementPage.successfullySaved))
                      refetch()
                    } catch (error) {
                      handleError(error)
                    }
                  }}
                />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
          {/* Todo */}
          {/* <Tabs.TabPane key="read-records" tab={formatMessage(pageMessages.AnnouncementPage.readRecords)}>
            <div className="container py-5">
              <AdminPaneTitle className="d-flex align-items-center justify-content-between">123</AdminPaneTitle>
            </div>
          </Tabs.TabPane> */}
          <Tabs.TabPane key="publish" tab={formatMessage(pageMessages.AnnouncementPage.publishSettings)}>
            <div className="container py-5">
              <AdminPaneTitle>{formatMessage(pageMessages.AnnouncementPage.publishSettings)}</AdminPaneTitle>
              <AdminBlock>
                <AdminPublishBlock {...publishProps} />
              </AdminBlock>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </StyledLayoutContent>
    </>
  )
}

export default AnnouncementPage
