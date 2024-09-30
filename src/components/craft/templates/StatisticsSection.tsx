import { Element } from '@craftjs/core'
import {
  CraftImage,
  CraftLayout,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'
import { useIntl } from 'react-intl'
import craftMessages from '../translation'

type StatisticsVariant = 'default' | 'dark' | 'image'
const StatisticsSection: React.VFC<{
  variant?: StatisticsVariant
}> = ({ variant = 'default' }) => {
  const { formatMessage } = useIntl()
  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      // backgroundType={variant === 'dark' ? 'backgroundImage' : 'none'}
      // padding={{ pt: '64', pb: '64' }}
      // margin={{ mb: '5' }}
      // coverUrl={
      //   variant === 'dark'
      //     ? 'https://i.picsum.photos/id/166/1920/1080.jpg?hmac=jxymCPYDSY6wglfW8ri3zwn-OgzKS9Kj5XdTHcbpnCk'
      //     : undefined
      // }
      canvas
    >
      {variant !== 'image' && (
        <CraftTitle
          title={formatMessage(craftMessages.StatisticsSection.title)}
          // fontSize={20}
          // margin={{ mb: '25' }}
          // textAlign="center"
          // fontWeight="bold"
          // color={variant === 'dark' ? 'white' : '#585858'}
        />
      )}
      {variant !== 'image' ? DefaultCraftStatistics(variant) : ImageCraftStatistics}
    </Element>
  )
}
const DefaultCraftStatistics = (variant: StatisticsVariant) => (
  <Element
    id="CraftLayout"
    is={CraftLayout}
    ratios={[12]}
    canvas
    // mobile={{ margin: {}, columnAmount: 1, columnRatio: [12], displayAmount: 4 }}
    // desktop={{ margin: {}, columnAmount: 4, columnRatio: [3, 3, 3, 3], displayAmount: 4 }}
  >
    {/* <CraftStatistics
      type="image"
      padding={{ pt: '10', pb: '10' }}
      margin={{}}
      coverUrl={`https://static.kolable.com/images/demo/home/icon-savetime${variant === 'dark' ? '-white' : ''}.svg`}
      title={{
        titleContent: '814+',
        fontSize: 40,
        margin: { mb: '16' },
        textAlign: 'center',
        fontWeight: 'normal',
        color: variant === 'dark' ? 'white' : '#4C5B8F',
      }}
      paragraph={{
        paragraphContent: '覺得超有效',
        fontSize: 14,
        margin: {},
        textAlign: 'center',
        fontWeight: 'lighter',
        color: variant === 'dark' ? 'white' : '#585858',
      }}
    />
    <CraftStatistics
      type="image"
      padding={{ pt: '10', pb: '10' }}
      margin={{}}
      coverUrl={`https://static.kolable.com/images/demo/home/icon-thumb${variant === 'dark' ? '-white' : ''}.svg`}
      title={{
        titleContent: '999+',
        fontSize: 40,
        margin: { mb: '16' },
        textAlign: 'center',
        fontWeight: 'normal',
        color: variant === 'dark' ? 'white' : '#4C5B8F',
      }}
      paragraph={{
        paragraphContent: '覺得超省時間',
        fontSize: 14,
        margin: {},
        textAlign: 'center',
        fontWeight: 'lighter',
        color: variant === 'dark' ? 'white' : '#585858',
      }}
    />
    <CraftStatistics
      type="image"
      padding={{ pt: '10', pb: '10' }}
      margin={{}}
      coverUrl={`https://static.kolable.com/images/demo/home/icon-savetime${variant === 'dark' ? '-white' : ''}.svg`}
      title={{
        titleContent: '353+',
        fontSize: 40,
        margin: { mb: '16' },
        textAlign: 'center',
        fontWeight: 'normal',
        color: variant === 'dark' ? 'white' : '#4C5B8F',
      }}
      paragraph={{
        paragraphContent: '覺得超有效',
        fontSize: 14,
        margin: {},
        textAlign: 'center',
        fontWeight: 'lighter',
        color: variant === 'dark' ? 'white' : '#585858',
      }}
    />
    <CraftStatistics
      type="image"
      padding={{ pt: '10', pb: '10' }}
      margin={{}}
      coverUrl={`https://static.kolable.com/images/demo/home/icon-thumb${variant === 'dark' ? '-white' : ''}.svg`}
      title={{
        titleContent: '666+',
        fontSize: 40,
        margin: { mb: '16' },
        textAlign: 'center',
        fontWeight: 'normal',
        color: variant === 'dark' ? 'white' : '#4C5B8F',
      }}
      paragraph={{
        paragraphContent: '覺得超省時間',
        fontSize: 14,
        margin: {},
        textAlign: 'center',
        fontWeight: 'lighter',
        color: variant === 'dark' ? 'white' : '#585858',
      }}
    /> */}
  </Element>
)

