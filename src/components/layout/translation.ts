import { defineMessages } from 'react-intl'

const layoutMessages = {
  DefaultLayout: defineMessages({
    contractWillExpiredAndStorageAndWatchTrafficIsExceededNotice: {
      id: 'layout.DefaultLayout.contractWillExpiredAndStorageAndWatchTrafficIsExceededNotice',
      defaultMessage:
        '您的合約方案將於 {contractExpiredAt} 到期且儲存 / 流量用量已達上限，請於 {closeSiteAt} 前聯繫 KOLABLE 官方 us@urfit.com.tw  續約您的方案，否則將關閉站點。',
    },
    contractWillExpiredNotice: {
      id: 'layout.DefaultLayout.contractWillExpiredNotice',
      defaultMessage: '您的合約方案將於 {contractExpiredAt} 到期，敬請聯繫 KOLABLE 官方 us@urfit.com.tw 續約您的方案，否則將關閉站點。',
    },
    storageAndWatchTrafficIsExceededNotice: {
      id: 'layout.DefaultLayout.storageAndWatchTrafficIsExceededNotice',
      defaultMessage:
        '儲存 / 流量用量已達上限，請於 {closeSiteAt} 前聯繫 KOLABLE 官方 us@urfit.com.tw 升級您的方案，否則將無法正常使用。',
    },
  }),
}

export default layoutMessages
