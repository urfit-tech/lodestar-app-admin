import { AreaChartOutlined, FileAddOutlined } from '@ant-design/icons'
import { Button, Form, Input, Table, Tabs } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import dayjs from 'dayjs'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { commonMessages } from 'lodestar-app-element/src/helpers/translation'
import React, { useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminPageTitle } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import { AnnouncementPreviewModal } from '../../components/announcement/AnnouncementPreviewModal'
import AdminLayout from '../../components/layout/AdminLayout'
import { handleError } from '../../helpers'
import { errorMessages } from '../../helpers/translation'
import { useAnnouncements } from '../../hooks/announcement'
import { Announcement } from '../../types/announcement'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'

const StyledTitle = styled.span`
  color: var(--gray-darker);
  font-weight: bold;
`

export const AdminPageBlock = styled.div`
  overflow: auto;
  padding: 2.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`

type AnnouncementCounts = {
  published: number
  draft: number
}

type TabContent = {
  key: keyof AnnouncementCounts
  tab: string
  condition: (announcement: Announcement) => boolean
  permissionIsAllowed: boolean
}

const AnnouncementCollectionTabs: React.FC<{
  announcements: Announcement[]
  loading: boolean
  permissions: {
    ANNOUNCEMENT_ADMIN: boolean
    ANNOUNCEMENT_VIEW: boolean
  }
  setAnnouncementId: (id: string) => void
  setVisible: (visible: boolean) => void
}> = ({ announcements, loading, permissions, setAnnouncementId, setVisible }) => {
  const { formatMessage } = useIntl()

  const onCellClick = (announcement: Announcement) => {
    return {
      onClick: () => {
        if (permissions.ANNOUNCEMENT_ADMIN) {
          window.location.href = `${process.env.PUBLIC_URL}/announcements/${announcement.id}`
        } else {
          setAnnouncementId(announcement.id)
          setVisible(true)
        }
      },
    }
  }

  const columns: ColumnProps<Announcement>[] = [
    {
      dataIndex: 'title',
      width: '30%',
      title: formatMessage(pageMessages.AnnouncementCollectionPage.title),
      render: (_, record) => (
        <div>
          <StyledTitle className="mr-2">{record.title}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'created_at',
      width: '40%',
      title: formatMessage(pageMessages.AnnouncementCollectionPage.periodOfAnnouncement),
      render: (_, record) => (
        <div>
          <StyledTitle className="mr-2">
            {record.startedAt
              ? dayjs(record.startedAt).format('YYYY-MM-DD')
              : formatMessage(pageMessages.AnnouncementCollectionPage.fromNowOn)}{' '}
            -{' '}
            {record.endedAt
              ? dayjs(record.endedAt).format('YYYY-MM-DD')
              : formatMessage(pageMessages.AnnouncementCollectionPage.unlimitedDate)}
          </StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'created_at',
      width: '30%',
      title: formatMessage(pageMessages.AnnouncementCollectionPage.createdTime),
      render: (_, record) => (
        <div>
          <StyledTitle className="mr-2">{dayjs(record.createdAt).format('YYYY-MM-DD')}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
  ]

  const counts = useMemo<AnnouncementCounts>(() => {
    if (!announcements) return { published: 0, draft: 0 }
    return {
      published: announcements.filter(a => a.publishedAt).length,
      draft: announcements.filter(a => !a.publishedAt).length,
    }
  }, [announcements])

  const tabContents: TabContent[] = [
    {
      key: 'published',
      tab: formatMessage(pageMessages.AnnouncementCollectionPage.publishedTab),
      condition: (announcement: Announcement) => !!announcement.publishedAt,
      permissionIsAllowed: permissions.ANNOUNCEMENT_ADMIN || permissions.ANNOUNCEMENT_VIEW,
    },
    {
      key: 'draft',
      tab: formatMessage(pageMessages.AnnouncementCollectionPage.draftTab),
      condition: (announcement: Announcement) => !announcement.publishedAt,
      permissionIsAllowed: permissions.ANNOUNCEMENT_ADMIN,
    },
  ]

  return (
    <Tabs defaultActiveKey="published">
      {tabContents
        .filter(v => v.permissionIsAllowed)
        .map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} (${counts[tabContent.key]})`}>
            <AdminPageBlock>
              <Table
                columns={columns}
                dataSource={announcements.filter(tabContent.condition)}
                rowKey="id"
                loading={loading}
                showSorterTooltip={false}
                rowClassName="cursor-pointer"
                pagination={false}
              />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
    </Tabs>
  )
}

const AnnouncementCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()
  const { announcements, loading } = useAnnouncements()
  const [announcementId, setAnnouncementId] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  if (!enabledModules.announcement && !permissions.ANNOUNCEMENT_ADMIN && !permissions.ANNOUNCEMENT_VIEW) {
    return <ForbiddenPage />
  }

  const previewAnnouncement = announcements.find(announcement => announcement.id === announcementId)

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <AreaChartOutlined className="mr-3" />
        <span>{formatMessage(pageMessages.AnnouncementCollectionPage.pageTitle)}</span>
      </AdminPageTitle>
      {permissions.ANNOUNCEMENT_ADMIN && (
        <div className="d-flex align-item-center justify-content-between mb-4">
          <AddNewAnnouncementModal />
        </div>
      )}
      <AnnouncementCollectionTabs
        announcements={announcements}
        loading={loading}
        permissions={{
          ANNOUNCEMENT_ADMIN: permissions.ANNOUNCEMENT_ADMIN ?? false,
          ANNOUNCEMENT_VIEW: permissions.ANNOUNCEMENT_VIEW ?? false,
        }}
        setAnnouncementId={setAnnouncementId}
        setVisible={setVisible}
      />

      {previewAnnouncement && (
        <AnnouncementPreviewModal
          announcement={previewAnnouncement}
          visible={visible}
          onClose={() => setVisible(false)}
        />
      )}
    </AdminLayout>
  )
}

type FieldProps = {
  title: string
}

const AddNewAnnouncementModal: React.FC = () => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { currentMemberId } = useAuth()
  const [form] = useForm<FieldProps>()
  const { insertAnnouncements, insertAnnouncementsLoading } = useAnnouncements()

  const handleSubmit = async () => {
    try {
      await form.validateFields()
      const values = form.getFieldsValue()
      const insertReportData = {
        title: values.title,
        app_id: appId,
        creator_id: currentMemberId || '',
      }

      const result = await insertAnnouncements({
        variables: {
          data: [insertReportData],
        },
      })
      if (!result.data) {
        throw new Error(formatMessage(pageMessages.AnnouncementCollectionPage.addFailed))
      }
      window.location.href = `${process.env.PUBLIC_URL}/announcements/${result.data.insert_announcement?.returning[0].id}`
    } catch (error) {
      handleError(error)
    }
  }

  return (
    <AdminModal
      footer={null}
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
          {formatMessage(pageMessages.AnnouncementCollectionPage.addAnnouncement)}
        </Button>
      )}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={insertAnnouncementsLoading} onClick={handleSubmit}>
            {formatMessage(commonMessages.button.add)}
          </Button>
        </>
      )}
    >
      <Form form={form} layout="vertical" colon={false} hideRequiredMark>
        <Form.Item
          label={formatMessage(pageMessages.AnnouncementCollectionPage.title)}
          name="title"
          rules={[
            {
              required: true,
              message: formatMessage(errorMessages.form.isRequired, {
                field: formatMessage(pageMessages.AnnouncementCollectionPage.title),
              }),
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default AnnouncementCollectionPage
