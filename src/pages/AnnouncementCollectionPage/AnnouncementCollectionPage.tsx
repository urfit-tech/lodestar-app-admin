import { AreaChartOutlined, FileAddOutlined } from '@ant-design/icons'
import { Button, Form, Input, Table } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { ColumnProps } from 'antd/lib/table'
import dayjs from 'dayjs'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { commonMessages } from 'lodestar-app-element/src/helpers/translation'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { AdminBlock, AdminPageTitle } from '../../components/admin'
import AdminModal from '../../components/admin/AdminModal'
import announcementMessages from '../../components/announcement/translations'
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

const AnnouncementCollectionPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions } = useAuth()
  const { announcements, loading, error } = useAnnouncements()
  const [announcementId, setAnnouncementId] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

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
      title: `${formatMessage(pageMessages.AnnouncementCollectionPage.title)}`,
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2">{record.title}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
    {
      dataIndex: 'created_at',
      width: '40%',
      title: `${formatMessage(pageMessages.AnnouncementCollectionPage.periodOfAnnouncement)}`,
      render: (text, record, index) => (
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
      title: `${formatMessage(pageMessages.AnnouncementCollectionPage.createdTime)}`,
      render: (text, record, index) => (
        <div>
          <StyledTitle className="mr-2">{dayjs(record.createdAt).format('YYYY-MM-DD')}</StyledTitle>
        </div>
      ),
      onCell: onCellClick,
    },
  ]

  if (!enabledModules.announcement && !permissions.ANNOUNCEMENT_ADMIN && !permissions.ANNOUNCEMENT_VIEW)
    return <ForbiddenPage />

  const previewAnnouncement = announcements.find(announcement => announcement.id === announcementId)
  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <AreaChartOutlined className="mr-3" />
        <span>{formatMessage(pageMessages.AnnouncementCollectionPage.pageTitle)}</span>
      </AdminPageTitle>
      {permissions.ANNOUNCEMENT_ADMIN ? (
        <div className="d-flex align-item-center justify-content-between mb-4">
          <AddNewAnnouncementModal />
        </div>
      ) : null}
      <AdminBlock>
        <Table
          columns={columns}
          dataSource={announcements}
          rowKey="id"
          loading={loading}
          showSorterTooltip={false}
          rowClassName="cursor-pointer"
          pagination={false}
        />
        {previewAnnouncement && (
          <AnnouncementPreviewModal
            announcement={previewAnnouncement}
            visible={visible}
            onClose={() => setVisible(false)}
          />
        )}
      </AdminBlock>
    </AdminLayout>
  )
}

type FieldProps = {
  title: string
}

const AddNewAnnouncementModal: React.FC<{}> = ({ ...props }) => {
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
        throw formatMessage(pageMessages.AnnouncementCollectionPage.addFailed)
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
          <Button
            className="mr-2"
            onClick={e => {
              setVisible(false)
            }}
          >
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" loading={insertAnnouncementsLoading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.button.add)}
          </Button>
        </>
      )}
      {...props}
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

const AnnouncementPreviewModal: React.FC<{
  announcement: Announcement
  visible: boolean
  onClose: () => void
}> = ({ announcement, visible, onClose }) => {
  const { formatMessage } = useIntl()

  return (
    <AdminModal
      visible={visible}
      onCancel={onClose}
      title={formatMessage(announcementMessages.AnnouncementModal.announcement)}
      footer={null}
    >
      <BraftContent>{announcement.content}</BraftContent>
    </AdminModal>
  )
}

export default AnnouncementCollectionPage
