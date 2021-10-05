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
} from 'lodestar-app-element/src/components/craft'
import styled from 'styled-components'
import ActivitySettings from './settings/ActivitySettings'
import BackgroundSettings from './settings/BackgroundSettings'
import ButtonSettings from './settings/ButtonSettings'
import CardSettings from './settings/CardSettings'
import CarouselContainerSettings from './settings/CarouselContainerSettings'
import CarouselSettings from './settings/CarouselSettings'
import CollapseSettings from './settings/CollapseSettings'
import ContainerSettings from './settings/ContainerSettings'
import CreatorSettings from './settings/CreatorSettings'
import ImageSettings from './settings/ImageSettings'
import InstructorSettings from './settings/InstructorSettings'
import LayoutSettings from './settings/LayoutSettings'
import ParagraphSettings from './settings/ParagraphSettings'
import PodcastProgramSettings from './settings/PodcastProgramSettings'
import ProgramSettings from './settings/ProgramSettings'
import ProjectSettings from './settings/ProjectSettings'
import StatisticsSettings from './settings/StatisticsSettings'
import TitleAndParagraphSettings from './settings/TitleAndParagraphSettings'
import TitleSettings from './settings/TitleSettings'

export const configureResolver = () => {
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
    CraftProject,
    CraftActivity,
    CraftPodcastProgram,
    CraftInstructor,
    CraftCarouselContainer,
  }
}

export const StyledCraftSettingLabel = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  font-weight: 500;
`

export const StyledBoxWrapper = styled.div`
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
`

export { default as ActivitySection } from './ActivitySection'
export { default as CreatorSection } from './CreatorSection'
export { default as CTASection } from './CTASection'
export { default as CTAWithSubtitleSection } from './CTAWithSubtitleSection'
export { default as DescriptionSection } from './DescriptionSection'
export { default as EmbedSection } from './EmbedSection'
export { default as FAQSection } from './FAQSection'
export { default as FeatureSection } from './FeatureSection'
export { default as FeatureWithParagraphSection } from './FeatureWithParagraphSection'
export { default as InstructorSection } from './InstructorSection'
export { default as PodcastProgramSection } from './PodcastProgramSection'
export { default as ProblemSection } from './ProblemSection'
export { default as ProgramSection } from './ProgramSection'
export { default as ProjectSection } from './ProjectSection'
export { default as ReferrerSection } from './ReferrerSection'
export { default as CraftStatisticsSection } from './StatisticsSection'
