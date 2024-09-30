import { Element } from '@craftjs/core'
import {
  CraftCard,
  CraftLayout,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'
import { useIntl } from 'react-intl'
import craftMessages from '../translation'

const FeatureSection: React.VFC<{
  variant?: 'default' | 'dark'
}> = ({ variant = 'default' }) => {
  const { formatMessage } = useIntl()
  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      customStyle={{
        margin: '0 0 5 0',
        padding: '64 0',
        background:
          variant === 'dark'
            ? `url('https://i.picsum.photos/id/166/1920/1080.jpg?hmac=jxymCPYDSY6wglfW8ri3zwn-OgzKS9Kj5XdTHcbpnCk')`
            : 'unset',
      }}
      canvas
    >
      <CraftTitle
        title={formatMessage(craftMessages.FeatureSection.title)}
        customStyle={{
          fontSize: 20,
          margin: '0 0 40 0',
          textAlign: 'center',
          fontWeight: 'bold',
          color: variant === 'dark' ? 'whire' : '#585858',
        }}
      />
      <Element
        id="CraftLayout"
        is={CraftLayout}
        ratios={[12]}
        customStyle={{
          margin: '16 0',
        }}
        responsive={{
          desktop: {
            ratios: [3, 3, 3, 3],
            customStyle: {
              margin: '60 0',
            },
          },
        }}
        canvas
      >
        <CraftCard
          horizontal
          // type="feature"
          // imageType="image"
          // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
          //   variant === 'dark' ? 'white' : 'blue'
          // }.svg`}
          // imageMargin={{ mr: '16' }}
          // title="特色標題 1"
          customStyle={{
            padding: 25,
            background: variant === 'dark' ? 'unset' : undefined,
            borderColor: 'white',
            outlineColor: variant === 'dark' ? 'white' : undefined,
            '.title': {
              fontSize: 16,
              margin: 0,
              textAlign: 'left',
              fontWeight: 'bold',
              color: variant === 'dark' ? 'white' : '#585858',
            },
          }}
        />
        <CraftCard
          horizontal
          // type="feature"
          // imageType="image"
          // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
          //   variant === 'dark' ? 'white' : 'blue'
          // }.svg`}
          // imageMargin={{ mr: '16' }}
          // title="特色標題 2"
          // titleStyle={{
          //   fontSize: 16,
          //   margin: { mb: '0' },
          //   textAlign: 'left',
          //   fontWeight: 'bold',
          //   color: variant === 'dark' ? 'white' : '#585858',
          // }}
          // cardPadding={{ pt: '25', pb: '25', pl: '25', pr: '25' }}
          // cardMargin={{}}
          // variant="none"
          // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          // solidColor="white"
          // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
          horizontal
          // type="feature"
          // imageType="image"
          // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
          //   variant === 'dark' ? 'white' : 'blue'
          // }.svg`}
          // imageMargin={{ mr: '16' }}
          // title="特色標題 3"
          // titleStyle={{
          //   fontSize: 16,
          //   margin: { mb: '0' },
          //   textAlign: 'left',
          //   fontWeight: 'bold',
          //   color: variant === 'dark' ? 'white' : '#585858',
          // }}
          // cardPadding={{ pt: '25', pb: '25', pl: '25', pr: '25' }}
          // cardMargin={{}}
          // variant="none"
          // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          // solidColor="white"
          // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
          horizontal
          // type="feature"
          // imageType="image"
          // imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
          //   variant === 'dark' ? 'white' : 'blue'
          // }.svg`}
          // imageMargin={{ mr: '16' }}
          // title="特色標題 4"
          // titleStyle={{
          //   fontSize: 16,
          //   margin: { mb: '0' },
          //   textAlign: 'left',
          //   fontWeight: 'bold',
          //   color: variant === 'dark' ? 'white' : '#585858',
          // }}
          // cardPadding={{ pt: '25', pb: '25', pl: '25', pr: '25' }}
          // cardMargin={{}}
          // backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          // solidColor="white"
          // outlineColor={variant === 'dark' ? 'white' : undefined}
        />
      </Element>
    </Element>
  )
}

export default FeatureSection
