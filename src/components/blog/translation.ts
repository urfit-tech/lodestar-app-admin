import { defineMessages } from 'react-intl'

const postMessages = {
  '*': defineMessages({}),
  PostCollectionSelector: defineMessages({
    ruleOfSort: { id: 'post.PostCollectionSelector.ruleOfSort', defaultMessage: '預設排序' },
    choiceData: { id: 'post.PostCollectionSelector.choiceData', defaultMessage: '選擇資料' },
    byPopularity: { id: 'post.PostCollectionSelector.byPopularity', defaultMessage: '依熱門程度' },
    publishedAt: { id: 'post.PostCollectionSelector.publishedAt', defaultMessage: '依上架日期' },
    currentPrice: { id: 'post.PostCollectionSelector.currentPrice', defaultMessage: '依產品價錢' },
    recentWatched: { id: 'post.PostCollectionSelector.recentWatched', defaultMessage: '依最後觀看時間' },
    custom: { id: 'post.PostCollectionSelector.newest', defaultMessage: '自訂項目' },
    sort: { id: 'program.ProgramCollectionSelector.sort', defaultMessage: '排序方式' },
    sortAsc: { id: 'program.ProgramCollectionSelector.sortAsc', defaultMessage: '正序' },
    sortDesc: { id: 'program.ProgramCollectionSelector.sortDesc', defaultMessage: '倒序' },
    displayAmount: { id: 'program.ProgramCollectionSelector.displayAmount', defaultMessage: '資料顯示數量' },
    defaultCategoryId: { id: 'program.ProgramCollectionSelector.defaultCategoryId', defaultMessage: '預設分類' },
    defaultTagName: { id: 'program.ProgramCollectionSelector.defaultTagName', defaultMessage: '預設標籤' },
    dataDisplay: { id: 'program.ProgramCollectionSelector.dataDisplay', defaultMessage: '資料顯示' },
    addItem: { id: 'post.PostCollectionSelector.addItem', defaultMessage: '新增項目' },
  }),
  BlogPostCard: defineMessages({
    views: {
      id: 'post.BlogPostCard.views',
      defaultMessage: '瀏覽',
    },
  }),
}

export default postMessages
