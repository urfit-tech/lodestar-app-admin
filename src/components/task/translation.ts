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
}

export default taskMessages
