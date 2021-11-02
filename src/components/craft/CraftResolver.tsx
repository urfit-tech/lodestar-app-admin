import * as CraftElement from 'lodestar-app-element/src/components/common/CraftElement'
import { CraftTemplate } from 'lodestar-app-element/src/components/common/Craftize'
import { useIntl } from 'react-intl'
import * as CraftSetting from '../../components/craft/settings'
import { withResponsive } from './settings/ResponsiveSettings'

export const useResolver = (custom: { onSave?: (template: CraftTemplate) => void }) => {
  const { formatMessage } = useIntl()
  CraftElement.CraftProgramCollection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ProgramCollectionSettings', defaultMessage: '課程' }),
    related: {
      settings: withResponsive(CraftSetting.ProgramCollectionSettings),
    },
  }
  CraftElement.CraftSection.craft = {
    displayName: formatMessage({ id: 'craft.resolver.SectionSettings', defaultMessage: '區塊' }),
    related: {
      settings: withResponsive(CraftSetting.SectionSettings),
    },
  }
  CraftElement.CraftButton.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ButtonSettings', defaultMessage: '按鈕' }),
    related: {
      settings: withResponsive(CraftSetting.ButtonSettings),
    },
  }
  CraftElement.CraftCard.craft = {
    displayName: formatMessage({ id: 'craft.resolver.CardSettings', defaultMessage: '卡片' }),
    related: {
      settings: withResponsive(CraftSetting.CardSettings),
    },
  }
  CraftElement.CraftCarousel.craft = {
    displayName: formatMessage({ id: 'craft.resolver.CarouselSettings', defaultMessage: '輪播' }),
    related: {
      settings: withResponsive(CraftSetting.CarouselSettings),
    },
  }
  CraftElement.CraftCollapse.craft = {
    displayName: formatMessage({ id: 'craft.resolver.CollapseSettings', defaultMessage: '折疊' }),
    related: {
      settings: withResponsive(CraftSetting.CollapseSettings),
    },
  }
  CraftElement.CraftImage.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ImageSettings', defaultMessage: '圖片' }),
    related: {
      settings: withResponsive(CraftSetting.ImageSettings),
    },
  }
  CraftElement.CraftLayout.craft = {
    displayName: formatMessage({ id: 'craft.resolver.LayoutSettings', defaultMessage: '佈局' }),
    related: {
      settings: withResponsive(CraftSetting.LayoutSettings),
    },
  }
  CraftElement.CraftParagraph.craft = {
    displayName: formatMessage({ id: 'craft.resolver.ParagraphSettings', defaultMessage: '段落' }),
    related: {
      settings: withResponsive(CraftSetting.ParagraphSettings),
    },
  }
  CraftElement.CraftTitle.craft = {
    displayName: formatMessage({ id: 'craft.resolver.TitleSettings', defaultMessage: '標題' }),
    related: {
      settings: withResponsive(CraftSetting.TitleSettings),
    },
  }
  CraftElement.CraftEmbedded.craft = {
    displayName: formatMessage({ id: 'craft.resolver.EmbeddedSettings', defaultMessage: '嵌入' }),
    related: {
      settings: withResponsive(CraftSetting.EmbeddedSettings),
    },
  }
  return CraftElement
}
