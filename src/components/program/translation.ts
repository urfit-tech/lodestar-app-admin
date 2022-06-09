import { defineMessages } from 'react-intl'

const programMessages = {
  '*': defineMessages({}),
  ProgramCollectionSelector: defineMessages({
    recentWatched: { id: 'program.ProgramCollectionSelector.recentWatched', defaultMessage: '依最後觀看時間' },
    publishedAt: { id: 'program.ProgramCollectionSelector.publishedAt', defaultMessage: '依上架日期' },
    currentPrice: { id: 'program.ProgramCollectionSelector.currentPrice', defaultMessage: '依產品價錢' },
    custom: { id: 'program.ProgramCollectionSelector.newest', defaultMessage: '自訂項目' },
    ruleOfSort: { id: 'program.ProgramCollectionSelector.ruleOfSort', defaultMessage: '排序規則' },
    choiceData: { id: 'program.ProgramCollectionSelector.choiceData', defaultMessage: '選擇資料' },
    sort: { id: 'program.ProgramCollectionSelector.sort', defaultMessage: '排序方式' },
    sortAsc: { id: 'program.ProgramCollectionSelector.sortAsc', defaultMessage: '正序' },
    sortDesc: { id: 'program.ProgramCollectionSelector.sortDesc', defaultMessage: '倒序' },
    displayAmount: { id: 'program.ProgramCollectionSelector.displayAmount', defaultMessage: '資料顯示數量' },
    defaultCategoryId: { id: 'program.ProgramCollectionSelector.defaultCategoryId', defaultMessage: '預設分類' },
    defaultTagName: { id: 'program.ProgramCollectionSelector.defaultTagName', defaultMessage: '預設標籤' },
    dataDisplay: { id: 'program.ProgramCollectionSelector.dataDisplay', defaultMessage: '資料顯示' },
    addItem: { id: 'program.ProgramCollectionSelector.addItem', defaultMessage: '新增項目' },
  }),
  ProgramPackageSelector: defineMessages({
    allProgramPackage: { id: 'program.ProgramPackageSelector.allProgramPackage', defaultMessage: '全部課程組合' },
  }),
}

export default programMessages
