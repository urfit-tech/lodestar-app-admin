import { defineMessages } from 'react-intl'

const MembershipCardPageMessages = {
  page: defineMessages({
    title: { id: 'membershipCardCollectionPage.title', defaultMessage: 'Membership Card Plans' },
    createCard: { id: 'membershipCardCollectionPage.createCard', defaultMessage: 'Create Membership Card' },
    year: { id: 'membershipCardCollection.period.year', defaultMessage: 'year' },
    month: { id: 'membershipCardCollection.period.month', defaultMessage: 'month' },
    day: { id: 'membershipCardCollection.period.day', defaultMessage: 'day' },
    startToday: { id: 'membershipCardCollection.period.startToday', defaultMessage: 'effective immediately' },
    noExpiry: { id: 'membershipCardCollection.period.noExpiry', defaultMessage: 'no expiration' },
    titleColumn: { id: 'membershipCardCollection.column.title', defaultMessage: 'Title' },
    validityPeriod: { id: 'membershipCardCollection.column.validityPeriod', defaultMessage: 'Validity Period' },
    eligibilityList: { id: 'membershipCardCollection.column.eligibilityList', defaultMessage: 'SKU' },
    fetchDataError: { id: 'membershipCardCollection.fetchDataError', defaultMessage: 'Error fetching data' },
  }),
}

export default MembershipCardPageMessages
