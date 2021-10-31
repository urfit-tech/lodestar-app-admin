import * as CraftElement from 'lodestar-app-element/src/components/common/CraftElement'
import { CraftTemplate } from 'lodestar-app-element/src/components/common/Craftize'
import * as CraftSetting from '../../components/craft/settings'
import CraftToolBox from './CraftToolBox'
import { withResponsive } from './settings/CraftSettings'

const configureResolver = (custom: { onSave?: (template: CraftTemplate) => void }) => {
  CraftElement.CraftProgramCollection.craft = {
    related: {
      settings: withResponsive(CraftSetting.ProgramCollectionSettings),
    },
  }
  CraftElement.CraftSection.craft = {
    related: {
      settings: withResponsive(CraftSetting.SectionSettings),
    },
  }
  CraftElement.CraftButton.craft = {
    related: {
      settings: withResponsive(CraftSetting.ButtonSettings),
    },
  }
  CraftElement.CraftCard.craft = {
    related: {
      settings: withResponsive(CraftSetting.CardSettings),
    },
  }
  CraftElement.CraftCarousel.craft = {
    related: {
      settings: withResponsive(CraftSetting.CarouselSettings),
    },
  }
  CraftElement.CraftCollapse.craft = {
    related: {
      settings: withResponsive(CraftSetting.CollapseSettings),
    },
  }
  CraftElement.CraftImage.craft = {
    related: {
      settings: withResponsive(CraftSetting.ImageSettings),
    },
  }
  CraftElement.CraftLayout.craft = {
    related: {
      settings: withResponsive(CraftSetting.LayoutSettings),
    },
  }
  CraftElement.CraftParagraph.craft = {
    related: {
      settings: withResponsive(CraftSetting.ParagraphSettings),
    },
  }
  CraftElement.CraftTitle.craft = {
    related: {
      settings: withResponsive(CraftSetting.TitleSettings),
    },
  }
  CraftElement.CraftEmbedded.craft = {
    related: {
      settings: withResponsive(CraftSetting.EmbeddedSettings),
    },
  }

  for (const resolvedName in CraftElement) {
    if (Object.prototype.hasOwnProperty.call(CraftElement, resolvedName)) {
      const element = CraftElement[resolvedName as keyof typeof CraftElement]
      element.craft = {
        ...element.craft,
        custom: {
          ...element.craft?.custom,
          ...custom,
        },
      }
    }
  }
  return CraftElement
}

export { configureResolver, CraftToolBox }
