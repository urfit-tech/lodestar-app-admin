import { defineMessages } from 'react-intl'

const hooksMessages = {
  '*': defineMessages({}),
  data: defineMessages({
    program: { id: 'hooks.data.program', defaultMessage: 'Program' },
    programPackage: { id: 'hooks.data.programPackage', defaultMessage: 'Program package' },
    activity: { id: 'hooks.data.activity', defaultMessage: 'Activity' },
    post: { id: 'hooks.data.post', defaultMessage: 'Post' },
    merchandise: { id: 'hooks.data.merchandise', defaultMessage: 'Merchandise' },
    project: { id: 'hooks.data.project', defaultMessage: 'Project' },
    podcastProgram: { id: 'hooks.data.podcastProgram', defaultMessage: 'Podcast' },
    podcastAlbum: { id: 'hooks.data.podcastAlbum', defaultMessage: 'Album' },
    certificate: { id: 'hooks.data.certificate', defaultMessage: 'Certificate' },
    membershipCard: {id: 'hooks.data.membershipCard', defaultMessage: 'membership card'}
  }),
}
export default hooksMessages
