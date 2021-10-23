import * as CraftElement from 'lodestar-app-element/src/components/craft'
import * as CraftSetting from '../../components/craft/settings'
import CraftToolBox from './CraftToolBox'

const configureResolver = () => {
  CraftElement.CraftActivityCollection.craft = {
    related: {
      settings: CraftSetting.ActivityCollectionSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftProgramCollection.craft = {
    related: {
      settings: CraftSetting.ProgramCollectionSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftBackground.craft = {
    related: {
      settings: CraftSetting.BackgroundSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftElement.CraftButton.craft = {
    related: {
      settings: CraftSetting.ButtonSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftCard.craft = {
    related: {
      settings: CraftSetting.CardSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftCarousel.craft = {
    related: {
      settings: CraftSetting.CarouselSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftElement.CraftCarouselContainer.craft = {
    related: {
      settings: CraftSetting.CarouselContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftElement.CraftCollapse.craft = {
    related: {
      settings: CraftSetting.CollapseSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftContainer.craft = {
    related: {
      settings: CraftSetting.ContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftImage.craft = {
    related: {
      settings: CraftSetting.ImageSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftInstructor.craft = {
    related: {
      settings: CraftSetting.InstructorSettings,
    },
  }
  CraftElement.CraftCreator.craft = {
    related: {
      settings: CraftSetting.CreatorSettings,
    },
  }
  CraftElement.CraftLayout.craft = {
    related: {
      settings: CraftSetting.LayoutSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftElement.CraftParagraph.craft = {
    related: {
      settings: CraftSetting.ParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftPodcastProgram.craft = {
    related: {
      settings: CraftSetting.PodcastProgramSettings,
    },
  }
  CraftElement.CraftProject.craft = {
    related: {
      settings: CraftSetting.ProjectSettings,
    },
  }
  CraftElement.CraftStatistics.craft = {
    related: {
      settings: CraftSetting.StatisticsSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftTitle.craft = {
    related: {
      settings: CraftSetting.TitleSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftTitleAndParagraph.craft = {
    related: {
      settings: CraftSetting.TitleAndParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftElement.CraftEmbed.craft = {
    related: {
      settings: CraftSetting.EmbedSettings,
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
