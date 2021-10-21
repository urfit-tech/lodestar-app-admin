import { Element, useEditor } from '@craftjs/core'
import { Image, Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import ProgramCardCollection from 'lodestar-app-element/src/components/craft/ProgramCardCollection'
import React, { ReactElement, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { craftPageMessages } from '../../../helpers/translation'
import { StyledFullWidthSelect } from '../../admin'
import ActivitySection from './ActivitySection'
import CoverSection from './CoverSection'
import CreatorSection from './CreatorSection'
import CTASection from './CTASection'
import CTAWithSubtitleSection from './CTAWithSubtitleSection'
import DescriptionSection from './DescriptionSection'
import EmbedSection from './EmbedSection'
import FAQSection from './FAQSection'
import FeatureSection from './FeatureSection'
import FeatureWithParagraphSection from './FeatureWithParagraphSection'
import ImageSection from './ImageSection'
import InstructorSection from './InstructorSection'
import PodcastProgramSection from './PodcastProgramSection'
import ProblemSection from './ProblemSection'
import ProgramSection from './ProgramSection'
import ProjectSection from './ProjectSection'
import ReferrerSection from './ReferrerSection'
import StatisticsSection from './StatisticsSection'
import TextSection from './TextSection'

export const StyledBoxWrapper = styled.div`
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
`

const toolGroups: { category: string; name: { id: string; defaultMessage: string }; toolComponent: ReactElement }[] = [
  {
    category: 'cover',
    name: craftPageMessages.label.cover,
    toolComponent: <CoverSection />,
  },
  {
    category: 'program',
    name: craftPageMessages.label.programBlock,
    toolComponent: <ProgramSection />,
  },
  {
    category: 'activity',
    name: craftPageMessages.label.activityBlock,
    toolComponent: <ActivitySection />,
  },
  {
    category: 'podcast',
    name: craftPageMessages.label.podcastBlock,
    toolComponent: <PodcastProgramSection />,
  },
  {
    category: 'lecturer',
    name: craftPageMessages.label.lecturerBlock,
    toolComponent: (
      <>
        <InstructorSection />
        <CreatorSection />
      </>
    ),
  },
  {
    category: 'fundraising',
    name: craftPageMessages.label.fundraising,
    toolComponent: <ProjectSection projectType="funding" />,
  },
  {
    category: 'preOrder',
    name: craftPageMessages.label.preOrderBlock,
    toolComponent: <ProjectSection />,
  },
  {
    category: 'statistics',
    name: craftPageMessages.label.statistics,
    toolComponent: (
      <>
        <StatisticsSection />
        <StatisticsSection variant="dark" />
        <StatisticsSection variant="image" />
      </>
    ),
  },
  {
    category: 'description',
    name: craftPageMessages.label.description,
    toolComponent: <DescriptionSection />,
  },
  {
    category: 'feature',
    name: craftPageMessages.label.feature,
    toolComponent: (
      <>
        <FeatureWithParagraphSection />
        <FeatureWithParagraphSection variant="dark" />
        <FeatureSection />
        <FeatureSection variant="dark" />
      </>
    ),
  },
  {
    category: 'callToAction',
    name: craftPageMessages.label.callToAction,
    toolComponent: (
      <>
        <CTASection />
        <CTASection variant="dark" />
        <CTAWithSubtitleSection />
        <CTAWithSubtitleSection variant="dark" />
      </>
    ),
  },
  {
    category: 'referrerEvaluation',
    name: craftPageMessages.label.referrerEvaluation,
    toolComponent: (
      <>
        <ReferrerSection />
        <ReferrerSection variant="card" />
      </>
    ),
  },
  {
    category: 'commonProblem',
    name: craftPageMessages.label.commonProblem,
    toolComponent: (
      <>
        <ProblemSection />
        <FAQSection />
      </>
    ),
  },
  {
    category: 'image',
    name: craftPageMessages.label.imageBlock,
    toolComponent: <ImageSection />,
  },
  {
    category: 'text',
    name: craftPageMessages.label.textBlock,
    toolComponent: <TextSection />,
  },
  {
    category: 'embedBlock',
    name: craftPageMessages.label.embedBlock,
    toolComponent: <EmbedSection />,
  },
  // { category: 'button', name: { id: '', defaultMessage: '' }, toolComponent: <ButtonSection /> },
]

const CraftToolbox: React.VFC = () => {
  const { connectors } = useEditor()
  const { formatMessage } = useIntl()
  const [selected, setSelected] = useState<SelectValue | undefined>(undefined)

  return (
    <div className="px-3 mt-4">
      <StyledFullWidthSelect
        defaultValue="cover"
        className="mb-4"
        showSearch
        allowClear
        placeholder={craftPageMessages.label.allTemplate}
        value={selected}
        onChange={(value: SelectValue) => setSelected(value)}
      >
        {toolGroups.map(({ category, name }) => (
          <Select.Option key={category} value={category}>
            {formatMessage(name)}
          </Select.Option>
        ))}
      </StyledFullWidthSelect>

      <StyledBoxWrapper
        className="mb-3"
        ref={ref =>
          ref &&
          connectors.create(ref, <Element is={ProgramCardCollection} options={{ source: 'publishedAt', limit: 4 }} />)
        }
      >
        <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-title-dark.png" />
      </StyledBoxWrapper>

      {toolGroups
        .filter(({ category }) => selected === category || selected === undefined)
        .map(({ toolComponent }) => toolComponent)}

      {/* {(selected === 'layout' || selected === undefined) && (
        <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/paragraph.png" />
        </StyledBoxWrapper>
      )} */}
    </div>
  )
}

export default CraftToolbox
