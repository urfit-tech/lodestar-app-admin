import { defineMessages } from 'react-intl'

const craftMessages = {
  '*': defineMessages({
    orderSelectorEnabled: {
      id: 'craft.*.orderSelectorEnabled',
      defaultMessage: '啟用排序選擇器',
    },
    categorySelectorEnabled: { id: 'craft.*.categorySelectorEnabled', defaultMessage: '啟用分類選擇器' },
    primary: { id: 'craft.*.primary', defaultMessage: '樣式一' },
    secondary: { id: 'craft.*.secondary', defaultMessage: '樣式二' },
    variant: { id: 'craft.*.variant', defaultMessage: '元件樣式' },
    collectionVariant: { id: 'craft.*.collectionVariant', defaultMessage: '集合樣式' },
    grid: { id: 'craft.*.grid', defaultMessage: '網格' },
    carousel: { id: 'craft.*.carousel', defaultMessage: '輪播' },
    spaceStyle: { id: 'craft.*.spaceStyle', defaultMessage: '間距樣式' },
    positionStyle: { id: 'craft.*.positionStyle', defaultMessage: '位置樣式' },
    borderStyle: { id: 'craft.*.borderStyle', defaultMessage: '框線樣式' },
    title: { id: 'craft.*.title', defaultMessage: '標題' },
    titleStyle: { id: 'craft.*.titleStyle', defaultMessage: '標題樣式' },
    paragraphStyle: { id: 'craft.*.paragraphStyle', defaultMessage: '段落樣式' },
    width: { id: 'craft.*.width', defaultMessage: '寬度' },
    fontSize: { id: 'craft.*.fontSize', defaultMessage: '字級' },
    lineHeight: { id: 'craft.*.lineHeight', defaultMessage: '行高' },
    textAlign: { id: 'craft.*.textAlign', defaultMessage: '對齊' },
    left: { id: 'craft.*.left', defaultMessage: '左' },
    center: { id: 'craft.*.center', defaultMessage: '中' },
    right: { id: 'craft.*.right', defaultMessage: '右' },
    fontWeight: { id: 'craft.*.fontWeight', defaultMessage: '字重' },
    lighter: { id: 'craft.*.lighter', defaultMessage: '細' },
    normal: { id: 'craft.*.normal', defaultMessage: '中' },
    bold: { id: 'craft.*.bold', defaultMessage: '粗' },
    advancedSetting: { id: 'craft.*.advancedSetting', defaultMessage: '進階設定' },
    className: { id: 'craft.*.className', defaultMessage: '類別名稱' },
    ariaLabel: { id: 'craft.*.ariaLabel', defaultMessage: '圖片標籤描述' },
    all: { id: 'craft.*.all', defaultMessage: 'all' },
    collectionType: { id: 'craft.*.collectionType', defaultMessage: 'type' },
  }),
  ProgramCollectionSettings: defineMessages({
    programSectionId: { id: 'craft.ProgramCollectionSettings.programSectionId', defaultMessage: '課程區塊 ID' },
  }),
  ActivityCollectionSettings: defineMessages({
    activitySectionId: { id: 'craft.ActivityCollectionSettings.activitySectionId', defaultMessage: '活動區塊 ID' },
  }),
  MemberCollectionSettings: defineMessages({
    memberSectionId: { id: 'craft.MemberCollectionSettings.memberSectionId', defaultMessage: '會員區塊 ID' },
  }),
  ProgramContentCollectionSettings: defineMessages({
    programContentSectionId: {
      id: 'craft.ProgramContentCollectionSettings.programContentSectionId',
      defaultMessage: '課程內容區塊 ID',
    },
  }),
  ProgramPackageCollectionSettings: defineMessages({
    programPackageSectionId: {
      id: 'craft.ProgramPackageCollectionSettings.programPackageSectionId',
      defaultMessage: '課程組合區塊 ID',
    },
  }),
  ProjectCollectionSettings: defineMessages({
    projectSectionId: { id: 'craft.ProjectCollectionSettings.projectSectionId', defaultMessage: '專案區塊 ID' },
    fundingProject: { id: 'craft.ProjectCollectionSettings.fundingProject', defaultMessage: 'Funding Project' },
    preOrderProject: { id: 'craft.ProjectCollectionSettings.preOrderProject', defaultMessage: 'Pre Order Project' },
    portfolioProject: { id: 'craft.ProjectCollectionSettings.portfolioProject', defaultMessage: 'Portfolio Project' },
  }),
  PostCollectionSettings: defineMessages({
    postSectionId: { id: 'craft.PostCollectionSettings.postSectionId', defaultMessage: '文章區塊 ID' },
  }),
  ImageSettings: defineMessages({
    autoImageHeight: { id: 'craft.ImageSettings.autoImageHeight', defaultMessage: 'auto image height' },
    fullScreenImage: { id: 'craft.ImageSettings.fullScreenImage', defaultMessage: 'full screen image' },
  }),
  SizeStyleInput: defineMessages({
    height: { id: 'craft.SizeStyleInput.height', defaultMessage: '高度' },
  }),
  LayoutSettings: defineMessages({
    ratio: { id: 'craft.LayoutSettings.ratio', defaultMessage: '比例' },
    gap: { id: 'craft.LayoutSettings.gap', defaultMessage: '間距' },
  }),
  SectionSettings: defineMessages({
    layout: { id: 'craft.SectionSettings.layout', defaultMessage: '排列方式' },
    horizontal: { id: 'craft.SectionSettings.horizontal', defaultMessage: '水平排列' },
    vertical: { id: 'craft.SectionSettings.vertical', defaultMessage: '垂直排列' },
    horizontalAlign: { id: 'craft.SectionSettings.horizontalAlign', defaultMessage: '水平對齊' },
    verticalAlign: { id: 'craft.SectionSettings.verticalAlign', defaultMessage: '垂直對齊' },
    left: { id: 'craft.SectionSettings.left', defaultMessage: '置左' },
    right: { id: 'craft.SectionSettings.right', defaultMessage: '置右' },
    center: { id: 'craft.SectionSettings.center', defaultMessage: '置中' },
    none: { id: 'craft.SectionSettings.none', defaultMessage: 'none' },
    top: { id: 'craft.SectionSettings.top', defaultMessage: '置頂' },
    bottom: { id: 'craft.SectionSettings.bottom', defaultMessage: '置底' },
    normal: { id: 'craft.SectionSettings.normal', defaultMessage: '正常' },
    hide: { id: 'craft.SectionSettings.hide', defaultMessage: '隱藏' },
    appearAfterLogin: { id: 'craft.SectionSettings.appearAfterLogin', defaultMessage: '登入後顯示' },
    disappearAfterLogin: { id: 'craft.SectionSettings.disappearAfterLogin', defaultMessage: '登入後隱藏' },
    link: { id: 'craft.SectionSettings.link', defaultMessage: '連結' },
    openNewTab: { id: 'craft.SectionSettings.openNewTab', defaultMessage: '另開分頁' },
    sectionId: { id: 'craft.SectionSettings.sectionId', defaultMessage: 'Section ID' },
  }),
  TitleSettings: defineMessages({
    titleContent: { id: 'craft.TitleSettings.titleContent', defaultMessage: '標題內容' },
  }),
  ParagraphSettings: defineMessages({
    paragraphContent: { id: 'craft.ParagraphSettings.paragraphContent', defaultMessage: '段落內容' },
    content: { id: 'craft.ParagraphSettings.content', defaultMessage: '內文' },
  }),
  EmbeddedSettings: defineMessages({
    embedSetting: { id: 'craft.EmbeddedSettings.embedSettings', defaultMessage: '嵌入設定' },
    embedStyle: { id: 'craft.EmbeddedSettings.embedStyle', defaultMessage: '嵌入樣式' },
    fillIframeFormatPlz: {
      id: 'craft.EmbeddedSettings.fillIframeFormatPlz',
      defaultMessage: '請填入 iframe',
    },
  }),
  AIBotSettings: defineMessages({
    setting: { id: 'craft.AIBotSettings.setting', defaultMessage: '基本設定' },
    style: { id: 'craft.AIBotSettings.style', defaultMessage: '樣式' },
    systemPrompt: { id: 'craft.AIBotSettings.systemPrompt', defaultMessage: '系統提示詞' },
    systemPromptPlaceholder: {
      id: 'craft.AIBotSettings.systemPromptPlaceholder',
      defaultMessage: 'You are an expert of...',
    },
    assistantQuestions: { id: 'craft.AIBotSettings.assistantQuestions', defaultMessage: '使用者問答' },
    assistantQuestionsPlaceholder: {
      id: 'craft.AIBotSettings.assistantQuestionsPlaceholder',
      defaultMessage: 'What do you want to ask?',
    },
    addQuestion: { id: 'craft.AIBotSettings.addQuestion', defaultMessage: '新增問題' },
  }),
  CarouselSettings: defineMessages({
    carouselStyle: { id: 'craft.CarouselSettings.carouselStyle', defaultMessage: '輪播樣式' },
    carouselSetting: { id: 'craft.CarouselSettings.carouselSetting', defaultMessage: '輪播設定' },
    currentSlide: { id: 'craft.CarouselSettings.currentSlide', defaultMessage: '目前輪播' },
    autoplay: { id: 'craft.CarouselSettings.autoplay', defaultMessage: '自動播放' },
    autoplaySpeed: { id: 'craft.CarouselSettings.autoplaySpeed', defaultMessage: '自動播放速度（毫秒）' },
    infinite: { id: 'craft.CarouselSettings.infinite', defaultMessage: '無限輪播' },
    arrows: { id: 'craft.CarouselSettings.arrows', defaultMessage: '顯示箭頭' },
    centerMode: { id: 'craft.CarouselSettings.centerMode', defaultMessage: '聚焦模式' },
    centerPadding: { id: 'craft.CarouselSettings.centerPadding', defaultMessage: '聚焦間距' },
    dots: { id: 'craft.CarouselSettings.dots', defaultMessage: '顯示圓點' },
    slideToShow: { id: 'craft.CarouselSettings.slideToShow', defaultMessage: '欄數' },
    slideToScroll: { id: 'craft.CarouselSettings.slideToScroll', defaultMessage: '捲動數量' },
    arrowsVerticalPosition: {
      id: 'craft.CarouselSettings.arrowsVerticalPosition',
      defaultMessage: '箭頭垂直位置',
    },
    arrowsLeftPosition: { id: 'craft.CarouselSettings.arrowsLeftPosition', defaultMessage: '左箭頭位置' },
    arrowsLeftSize: { id: 'craft.CarouselSettings.arrowsLeftSize', defaultMessage: '左箭頭大小' },
    arrowsRightPosition: { id: 'craft.CarouselSettings.arrowsRightPosition', defaultMessage: '右箭頭位置' },
    arrowsRightSize: { id: 'craft.CarouselSettings.arrowsRightSize', defaultMessage: '右箭頭大小' },
    dotsPosition: { id: 'craft.CarouselSettings.dotsPosition', defaultMessage: '圓點位置' },
    dotsWidth: { id: 'craft.CarouselSettings.dotsWidth', defaultMessage: '圓點寬度' },
    dotsHeight: { id: 'craft.CarouselSettings.dotsHeight', defaultMessage: '圓點高度' },
    dotsMargin: { id: 'craft.CarouselSettings.dotsMargin', defaultMessage: '圓點間距' },
    dotsRadius: { id: 'craft.CarouselSettings.dotsRadius', defaultMessage: '圓點弧度' },
    height: { id: 'craft.CarouselSettings.height', defaultMessage: '高度' },
  }),
  ButtonSettings: defineMessages({
    buttonSetting: { id: 'craft.ButtonSettings.buttonSetting', defaultMessage: '按鈕設定' },
    buttonStyle: { id: 'craft.ButtonSettings.buttonStyle', defaultMessage: '按鈕樣式' },
    size: { id: 'craft.ButtonSettings.size', defaultMessage: '尺寸' },
    large: { id: 'craft.ButtonSettings.large', defaultMessage: '大' },
    middle: { id: 'craft.ButtonSettings.middle', defaultMessage: '中' },
    small: { id: 'craft.ButtonSettings.small', defaultMessage: '小' },
    buttonBlock: { id: 'craft.ButtonSettings.buttonBlock', defaultMessage: '滿版' },
  }),
  TextStyledInput: defineMessages({
    margin: { id: 'craft.TextStyledInput.margin', defaultMessage: '外距' },
  }),
  BorderStyleInput: defineMessages({
    radius: { id: 'craft.BorderStyleInput.radius', defaultMessage: '弧度' },
  }),
  PositionStyleInput: defineMessages({
    none: { id: 'craft.PositionStyleInput.none', defaultMessage: '無框線' },
    solid: { id: 'craft.PositionStyleInput.solid', defaultMessage: '實線' },
  }),
  ColorPicker: defineMessages({
    color: { id: 'craft.ColorPicker.color', defaultMessage: '顏色' },
  }),
  BackgroundStyleInput: defineMessages({
    background: { id: 'craft.BackgroundStyleInput.background', defaultMessage: '背景' },
    none: { id: 'craft.BackgroundStyleInput.none', defaultMessage: '無' },
    solid: { id: 'craft.BackgroundStyleInput.solid', defaultMessage: '純色' },
    image: { id: 'craft.BackgroundStyleInput.image', defaultMessage: '圖片' },
  }),
  SpaceStyleInput: defineMessages({
    spacing: { id: 'craft.SpaceStyleInput.spacing', defaultMessage: 'spacing' },
    margin: { id: 'craft.SpaceStyleInput.margin', defaultMessage: 'margin' },
    padding: { id: 'craft.SpaceStyleInput.padding', defaultMessage: 'padding' },
    top: { id: 'craft.SpaceStyleInput.top', defaultMessage: 'top' },
    right: { id: 'craft.SpaceStyleInput.right', defaultMessage: 'right' },
    bottom: { id: 'craft.SpaceStyleInput.bottom', defaultMessage: 'bottom' },
    left: { id: 'craft.SpaceStyleInput.left', defaultMessage: 'left' },
  }),
  ActivityCollectionSection: defineMessages({
    activityTitle: {
      id: 'craft.ActivityCollectionSection.activityTitle',
      defaultMessage: '活動',
    },
    viewNow: {
      id: 'craft.ActivityCollectionSection.viewNow',
      defaultMessage: '馬上查看 〉',
    },
  }),
  CTASection: defineMessages({
    whatAreYouWaitingFor: {
      id: 'craft.CTASection.whatAreYouWaitingFor',
      defaultMessage: '還在等什麼？立即查看課程',
    },
    viewNow: {
      id: 'craft.CTASection.viewNow',
      defaultMessage: '馬上查看',
    },
  }),
  ContentSection: defineMessages({
    sectionTitle: {
      id: 'craft.ContentSection.sectionTitle',
      defaultMessage: '屹立不搖的組織都有相同的模式',
    },
    sectionContent: {
      id: 'craft.ContentSection.sectionContent',
      defaultMessage:
        '但是什麼時候該理想，什麼時候該現實，什麼時候該堅持，什麼時候該妥協，又是一門藝術了，而這中間的拿捏，也是「初階的管理人才」與「進階的管理人才」之間的差別吧！但是什麼時候該理想，什麼時候該現實，什麼時候該堅持，什麼時候該妥協，又是一門藝術了，而這中間的拿捏，也是「初階的管理人才」與「進階的管理人才」之間的差別吧！',
    },
  }),
  FAQSection: defineMessages({
    faqTitle: {
      id: 'craft.FAQSection.faqTitle',
      defaultMessage: '常見問題',
    },
    title1: {
      id: 'craft.FAQSection.title1',
      defaultMessage: '什麼是線上課程? 請問在哪裡上課？上課時間？',
    },
    description1: {
      id: 'craft.FAQSection.description1',
      defaultMessage:
        '網站的「線上課程」都可以隨時隨地透過電腦、手機、平板觀看購買後的課程影片，沒有時間和地點的限制！都可以隨時隨地透過電腦手機平板觀看購買後的課程影片沒有時間和地點的限制',
    },
    title2: {
      id: 'craft.FAQSection.title2',
      defaultMessage: '課程可以看幾次？',
    },
    description2: {
      id: 'craft.FAQSection.description2',
      defaultMessage:
        '網站的「線上課程」都可以隨時隨地透過電腦、手機、平板觀看購買後的課程影片，沒有時間和地點的限制！都可以隨時隨地透過電腦手機平板觀看購買後的課程影片沒有時間和地點的限制',
    },
    title3: {
      id: 'craft.FAQSection.title3',
      defaultMessage: '可以問老師問題嗎？',
    },
    description3: {
      id: 'craft.FAQSection.description3',
      defaultMessage:
        '網站的「線上課程」都可以隨時隨地透過電腦、手機、平板觀看購買後的課程影片，沒有時間和地點的限制！都可以隨時隨地透過電腦手機平板觀看購買後的課程影片沒有時間和地點的限制',
    },
  }),
  FeatureSection: defineMessages({
    title: {
      id: 'craft.FeatureSection.title',
      defaultMessage: '四大特色',
    },
  }),
  MemberCollectionSection: defineMessages({
    title: {
      id: 'craft.MemberCollectionSection.title',
      defaultMessage: '精選師資',
    },
  }),
  ReferrerSection: defineMessages({
    title: {
      id: 'craft.ReferrerSection.title',
      defaultMessage: '推薦評價',
    },
  }),
  RichFeatureSection: defineMessages({
    title: {
      id: 'craft.RichFeatureSection.title',
      defaultMessage: '六大特色',
    },
  }),
  StatisticsSection: defineMessages({
    title: {
      id: 'craft.StatisticsSection.title',
      defaultMessage: '提供完善的服務',
    },
  }),
  VerticalCTASection: defineMessages({
    title1: {
      id: 'craft.VerticalCTASection.title1',
      defaultMessage: '還在等什麼？立即查看課程',
    },
    title2: {
      id: 'craft.VerticalCTASection.title2',
      defaultMessage: '所以我們不該是為學習而學習，而是在設定好學習目標',
    },
    buttonTitle: {
      id: 'craft.VerticalCTASection.buttonTitle',
      defaultMessage: '馬上查看',
    },
  }),
}

export default craftMessages
