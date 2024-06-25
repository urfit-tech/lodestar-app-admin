import { defineMessages } from 'react-intl'

const announcementMessages = {
  AnnouncementModal: defineMessages({
    announcement: {
      id: 'announcement.AnnouncementModal.announcement',
      defaultMessage: 'Announcement',
    },
    remindLater: {
      id: 'announcement.AnnouncementModal.remindLater',
      defaultMessage: 'Remind later',
    },
    iKnow: {
      id: 'announcement.AnnouncementModal.iKnow',
      defaultMessage: 'I know',
    },
  }),
  AnnouncementBasicSettingsForm: defineMessages({
    announcementTitle: {
      id: 'announcement.AnnouncementModal.announcementTitle',
      defaultMessage: 'Announcement title',
    },
    announcementContent: {
      id: 'announcement.AnnouncementModal.announcementContent',
      defaultMessage: 'Announcement content',
    },
    startTime: {
      id: 'announcement.AnnouncementModal.startedTime',
      defaultMessage: 'Start time',
    },
    endTime: {
      id: 'announcement.AnnouncementModal.endTime',
      defaultMessage: 'End time',
    },
    nextTimeRemindPeriod: {
      id: 'announcement.AnnouncementModal.nextTimeRemindPeriod',
      defaultMessage: 'Next time remind period',
    },
    isSiteWideAnnouncement: {
      id: 'announcement.AnnouncementModal.isSiteWideAnnouncement',
      defaultMessage: 'Is site-wide announcement',
    },
  }),
  AnnouncementPageSettingsForm: defineMessages({
    addNewPath: {
      id: 'announcement.AnnouncementModal.addNewPath',
      defaultMessage: 'Add new path',
    },
    path: {
      id: 'announcement.AnnouncementModal.path',
      defaultMessage: 'Path',
    },
  }),
}

export default announcementMessages
