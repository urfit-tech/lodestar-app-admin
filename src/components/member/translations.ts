import { defineMessages } from 'react-intl'

const memberMessages = {
  MemberProfileBasicForm: defineMessages({
    phoneNumberCannotBeEmpty: {
      id: 'MemberProfileBasicForm.phoneNumberCannotBeEmpty',
      defaultMessage: 'Phone number cannot be empty.',
    },
    phoneNumberInvalid: {
      id: 'MemberProfileBasicForm.phoneNumberInvalid',
      defaultMessage: 'Phone number is invalid.',
    },
    countryCodeCannotBeEmpty: {
      id: 'MemberProfileBasicForm.countryCodeCannotBeEmpty',
      defaultMessage: 'Country code cannot be empty.',
    },
  }),
}

export default memberMessages
