import { defineMessages } from 'react-intl'

const ForbiddenPageMessages = {
  '*': defineMessages({
    noAuthority: { id: 'ForbiddenPage.*.noAuthority', defaultMessage: 'You are not authorized to view this page.' },
    previousPage: { id: 'ForbiddenPage.*.previousPage', defaultMessage: 'Previous' },
    home: { id: 'ForbiddenPage.*.home', defaultMessage: 'Home' },
  }),
}

export default ForbiddenPageMessages
