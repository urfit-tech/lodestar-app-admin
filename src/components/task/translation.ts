import { defineMessages } from 'react-intl'

const taskMessages = {
  MemberTaskAdminModal: defineMessages({
    executorNotAvailable: {
      id: 'task.MemberTaskAdminModal.executorNotAvailable',
      defaultMessage: 'This executor cannot be assigned during this time period',
    },
    memberNotAvailable: {
      id: 'task.MemberTaskAdminModal.memberNotAvailable',
      defaultMessage: 'This member cannot be assigned during this time period',
    },
  }),

  MemberTaskAdminBlock: defineMessages({
    switchCalendar: { id: 'member.ui.switchCalendar', defaultMessage: 'Switch to calendar mode' },
    switchTable: { id: 'member.ui.switchTable', defaultMessage: 'Switch to list mode' },
    executor: { id: 'member.label.executor', defaultMessage: 'Executor' },
    author: { id: 'member.label.author', defaultMessage: 'Creator' },
    group: { id: 'member.label.group', defaultMessage: 'Group' },
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
