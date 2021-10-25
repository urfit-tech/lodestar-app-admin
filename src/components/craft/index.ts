import * as CraftElement from 'lodestar-app-element/src/components/common/CraftElement'
import * as CraftSetting from '../../components/craft/settings'
import CraftToolBox from './CraftToolBox'
import { withResponsive } from './settings/CraftSettings'

const configureResolver = () => {
  CraftElement.CraftProgramCollection.craft = {
    related: {
      settings: withResponsive(CraftSetting.ProgramCollectionSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftSection.craft = {
    related: {
      settings: withResponsive(CraftSetting.SectionSettings),
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftElement.CraftButton.craft = {
    related: {
      settings: withResponsive(CraftSetting.ButtonSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftCard.craft = {
    related: {
      settings: withResponsive(CraftSetting.CardSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftCarousel.craft = {
    related: {
      settings: withResponsive(CraftSetting.CarouselSettings),
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftElement.CraftCollapse.craft = {
    related: {
      settings: withResponsive(CraftSetting.CollapseSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftImage.craft = {
    related: {
      settings: withResponsive(CraftSetting.ImageSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftLayout.craft = {
    related: {
      settings: withResponsive(CraftSetting.LayoutSettings),
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftElement.CraftParagraph.craft = {
    related: {
      settings: withResponsive(CraftSetting.ParagraphSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftTitle.craft = {
    related: {
      settings: withResponsive(CraftSetting.TitleSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftEmbedded.craft = {
    related: {
      settings: withResponsive(CraftSetting.EmbeddedSettings),
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }

  return CraftElement
}

export { configureResolver, CraftToolBox }
