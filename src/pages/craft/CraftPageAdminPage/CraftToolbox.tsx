import { Element, useEditor } from '@craftjs/core'
import { Image, Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import {
  CraftButton,
  CraftCarousel,
  CraftImage,
  CraftParagraph,
  CraftTitle,
  CraftTitleAndParagraph,
} from 'lodestar-app-element/src/components/craft'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { StyledFullWidthSelect } from '../../../components/admin'
import {
  ActivitySection,
  CraftStatisticsSection,
  CreatorSection,
  CTASection,
  CTAWithSubtitleSection,
  DescriptionSection,
  // EmbedSection,
  FAQSection,
  FeatureSection,
  FeatureWithParagraphSection,
  InstructorSection,
  PodcastProgramSection,
  ProblemSection,
  ProgramSection,
  ProjectSection,
  ReferrerSection,
  StyledBoxWrapper,
} from '../../../components/craft'
import { craftPageMessages } from '../../../helpers/translation'

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
        placeholder={formatMessage(craftPageMessages.label.allTemplate)}
        value={selected}
        onChange={(value: SelectValue) => setSelected(value)}
      >
        <Select.Option key="cover" value="cover">
          {formatMessage(craftPageMessages.label.cover)}
        </Select.Option>
        <Select.Option key="program" value="program">
          {formatMessage(craftPageMessages.label.programBlock)}
        </Select.Option>
        <Select.Option key="activity" value="activity">
          {formatMessage(craftPageMessages.label.activityBlock)}
        </Select.Option>
        <Select.Option key="podcast" value="podcast">
          {formatMessage(craftPageMessages.label.podcastBlock)}
        </Select.Option>
        <Select.Option key="lecturer" value="lecturer">
          {formatMessage(craftPageMessages.label.lecturerBlock)}
        </Select.Option>
        <Select.Option key="fundraising" value="fundraising">
          {formatMessage(craftPageMessages.label.fundraising)}
        </Select.Option>
        <Select.Option key="preOrder" value="preOrder">
          {formatMessage(craftPageMessages.label.preOrderBlock)}
        </Select.Option>
        <Select.Option key="statistics" value="statistics">
          {formatMessage(craftPageMessages.label.statistics)}
        </Select.Option>
        <Select.Option key="description" value="description">
          {formatMessage(craftPageMessages.label.description)}
        </Select.Option>
        <Select.Option key="feature" value="feature">
          {formatMessage(craftPageMessages.label.feature)}
        </Select.Option>
        <Select.Option key="callToAction" value="callToAction">
          {formatMessage(craftPageMessages.label.callToAction)}
        </Select.Option>
        <Select.Option key="referrerEvaluation" value="referrerEvaluation">
          {formatMessage(craftPageMessages.label.referrerEvaluation)}
        </Select.Option>
        <Select.Option key="commonProblem" value="commonProblem">
          {formatMessage(craftPageMessages.label.commonProblem)}
        </Select.Option>
        <Select.Option key="image" value="image">
          {formatMessage(craftPageMessages.label.imageBlock)}
        </Select.Option>
        <Select.Option key="text" value="text">
          {formatMessage(craftPageMessages.label.textBlock)}
        </Select.Option>
      </StyledFullWidthSelect>

      {(selected === 'cover' || selected === undefined) && (
        <>
          <StyledBoxWrapper
            className="mb-3"
            ref={ref =>
              ref &&
              connectors.create(
                ref,
                <Element
                  is={CraftCarousel}
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
                />,
              )
            }
          >
            <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-title-dark.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper
            className="mb-3"
            ref={ref =>
              ref &&
              connectors.create(
                ref,
                <Element
                  is={CraftCarousel}
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
                />,
              )
            }
          >
            <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-image.png" />
          </StyledBoxWrapper>
        </>
      )}

      {(selected === 'program' || selected === undefined) && <ProgramSection />}

      {(selected === 'activity' || selected === undefined) && <ActivitySection />}

      {(selected === 'podcast' || selected === undefined) && <PodcastProgramSection />}

      {(selected === 'lecturer' || selected === undefined) && (
        <>
          <InstructorSection />
          <CreatorSection />
        </>
      )}

      {(selected === 'fundraising' || selected === undefined) && <ProjectSection projectType="funding" />}

      {(selected === 'preOrder' || selected === undefined) && <ProjectSection />}

      {(selected === 'statistics' || selected === undefined) && (
        <>
          <CraftStatisticsSection />
          <CraftStatisticsSection variant="dark" />
          <CraftStatisticsSection variant="image" />
        </>
      )}

      {(selected === 'description' || selected === undefined) && <DescriptionSection />}
      {(selected === 'feature' || selected === undefined) && (
        <>
          <FeatureWithParagraphSection />
          <FeatureWithParagraphSection variant="dark" />
          <FeatureSection />
          <FeatureSection variant="dark" />
        </>
      )}

      {(selected === 'callToAction' || selected === undefined) && (
        <>
          <CTASection />
          <CTASection variant="dark" />
          <CTAWithSubtitleSection />
          <CTAWithSubtitleSection variant="dark" />
        </>
      )}

      {(selected === 'referrerEvaluation' || selected === undefined) && (
        <>
          <ReferrerSection />
          <ReferrerSection variant="card" />
        </>
      )}
      {(selected === 'commonProblem' || selected === undefined) && (
        <>
          <ProblemSection />
          <FAQSection />
        </>
      )}
      {(selected === 'image' || selected === undefined) && (
        <StyledBoxWrapper
          className="mb-3"
          ref={ref =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={CraftImage}
                desktop={{
                  width: '100%',
                  padding: {},
                  margin: {},
                  coverUrl: 'https://static.kolable.com/images/default/craft/image.png',
                }}
                mobile={{
                  width: '100%',
                  padding: {},
                  margin: {},
                  coverUrl: 'https://static.kolable.com/images/default/craft/image.png',
                }}
              />,
            )
          }
        >
          <Image preview={false} src="https://static.kolable.com/images/default/craft/image.png" />
        </StyledBoxWrapper>
      )}
      {(selected === 'text' || selected === undefined) && (
        <StyledBoxWrapper
          className="mb-3"
          ref={ref =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={CraftTitle}
                titleContent="幫助自己做出決定"
                fontSize={28}
                margin={{ mt: '25', mb: '25', ml: '25', mr: '25' }}
                textAlign="center"
                fontWeight="normal"
                color="#585858"
              />,
            )
          }
        >
          <Image preview={false} src="https://static.kolable.com/images/default/craft/title.png" />
        </StyledBoxWrapper>
      )}
      {(selected === 'text' || selected === undefined) && (
        <StyledBoxWrapper
          className="mb-3"
          ref={ref =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={CraftParagraph}
                paragraphContent="比起不學習更令人擔憂的是：「一直在無效學習！」
                  所以我們不該是為學習而學習，而是在設定好學習目標，最關鍵的環節是需要找到適合自己有效的學習方式，才能在學習一項知識或技術後，真正轉化爲自己的能力。"
                fontSize={16}
                margin={{ mt: '25', mb: '25', ml: '25', mr: '25' }}
                lineHeight={1.69}
                textAlign="center"
                fontWeight="normal"
                color="#585858"
              />,
            )
          }
        >
          <Image preview={false} src="https://static.kolable.com/images/default/craft/paragraph.png" />
        </StyledBoxWrapper>
      )}
      {(selected === 'text' || selected === undefined) && (
        <>
          <StyledBoxWrapper
            className="mb-3"
            ref={ref =>
              ref &&
              connectors.create(
                ref,
                <Element
                  is={CraftTitleAndParagraph}
                  title={{
                    titleContent: '幫助自己做出決定',
                    fontSize: 20,
                    margin: { mt: '25', mb: '10', ml: '25', mr: '25' },
                    textAlign: 'left',
                    fontWeight: 'normal',
                    color: '#4c5b8f',
                  }}
                  paragraph={{
                    paragraphContent:
                      '比起不學習更令人擔憂的是：「一直在無效學習！」所以我們不該是為學習而學習，而是在設定好學習目標，最關鍵的環節是需要找到適合自己有效的學習方式，才能在學習一項知識或技術後，真正轉化爲自己的能力。',
                    fontSize: 16,
                    margin: { mb: '25', ml: '25', mr: '25' },
                    lineHeight: 1.69,
                    textAlign: 'left',
                    fontWeight: 'lighter',
                    color: '#585858',
                  }}
                />,
              )
            }
          >
            <Image preview={false} src="https://static.kolable.com/images/default/craft/title-and-paragraph.png" />
          </StyledBoxWrapper>
          {/* <EmbedSection /> */}
        </>
      )}
      {(selected === 'button' || selected === undefined) && (
        <StyledBoxWrapper
          className="mb-3"
          ref={ref =>
            ref &&
            connectors.create(
              ref,
              <Element
                is={CraftButton}
                title="馬上查看"
                link=""
                openNewTab={false}
                size="lg"
                block={false}
                variant="solid"
                color="#fff"
                backgroundType="solidColor"
                backgroundColor="#4c5b8f"
              />,
            )
          }
        >
          <Image preview={false} src="https://static.kolable.com/images/default/craft/button.png" />
        </StyledBoxWrapper>
      )}
      {/* {(selected === 'layout' || selected === undefined) && (
        <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/paragraph.png" />
        </StyledBoxWrapper>
      )} */}
    </div>
  )
}

export default CraftToolbox
