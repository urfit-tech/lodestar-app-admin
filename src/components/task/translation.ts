import { defineMessages } from 'react-intl'

const taskMessages = {
  MemberTaskAdminModal: defineMessages({
    executorNotAvailable: {
      id: 'task.MemberTaskAdminModal.executorNotAvailable',
      defaultMessage: '此時段不可指派此執行人員',
    },
    memberNotAvailable: {
      id: 'task.MemberTaskAdminModal.memberNotAvailable',
      defaultMessage: '此時段不可指派此學員',
    },
  }),

  MeetingLinkStrategy: defineMessages({
    notInMeetingPeriod: {
      id: 'task.MeetingLinkStrategy.notInMeetingPeriod',
      defaultMessage: 'not in meeting period',
    },
    createMeetError: {
      id: 'task.MeetingLinkStrategy.createMeetError',
      defaultMessage: 'create meet error',
    },
    meetServiceModuleNotEnabled: {
      id: 'task.MeetingLinkStrategy.meetServiceModuleNotEnabled',
      defaultMessage: 'meet service module not enabled',
    },
    notSupportMeetingSystem: {
      id: 'task.MeetingLinkStrategy.notSupportMeetingSystem',
      defaultMessage: 'not support meeting system',
    },
    cannotGetMeetingUrl: {
      id: 'task.MeetingLinkStrategy.cannotGetMeetingUrl',
      defaultMessage: 'cannot get meeting url',
    },
    defaultError: {
      id: 'task.MeetingLinkStrategy.defaultError',
      defaultMessage: 'error occurred',
    },
  }),
}

export default taskMessages
