import { Button, Tabs } from 'antd'
import dayjs from 'dayjs'
import { BraftContent } from 'lodestar-app-element/src/components/common/StyledBraftEditor'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useMemberAnnouncement } from '../../hooks/announcement'
import { periodTypeConverter } from '../../pages/MemberContractCreationPage'
import { Announcement } from '../../types/announcement'
import AdminModal from '../admin/AdminModal'
import announcementMessages from './translations'

const StyledFooter = styled.div`
  padding-top: 8px;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
`

const StyledLine = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e9e9e9;
  margin: 16px 0;
`

const AnnouncementModal: React.FC = () => {
  const { formatMessage } = useIntl()
  const { currentMemberId } = useAuth()
  const [isVisible, setIsVisible] = React.useState(true)
  const { announcements, loading, error, refetch, upsertMemberAnnouncementStatus } = useMemberAnnouncement()
  const filteredAnnouncements = React.useMemo(
    () =>
      announcements.filter(announcement => {
        if (!announcement.memberAnnouncementStatus[0]) {
          return true
        }
        const isDismissed = !!announcement.memberAnnouncementStatus[0]?.isDismissed
        const isRemindAt = announcement.memberAnnouncementStatus[0]?.remindAt
        const needToRemind = !!isRemindAt && dayjs().isAfter(dayjs(isRemindAt))

        if (isDismissed) {
          return false
        } else if (needToRemind) {
          return true
        }
      }),
    [announcements],
  )
  if (filteredAnnouncements.length === 0 || loading || error || !currentMemberId) {
    return null
  }

  const remindLater = (announcement: Announcement) => {
    upsertMemberAnnouncementStatus({
      variables: {
        memberId: currentMemberId,
        announcementId: announcement.id,
        remindAt: dayjs()
          .add(announcement.remindPeriodAmount, periodTypeConverter(announcement.remindPeriodType))
          .toDate(),
        isDismissed: false,
      },
    })
      .then(() => {
        refetch()
      })
      .catch(err => {
        console.log(err)
      })
  }

  const dismiss = (announcement: Announcement) => {
    upsertMemberAnnouncementStatus({
      variables: {
        memberId: currentMemberId,
        announcementId: announcement.id,
        isDismissed: true,
        remindAt: null,
      },
    })
      .then(() => {
        refetch()
      })
      .catch(err => {
        console.log(err)
      })
  }

  return (
    <AdminModal
      keyboard={false}
      closable={false}
      visible={isVisible}
      onCancel={() => {
        setIsVisible(false)
      }}
      title={formatMessage(announcementMessages.announcementModal.announcement)}
      maskClosable={false}
      footer={null}
    >
      <Tabs defaultActiveKey={announcements[0].id} onChange={() => {}}>
        {filteredAnnouncements.map(announcement => (
          <Tabs.TabPane key={announcement.id} tab={announcement.title}>
            <BraftContent>{announcement.content}</BraftContent>
            <StyledLine />
            <StyledFooter>
              <Button
                onClick={() => {
                  remindLater(announcement)
                }}
              >
                {formatMessage(announcementMessages.announcementModal.remindLater)}
              </Button>
              <Button
                type="primary"
                onClick={() => {
                  dismiss(announcement)
                }}
              >
                {formatMessage(announcementMessages.announcementModal.iKnow)}
              </Button>
            </StyledFooter>
          </Tabs.TabPane>
        ))}
      </Tabs>
    </AdminModal>
  )
}

export default AnnouncementModal
