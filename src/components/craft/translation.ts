import { defineMessages } from 'react-intl'

const craftMessages = {
  '*': defineMessages({
    orderSelectorEnabled: {
      id: 'craft.*.orderSelectorEnabled',
      defaultMessage: 'Enable sort selector',
    },
    categorySelectorEnabled: { id: 'craft.*.categorySelectorEnabled', defaultMessage: 'Enable category selector' },
    primary: { id: 'craft.*.primary', defaultMessage: 'Style 1' },
    secondary: { id: 'craft.*.secondary', defaultMessage: 'Style 2' },
    variant: { id: 'craft.*.variant', defaultMessage: 'Component style' },
    collectionVariant: { id: 'craft.*.collectionVariant', defaultMessage: 'Collection style' },
    grid: { id: 'craft.*.grid', defaultMessage: 'Grid' },
    carousel: { id: 'craft.*.carousel', defaultMessage: 'Carousel' },
    spaceStyle: { id: 'craft.*.spaceStyle', defaultMessage: 'Spacing style' },
    positionStyle: { id: 'craft.*.positionStyle', defaultMessage: 'Position style' },
    borderStyle: { id: 'craft.*.borderStyle', defaultMessage: 'Border style' },
    title: { id: 'craft.*.title', defaultMessage: 'Title' },
    titleStyle: { id: 'craft.*.titleStyle', defaultMessage: 'Title style' },
    paragraphStyle: { id: 'craft.*.paragraphStyle', defaultMessage: 'Paragraph style' },
    width: { id: 'craft.*.width', defaultMessage: 'Width' },
    fontSize: { id: 'craft.*.fontSize', defaultMessage: 'Font size' },
    lineHeight: { id: 'craft.*.lineHeight', defaultMessage: 'Line height' },
    textAlign: { id: 'craft.*.textAlign', defaultMessage: 'Alignment' },
    left: { id: 'craft.*.left', defaultMessage: 'Left' },
    center: { id: 'craft.*.center', defaultMessage: 'Center' },
    right: { id: 'craft.*.right', defaultMessage: 'Right' },
    fontWeight: { id: 'craft.*.fontWeight', defaultMessage: 'Font weight' },
    lighter: { id: 'craft.*.lighter', defaultMessage: 'Light' },
    normal: { id: 'craft.*.normal', defaultMessage: 'Normal' },
    bold: { id: 'craft.*.bold', defaultMessage: 'Bold' },
    advancedSetting: { id: 'craft.*.advancedSetting', defaultMessage: 'Advanced settings' },
    className: { id: 'craft.*.className', defaultMessage: 'Class name' },
    ariaLabel: { id: 'craft.*.ariaLabel', defaultMessage: 'Image label description' },
    all: { id: 'craft.*.all', defaultMessage: 'all' },
    collectionType: { id: 'craft.*.collectionType', defaultMessage: 'type' },
  }),
  ProgramCollectionSettings: defineMessages({
    programSectionId: { id: 'craft.ProgramCollectionSettings.programSectionId', defaultMessage: 'Program section ID' },
  }),
  ActivityCollectionSettings: defineMessages({
    activitySectionId: { id: 'craft.ActivityCollectionSettings.activitySectionId', defaultMessage: 'Activity section ID' },
  }),
  MemberCollectionSettings: defineMessages({
    memberSectionId: { id: 'craft.MemberCollectionSettings.memberSectionId', defaultMessage: 'Member section ID' },
  }),
  ProgramContentCollectionSettings: defineMessages({
    programContentSectionId: {
      id: 'craft.ProgramContentCollectionSettings.programContentSectionId',
      defaultMessage: 'Program content section ID',
    },
  }),
  ProgramPackageCollectionSettings: defineMessages({
    programPackageSectionId: {
      id: 'craft.ProgramPackageCollectionSettings.programPackageSectionId',
      defaultMessage: 'Program package section ID',
    },
  }),
  ProjectCollectionSettings: defineMessages({
    projectSectionId: { id: 'craft.ProjectCollectionSettings.projectSectionId', defaultMessage: 'Project section ID' },
    fundingProject: { id: 'craft.ProjectCollectionSettings.fundingProject', defaultMessage: 'Funding Project' },
    preOrderProject: { id: 'craft.ProjectCollectionSettings.preOrderProject', defaultMessage: 'Pre Order Project' },
    portfolioProject: { id: 'craft.ProjectCollectionSettings.portfolioProject', defaultMessage: 'Portfolio Project' },
  }),
  PostCollectionSettings: defineMessages({
    postSectionId: { id: 'craft.PostCollectionSettings.postSectionId', defaultMessage: 'Post section ID' },
  }),
  ImageSettings: defineMessages({
    autoImageHeight: { id: 'craft.ImageSettings.autoImageHeight', defaultMessage: 'auto image height' },
    fullScreenImage: { id: 'craft.ImageSettings.fullScreenImage', defaultMessage: 'full screen image' },
  }),
  SizeStyleInput: defineMessages({
    height: { id: 'craft.SizeStyleInput.height', defaultMessage: 'Height' },
  }),
  LayoutSettings: defineMessages({
    ratio: { id: 'craft.LayoutSettings.ratio', defaultMessage: 'Ratio' },
    gap: { id: 'craft.LayoutSettings.gap', defaultMessage: 'Gap' },
  }),
  SectionSettings: defineMessages({
    layout: { id: 'craft.SectionSettings.layout', defaultMessage: 'Layout' },
    horizontal: { id: 'craft.SectionSettings.horizontal', defaultMessage: 'Horizontal' },
    vertical: { id: 'craft.SectionSettings.vertical', defaultMessage: 'Vertical' },
    horizontalAlign: { id: 'craft.SectionSettings.horizontalAlign', defaultMessage: 'Horizontal alignment' },
    verticalAlign: { id: 'craft.SectionSettings.verticalAlign', defaultMessage: 'Vertical alignment' },
    left: { id: 'craft.SectionSettings.left', defaultMessage: 'Left' },
    right: { id: 'craft.SectionSettings.right', defaultMessage: 'Right' },
    center: { id: 'craft.SectionSettings.center', defaultMessage: 'Center' },
    none: { id: 'craft.SectionSettings.none', defaultMessage: 'none' },
    top: { id: 'craft.SectionSettings.top', defaultMessage: 'Top' },
    bottom: { id: 'craft.SectionSettings.bottom', defaultMessage: 'Bottom' },
    normal: { id: 'craft.SectionSettings.normal', defaultMessage: 'Normal' },
    hide: { id: 'craft.SectionSettings.hide', defaultMessage: 'Hidden' },
    appearAfterLogin: { id: 'craft.SectionSettings.appearAfterLogin', defaultMessage: 'Show after login' },
    disappearAfterLogin: { id: 'craft.SectionSettings.disappearAfterLogin', defaultMessage: 'Hide after login' },
    link: { id: 'craft.SectionSettings.link', defaultMessage: 'Link' },
    openNewTab: { id: 'craft.SectionSettings.openNewTab', defaultMessage: 'Open in new tab' },
    sectionId: { id: 'craft.SectionSettings.sectionId', defaultMessage: 'Section ID' },
  }),
  TitleSettings: defineMessages({
    titleContent: { id: 'craft.TitleSettings.titleContent', defaultMessage: 'Title content' },
  }),
  ParagraphSettings: defineMessages({
    paragraphContent: { id: 'craft.ParagraphSettings.paragraphContent', defaultMessage: 'Paragraph content' },
    content: { id: 'craft.ParagraphSettings.content', defaultMessage: 'Content' },
  }),
  EmbeddedSettings: defineMessages({
    embedSetting: { id: 'craft.EmbeddedSettings.embedSettings', defaultMessage: 'Embed settings' },
    embedStyle: { id: 'craft.EmbeddedSettings.embedStyle', defaultMessage: 'Embed style' },
    fillIframeFormatPlz: {
      id: 'craft.EmbeddedSettings.fillIframeFormatPlz',
      defaultMessage: 'Please fill in iframe',
    },
  }),
  AIBotSettings: defineMessages({
    setting: { id: 'craft.AIBotSettings.setting', defaultMessage: 'Basic settings' },
    style: { id: 'craft.AIBotSettings.style', defaultMessage: 'Style' },
    systemPrompt: { id: 'craft.AIBotSettings.systemPrompt', defaultMessage: 'System prompt' },
    systemPromptPlaceholder: {
      id: 'craft.AIBotSettings.systemPromptPlaceholder',
      defaultMessage: 'You are an expert of...',
    },
    assistantQuestions: { id: 'craft.AIBotSettings.assistantQuestions', defaultMessage: 'User Q&A' },
    assistantQuestionsPlaceholder: {
      id: 'craft.AIBotSettings.assistantQuestionsPlaceholder',
      defaultMessage: 'What do you want to ask?',
    },
    addQuestion: { id: 'craft.AIBotSettings.addQuestion', defaultMessage: 'Add question' },
  }),
  CarouselSettings: defineMessages({
    carouselStyle: { id: 'craft.CarouselSettings.carouselStyle', defaultMessage: 'Carousel style' },
    carouselSetting: { id: 'craft.CarouselSettings.carouselSetting', defaultMessage: 'Carousel settings' },
    currentSlide: { id: 'craft.CarouselSettings.currentSlide', defaultMessage: 'Current slide' },
    autoplay: { id: 'craft.CarouselSettings.autoplay', defaultMessage: 'Autoplay' },
    autoplaySpeed: { id: 'craft.CarouselSettings.autoplaySpeed', defaultMessage: 'Autoplay speed (milliseconds)' },
    infinite: { id: 'craft.CarouselSettings.infinite', defaultMessage: 'Infinite loop' },
    arrows: { id: 'craft.CarouselSettings.arrows', defaultMessage: 'Show arrows' },
    centerMode: { id: 'craft.CarouselSettings.centerMode', defaultMessage: 'Center mode' },
    centerPadding: { id: 'craft.CarouselSettings.centerPadding', defaultMessage: 'Center padding' },
    dots: { id: 'craft.CarouselSettings.dots', defaultMessage: 'Show dots' },
    slideToShow: { id: 'craft.CarouselSettings.slideToShow', defaultMessage: 'Slides to show' },
    slideToScroll: { id: 'craft.CarouselSettings.slideToScroll', defaultMessage: 'Slides to scroll' },
    arrowsVerticalPosition: {
      id: 'craft.CarouselSettings.arrowsVerticalPosition',
      defaultMessage: 'Arrows vertical position',
    },
    arrowsLeftPosition: { id: 'craft.CarouselSettings.arrowsLeftPosition', defaultMessage: 'Left arrow position' },
    arrowsLeftSize: { id: 'craft.CarouselSettings.arrowsLeftSize', defaultMessage: 'Left arrow size' },
    arrowsRightPosition: { id: 'craft.CarouselSettings.arrowsRightPosition', defaultMessage: 'Right arrow position' },
    arrowsRightSize: { id: 'craft.CarouselSettings.arrowsRightSize', defaultMessage: 'Right arrow size' },
    dotsPosition: { id: 'craft.CarouselSettings.dotsPosition', defaultMessage: 'Dots position' },
    dotsWidth: { id: 'craft.CarouselSettings.dotsWidth', defaultMessage: 'Dots width' },
    dotsHeight: { id: 'craft.CarouselSettings.dotsHeight', defaultMessage: 'Dots height' },
    dotsMargin: { id: 'craft.CarouselSettings.dotsMargin', defaultMessage: 'Dots margin' },
    dotsRadius: { id: 'craft.CarouselSettings.dotsRadius', defaultMessage: 'Dots radius' },
    height: { id: 'craft.CarouselSettings.height', defaultMessage: 'Height' },
  }),
  ButtonSettings: defineMessages({
    buttonSetting: { id: 'craft.ButtonSettings.buttonSetting', defaultMessage: 'Button settings' },
    buttonStyle: { id: 'craft.ButtonSettings.buttonStyle', defaultMessage: 'Button style' },
    size: { id: 'craft.ButtonSettings.size', defaultMessage: 'Size' },
    large: { id: 'craft.ButtonSettings.large', defaultMessage: 'Large' },
    middle: { id: 'craft.ButtonSettings.middle', defaultMessage: 'Medium' },
    small: { id: 'craft.ButtonSettings.small', defaultMessage: 'Small' },
    buttonBlock: { id: 'craft.ButtonSettings.buttonBlock', defaultMessage: 'Full width' },
  }),
  TextStyledInput: defineMessages({
    margin: { id: 'craft.TextStyledInput.margin', defaultMessage: 'Margin' },
  }),
  BorderStyleInput: defineMessages({
    radius: { id: 'craft.BorderStyleInput.radius', defaultMessage: 'Radius' },
  }),
  PositionStyleInput: defineMessages({
    none: { id: 'craft.PositionStyleInput.none', defaultMessage: 'No border' },
    solid: { id: 'craft.PositionStyleInput.solid', defaultMessage: 'Solid' },
  }),
  ColorPicker: defineMessages({
    color: { id: 'craft.ColorPicker.color', defaultMessage: 'Color' },
  }),
  BackgroundStyleInput: defineMessages({
    background: { id: 'craft.BackgroundStyleInput.background', defaultMessage: 'Background' },
    none: { id: 'craft.BackgroundStyleInput.none', defaultMessage: 'None' },
    solid: { id: 'craft.BackgroundStyleInput.solid', defaultMessage: 'Solid color' },
    image: { id: 'craft.BackgroundStyleInput.image', defaultMessage: 'Image' },
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
      defaultMessage: 'Activity',
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