const ImageCraftStatistics = (
  <Element
    id="CraftLayout"
    is={CraftLayout}
    ratios={[12]}
    canvas
    // mobile={{ margin: {}, columnAmount: 1, columnRatio: [12], displayAmount: 2 }}
    // desktop={{ margin: { ml: '200', mr: '200' }, columnAmount: 2, columnRatio: [4, 8], displayAmount: 2 }}
  >
    <CraftImage
      customStyle={{ backgroundImage: 'url("https://static.kolable.com/images/demo/home/feature-img2.jpg")' }}
      // desktop={{
      //   width: '100%',
      //   padding: {},
      //   margin: {},
      //   coverUrl: 'https://static.kolable.com/images/demo/home/feature-img2.jpg',
      // }}
      // mobile={{
      //   width: '100%',
      //   padding: {},
      //   margin: {},
      //   coverUrl: 'https://static.kolable.com/images/demo/home/feature-img2.jpg',
      // }}
    />
    <Element is={CraftSection}>
      <CraftTitle
        title="提供完善的服務"
        // fontSize={20}
        // margin={{ mb: '15' }}
        // textAlign="center"
        // fontWeight="bold"
        // color="#585858"
      />
      <Element
        id="CraftLayout"
        is={CraftLayout}
        ratios={[12]}
        canvas
        // mobile={{ margin: {}, columnAmount: 1, columnRatio: [12], displayAmount: 3 }}
        // desktop={{ margin: { ml: '30', mr: '30' }, columnAmount: 3, columnRatio: [4, 4, 4], displayAmount: 3 }}
      >
        {/* <CraftStatistics
          type="image"
          padding={{ pt: '10', pb: '10' }}
          margin={{ mr: '30' }}
          title={{
            titleContent: '814+',
            fontSize: 40,
            margin: { mb: '16' },
            textAlign: 'center',
            fontWeight: 'normal',
            color: '#4C5B8F',
          }}
          paragraph={{
            paragraphContent: '覺得超有效',
            fontSize: 14,
            margin: {},
            textAlign: 'center',
            fontWeight: 'lighter',
            color: '#585858',
          }}
        />
        <CraftStatistics
          type="image"
          padding={{ pt: '10', pb: '10' }}
          margin={{}}
          title={{
            titleContent: '999+',
            fontSize: 40,
            margin: { mb: '16' },
            textAlign: 'center',
            fontWeight: 'normal',
            color: '#4C5B8F',
          }}
          paragraph={{
            paragraphContent: '覺得超省時間',
            fontSize: 14,
            margin: {},
            textAlign: 'center',
            fontWeight: 'lighter',
            color: '#585858',
          }}
        />
        <CraftStatistics
          type="image"
          padding={{ pt: '10', pb: '10' }}
          margin={{}}
          title={{
            titleContent: '353+',
            fontSize: 40,
            margin: { mb: '16' },
            textAlign: 'center',
            fontWeight: 'normal',
            color: '#4C5B8F',
          }}
          paragraph={{
            paragraphContent: '覺得超有效',
            fontSize: 14,
            margin: {},
            textAlign: 'center',
            fontWeight: 'lighter',
            color: '#585858',
          }}
        /> */}
      </Element>
    </Element>
  </Element>
)
export default StatisticsSection
