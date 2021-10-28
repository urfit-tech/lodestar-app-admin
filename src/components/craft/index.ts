import * as CraftResolver from 'lodestar-app-element/src/components/craft'
import * as CraftSetting from '../../components/craft/settings'
import CraftToolBox from './CraftToolBox'

const configureResolver = () => {
  CraftResolver.CraftActivityCollection.craft = {
    related: {
      settings: CraftSetting.ActivityCollectionSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftProgramCollection.craft = {
    related: {
      settings: CraftSetting.ProgramCollectionSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftBackground.craft = {
    related: {
      settings: CraftSetting.BackgroundSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftResolver.CraftButton.craft = {
    related: {
      settings: CraftSetting.ButtonSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftCard.craft = {
    related: {
      settings: CraftSetting.CardSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftCarousel.craft = {
    related: {
      settings: CraftSetting.CarouselSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftResolver.CraftCarouselContainer.craft = {
    related: {
      settings: CraftSetting.CarouselContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftResolver.CraftCollapse.craft = {
    related: {
      settings: CraftSetting.CollapseSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftContainer.craft = {
    related: {
      settings: CraftSetting.ContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftImage.craft = {
    related: {
      settings: CraftSetting.ImageSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftInstructor.craft = {
    related: {
      settings: CraftSetting.InstructorSettings,
    },
  }
  CraftResolver.CraftCreator.craft = {
    related: {
      settings: CraftSetting.CreatorSettings,
    },
  }
  CraftResolver.CraftLayout.craft = {
    related: {
      settings: CraftSetting.LayoutSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftResolver.CraftParagraph.craft = {
    related: {
      settings: CraftSetting.ParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftPodcastProgram.craft = {
    related: {
      settings: CraftSetting.PodcastProgramSettings,
    },
  }
  CraftResolver.CraftProject.craft = {
    related: {
      settings: CraftSetting.ProjectSettings,
    },
  }
  CraftResolver.CraftStatistics.craft = {
    related: {
      settings: CraftSetting.StatisticsSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftTitle.craft = {
    related: {
      settings: CraftSetting.TitleSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftTitleAndParagraph.craft = {
    related: {
      settings: CraftSetting.TitleAndParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftResolver.CraftEmbed.craft = {
    related: {
      settings: CraftSetting.EmbedSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }

  return CraftResolver
}

export { configureResolver, CraftToolBox }
