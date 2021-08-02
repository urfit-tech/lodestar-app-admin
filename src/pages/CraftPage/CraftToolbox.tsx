import { Element, useEditor } from '@craftjs/core'
import { Image, Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { StyledFullWidthSelect } from '../../components/admin'
import CraftCarousel from '../../components/craft/CraftCarousel'
import { craftPageMessages } from '../../helpers/translation'

const StyledBoxWrapper = styled.div`
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.1);
`

const CraftToolbox: React.VFC<{ setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({ setActiveKey }) => {
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
                      title: '輪播 banner01',
                      paragraph: 'content',
                      desktopCoverUrl: 'desktop',
                      mobileCoverUrl: 'mobile',
                      link: 'link',
                      openNewTab: false,
                    },
                  ]}
                  titleStyle={{
                    fontSize: 10,
                    padding: {},
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: '#c8c858',
                  }}
                  paragraphStyle={{
                    fontSize: 14,
                    padding: {},
                    lineHeight: 1,
                    textAlign: 'left',
                    fontWeight: 'normal',
                    color: '#cccdff',
                  }}
                  setActiveKey={setActiveKey}
                />,
              )
            }
          >
            <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-title-dark.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-image.png" />
          </StyledBoxWrapper>
        </>
      )}

      {(selected === 'program' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/program.png" />
          </StyledBoxWrapper>
        </>
      )}

      {(selected === 'activity' || selected === undefined) && (
        <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/activity.png" />
        </StyledBoxWrapper>
      )}

      {(selected === 'podcast' || selected === undefined) && (
        <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/podcast.png" />
        </StyledBoxWrapper>
      )}

      {(selected === 'lecturer' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/creator.png" />
          </StyledBoxWrapper>
        </>
      )}

      {(selected === 'fundraising' || selected === undefined) && (
        <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/fundraising.png" />
        </StyledBoxWrapper>
      )}

      {(selected === 'preOrder' || selected === undefined) && (
        <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/pre-order.png" />
        </StyledBoxWrapper>
      )}

      {(selected === 'statistics' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics-dark.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics-image.png" />
          </StyledBoxWrapper>
        </>
      )}

      {(selected === 'description' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/description.png" />
          </StyledBoxWrapper>
        </>
      )}
      {(selected === 'feature' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/feature.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/feature-dark.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/feature-title.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/feature-title-dark.png" />
          </StyledBoxWrapper>
        </>
      )}

      {(selected === 'callToAction' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/cta.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/cta-dark.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/cta-vertical.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/cta-vertical-dark.png" />
          </StyledBoxWrapper>
        </>
      )}

      {(selected === 'referrerEvaluation' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/recommend-dialogue.png" />
          </StyledBoxWrapper>

          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/recommend.png" />
          </StyledBoxWrapper>
        </>
      )}
      {(selected === 'commonProblem' || selected === undefined) && (
        <>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/faq-accordion.png" />
          </StyledBoxWrapper>
          <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
            <Image preview={false} src="https://static.kolable.com/images/default/craft/faq-column.png" />
          </StyledBoxWrapper>
        </>
      )}
      {(selected === 'image' || selected === undefined) && (
        <StyledBoxWrapper className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/image.png" />
        </StyledBoxWrapper>
      )}
      {(selected === 'text' || selected === undefined) && (
        <StyledBoxWrapper ref={ref => ref && connectors.create(ref, <></>)}>
          <Image preview={false} src="https://static.kolable.com/images/default/craft/text.png" />
        </StyledBoxWrapper>
      )}
    </div>
  )
}

export default CraftToolbox
