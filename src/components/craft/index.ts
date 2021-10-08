import {
  CraftActivity,
  CraftBackground,
  CraftButton,
  CraftCard,
  CraftCarousel,
  CraftCarouselContainer,
  CraftCollapse,
  CraftContainer,
  CraftCreator,
  CraftImage,
  CraftInstructor,
  CraftLayout,
  CraftParagraph,
  CraftPodcastProgram,
  CraftProgram,
  CraftProject,
  CraftStatistics,
  CraftTitle,
  CraftTitleAndParagraph,
  CraftProgramCollection,
} from 'lodestar-app-element/src/components/craft'
import {
  ActivitySettings,
  BackgroundSettings,
  ButtonSettings,
  CardSettings,
  CarouselContainerSettings,
  CarouselSettings,
  CollapseSettings,
  ContainerSettings,
  CreatorSettings,
  ImageSettings,
  InstructorSettings,
  LayoutSettings,
  ParagraphSettings,
  PodcastProgramSettings,
  ProgramSettings,
  ProjectSettings,
  StatisticsSettings,
  TitleAndParagraphSettings,
  TitleSettings,
} from '../../components/craft/settings'
import CraftToolBox from './CraftToolBox'
import ProgramCollectionSettings from './settings/ProgramCollectionSettings'

const configureResolver = () => {
  CraftActivity.craft = {
    related: {
      settings: ActivitySettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftProgramCollection.craft = {
    related: {
      settings: ProgramCollectionSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftBackground.craft = {
    related: {
      settings: BackgroundSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftButton.craft = {
    related: {
      settings: ButtonSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftCard.craft = {
    related: {
      settings: CardSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftCarousel.craft = {
    related: {
      settings: CarouselSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftCarouselContainer.craft = {
    related: {
      settings: CarouselContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftCollapse.craft = {
    related: {
      settings: CollapseSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftContainer.craft = {
    related: {
      settings: ContainerSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftImage.craft = {
    related: {
      settings: ImageSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftInstructor.craft = {
    related: {
      settings: InstructorSettings,
    },
  }
  CraftCreator.craft = {
    related: {
      settings: CreatorSettings,
    },
  }
  CraftLayout.craft = {
    related: {
      settings: LayoutSettings,
    },
    custom: {
      button: {
        label: 'deleteAllBlock',
      },
    },
  }
  CraftParagraph.craft = {
    related: {
      settings: ParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftPodcastProgram.craft = {
    related: {
      settings: PodcastProgramSettings,
    },
  }
  CraftProgram.craft = {
    related: {
      settings: ProgramSettings,
    },
  }
  CraftProject.craft = {
    related: {
      settings: ProjectSettings,
    },
  }
  CraftStatistics.craft = {
    related: {
      settings: StatisticsSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftTitle.craft = {
    related: {
      settings: TitleSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }
  CraftTitleAndParagraph.craft = {
    related: {
      settings: TitleAndParagraphSettings,
    },
    custom: {
      button: {
        label: 'deleteBlock',
      },
    },
  }

  return {
    CraftContainer,
    CraftCreator,
    CraftLayout,
    CraftTitle,
    CraftParagraph,
    CraftTitleAndParagraph,
    CraftButton,
    CraftCarousel,
    CraftStatistics,
    CraftImage,
    CraftCard,
    CraftCollapse,
    CraftBackground,
    CraftProgram,
    CraftProgramCollection,
    CraftProject,
    CraftActivity,
    CraftPodcastProgram,
    CraftInstructor,
    CraftCarouselContainer,
  }
}

export { configureResolver, CraftToolBox }
