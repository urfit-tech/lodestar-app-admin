import { Element, useEditor } from '@craftjs/core'
import { Image, Select } from 'antd'
import { SelectValue } from 'antd/lib/select'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { StyledFullWidthSelect } from '../admin'
import CraftCarousel from './CraftCarousel'

const CraftToolbox: React.VFC<{ setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({ setActiveKey }) => {
  const { connectors } = useEditor()
  const { formatMessage } = useIntl()
  const [selected, setSelected] = useState<SelectValue | undefined>(undefined)

  return (
    <div className="px-3 mt-2">
      <StyledFullWidthSelect
        defaultValue="cover"
        className="mb-4"
        showSearch
        placeholder={formatMessage(craftPageMessages.label.allTemplate)}
        value={selected}
        onChange={(value: SelectValue) => setSelected(value)}
      >
        <Select.Option key="cover" value="cover">
          {formatMessage(craftPageMessages.label.cover)}
        </Select.Option>
        <Select.Option key="program" value="program">
          {formatMessage(craftPageMessages.label.program)}
        </Select.Option>
        <Select.Option key="activity" value="activity">
          {formatMessage(craftPageMessages.label.activity)}
        </Select.Option>
        <Select.Option key="podcast" value="podcast">
          {formatMessage(craftPageMessages.label.podcast)}
        </Select.Option>
        <Select.Option key="lecturer" value="lecturer">
          {formatMessage(craftPageMessages.label.lecturer)}
        </Select.Option>
        <Select.Option key="fundraising" value="fundraising">
          {formatMessage(craftPageMessages.label.fundraising)}
        </Select.Option>
        <Select.Option key="preOrderBlock" value="preOrderBlock">
          {formatMessage(craftPageMessages.label.preOrderBlock)}
        </Select.Option>
        <Select.Option key="statistics" value="statistics">
          {formatMessage(craftPageMessages.label.statistics)}
        </Select.Option>
        <Select.Option key="referrerEvaluation" value="referrerEvaluation">
          {formatMessage(craftPageMessages.label.referrerEvaluation)}
        </Select.Option>
        <Select.Option key="partner" value="partner">
          {formatMessage(craftPageMessages.label.partner)}
        </Select.Option>
        <Select.Option key="commonProblem" value="commonProblem">
          {formatMessage(craftPageMessages.label.commonProblem)}
        </Select.Option>
        <Select.Option key="imageBlock" value="imageBlock">
          {formatMessage(craftPageMessages.label.imageBlock)}
        </Select.Option>
        <Select.Option key="textBlock" value="textBlock">
          {formatMessage(craftPageMessages.label.textBlock)}
        </Select.Option>
      </StyledFullWidthSelect>

      <div
        className="mb-3"
        ref={ref =>
          ref &&
          connectors.create(
            ref,
            <CraftCarousel
              type="normal"
              covers={[
                {
                  title: '讓你更輕易學習',
                  paragraph: '建立您的絕佳品牌，擁有專屬會員一站式變現的最佳方案',
                  desktopCoverUrl: 'desktop',
                  mobileCoverUrl: 'mobile',
                  link: 'link',
                  openNewTab: false,
                },
              ]}
              titleStyle={{
                fontSize: 40,
                padding: 0,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#cccccc',
              }}
              paragraphStyle={{
                fontSize: 20,
                padding: 0,
                lineHeight: 27,
                textAlign: 'center',
                fontWeight: 'normal',
                color: '#cccccc',
              }}
              setActiveKey={setActiveKey}
            />,
          )
        }
      >
        <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-title.png" />
      </div>

      <div
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
                padding: 3,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#c8c858',
              }}
              paragraphStyle={{
                fontSize: 14,
                padding: 0,
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
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/banner-image.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/program.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/program-participate.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/activity.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/podcast.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/creator.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/creator-introduction.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/fundraising.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/pre-order.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics-dark.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/statistics-image.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/description.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/description-dark.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/description-background.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/feature.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/feature-dark.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/feature-title.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/feature-title-dark.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/cta.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/cta-dark.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/cta-vertical.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/cta-vertical-dark.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/recommend-dialogue.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/recommend.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/partner.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/faq-accordion.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/faq-column.png" />
      </div>

      <div className="mb-3" ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/image.png" />
      </div>

      <div ref={ref => ref && connectors.create(ref, <></>)}>
        <Image preview={false} src="https://static.kolable.com/images/default/craft/text.png" />
      </div>
    </div>
  )
}

export default CraftToolbox
