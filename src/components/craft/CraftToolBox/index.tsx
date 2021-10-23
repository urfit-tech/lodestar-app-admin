import * as CraftElement from 'lodestar-app-element/src/components/craft'
import React from 'react'
import CraftTool from '../CraftTool'
import DescriptionSection from './DescriptionSection'

export type CraftToolboxCategory = 'basic' | 'product' | 'template'
const CraftToolbox: React.VFC<{ category: CraftToolboxCategory }> = ({ category }) => {
  return (
    <div className="px-3 mt-4">
      <CraftTool
        as={CraftElement.CraftBackground}
        coverUrl="https://static.kolable.com/images/default/craft/section.png"
        backgroundType="none"
        padding={{ pt: '64', pb: '64' }}
        margin={{ mb: '5' }}
        canvas
      />
      <CraftTool as={CraftElement.CraftImage} coverUrl="https://static.kolable.com/images/default/craft/image.png" />
      <CraftTool
        as={CraftElement.CraftCarousel}
        coverUrl="https://static.kolable.com/images/default/craft/banner-image.png"
        type="normal"
        covers={[
          {
            title: '換個方式說溝通更有效',
            paragraph:
              '生命的目的是盡可能多地成為你自己，將你天生的才能和能力與你生活經驗中的智慧結合起來，並將它們與你內在的精神融合在一起，然後把自己作為禮物送回世界。',
            mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-01-m.png',
            desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-01.png',
            link: '/programs',
            openNewTab: false,
          },
          {
            title: '',
            paragraph: '',
            mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-02-m.jpg',
            desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-02.jpg',
            link: '',
            openNewTab: false,
          },
        ]}
        titleStyle={{
          color: '#ffffff',
          margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
          fontSize: 26,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
        paragraphStyle={{
          color: '#ffffff',
          margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
          fontSize: 16,
          textAlign: 'center',
          fontWeight: 'normal',
          lineHeight: 1.5,
        }}
      />
      <CraftTool
        as={CraftElement.CraftCarousel}
        coverUrl="https://static.kolable.com/images/default/craft/banner-title-dark.png"
        type="normal"
        covers={[
          {
            title: '',
            paragraph: '',
            mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-02-m.jpg',
            desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-02.jpg',
            link: '',
            openNewTab: false,
          },
          {
            title: '',
            paragraph: '',
            mobileCoverUrl: 'https://static.kolable.com/images/demo/cover-01-m.png',
            desktopCoverUrl: 'https://static.kolable.com/images/demo/cover-01.png',
            link: '',
            openNewTab: false,
          },
        ]}
        titleStyle={{
          color: '#ffffff',
          margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
          fontSize: 26,
          textAlign: 'center',
          fontWeight: 'bold',
        }}
        paragraphStyle={{
          color: '#ffffff',
          margin: { mb: '0', ml: '0', mr: '0', mt: '0' },
          fontSize: 16,
          textAlign: 'center',
          fontWeight: 'normal',
          lineHeight: 1.5,
        }}
      />
      <CraftTool as={DescriptionSection} coverUrl="https://static.kolable.com/images/default/craft/description.png" />
    </div>
  )
}

// const tools: {
//   category: CraftToolboxCategory
//   name: { id: string; defaultMessage: string }
//   element: ReactElement
// }[] = [
//   {
//     category: 'template',
//     name: craftPageMessages.label.cover,
//     element: <CoverSection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.programBlock,
//     element: <ProgramSection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.activityBlock,
//     element: <ActivitySection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.podcastBlock,
//     element: <PodcastProgramSection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.lecturerBlock,
//     element: (
//       <>
//         <InstructorSection />
//         <CreatorSection />
//       </>
//     ),
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.fundraising,
//     element: <ProjectSection projectType="funding" />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.preOrderBlock,
//     element: <ProjectSection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.statistics,
//     element: (
//       <>
//         <StatisticsSection />
//         <StatisticsSection variant="dark" />
//         <StatisticsSection variant="image" />
//       </>
//     ),
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.description,
//     element: <DescriptionSection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.feature,
//     element: (
//       <>
//         <FeatureWithParagraphSection />
//         <FeatureWithParagraphSection variant="dark" />
//         <FeatureSection />
//         <FeatureSection variant="dark" />
//       </>
//     ),
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.callToAction,
//     element: (
//       <>
//         <CTASection />
//         <CTASection variant="dark" />
//         <CTAWithSubtitleSection />
//         <CTAWithSubtitleSection variant="dark" />
//       </>
//     ),
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.referrerEvaluation,
//     element: (
//       <>
//         <ReferrerSection />
//         <ReferrerSection variant="card" />
//       </>
//     ),
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.commonProblem,
//     element: (
//       <>
//         <ProblemSection />
//         <FAQSection />
//       </>
//     ),
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.imageBlock,
//     element: <ImageSection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.textBlock,
//     element: <TextSection />,
//   },
//   {
//     category: 'template',
//     name: craftPageMessages.label.embedBlock,
//     element: <EmbedSection />,
//   },
//   // { category: 'template', name: { id: '', defaultMessage: '' }, element: <ButtonSection /> },
// ]

export default CraftToolbox
