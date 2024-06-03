import { defineMessages } from 'react-intl'

const hooksMessages = {
  '*': defineMessages({}),
  data: defineMessages({
    program: { id: 'hooks.data.program', defaultMessage: '課程' },
    programPackage: { id: 'hooks.data.programPackage', defaultMessage: '課程組合' },
    activity: { id: 'hooks.data.activity', defaultMessage: '活動' },
    post: { id: 'hooks.data.post', defaultMessage: '文章' },
    merchandise: { id: 'hooks.data.merchandise', defaultMessage: '商品' },
    project: { id: 'hooks.data.project', defaultMessage: '專案' },
    podcastProgram: { id: 'hooks.data.podcastProgram', defaultMessage: '廣播' },
    podcastAlbum: { id: 'hooks.data.podcastAlbum', defaultMessage: '專輯' },
    certificate: { id: 'hooks.data.certificate', defaultMessage: '證書' },
    membershipCard: {id: 'hooks.data.membershipCard', defaultMessage: 'membership card'}
  }),
}
export default hooksMessages
