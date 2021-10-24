import { Element } from '@craftjs/core'
import { CraftBackground, CraftCard, CraftLayout, CraftTitle } from 'lodestar-app-element/src/components/craft'
import React from 'react'

const FeatureSection: React.VFC<{
  variant?: 'default' | 'dark'
}> = ({ variant = 'default' }) => {
  return (
    <Element
      id="CraftBackground"
      is={CraftBackground}
      backgroundType={variant === 'dark' ? 'backgroundImage' : 'none'}
      padding={{ pt: '64', pb: '64' }}
      margin={{ mb: '5' }}
      coverUrl={
        variant === 'dark'
          ? 'https://i.picsum.photos/id/166/1920/1080.jpg?hmac=jxymCPYDSY6wglfW8ri3zwn-OgzKS9Kj5XdTHcbpnCk'
          : undefined
      }
      canvas
    >
      <CraftTitle
        titleContent="四大特色"
        fontSize={20}
        margin={{ mb: '40' }}
        textAlign="center"
        fontWeight="bold"
        color={variant === 'dark' ? 'white' : '#585858'}
      />
      <Element
        id="CraftLayout"
        is={CraftLayout}
        canvas
        mobile={{
          margin: { ml: '16', mr: '16' },
          columnAmount: 1,
          columnRatio: [12],
          displayAmount: 4,
        }}
        desktop={{
          margin: { ml: '60', mr: '60' },
          columnAmount: 4,
          columnRatio: [3, 3, 3, 3],
          displayAmount: 4,
        }}
      >
        <CraftCard
          flexDirection="row"
          type="feature"
          imageType="image"
          imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
            variant === 'dark' ? 'white' : 'blue'
          }.svg`}
          imageMargin={{ mr: '16' }}
          title="特色標題 1"
          titleStyle={{
            fontSize: 16,
            margin: { mb: '0' },
            textAlign: 'left',
            fontWeight: 'bold',
            color: variant === 'dark' ? 'white' : '#585858',
          }}
          cardPadding={{ pt: '25', pb: '25', pl: '25', pr: '25' }}
          cardMargin={{}}
          variant="none"
          backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          solidColor="white"
          outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
          flexDirection="row"
          type="feature"
          imageType="image"
          imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
            variant === 'dark' ? 'white' : 'blue'
          }.svg`}
          imageMargin={{ mr: '16' }}
          title="特色標題 2"
          titleStyle={{
            fontSize: 16,
            margin: { mb: '0' },
            textAlign: 'left',
            fontWeight: 'bold',
            color: variant === 'dark' ? 'white' : '#585858',
          }}
          cardPadding={{ pt: '25', pb: '25', pl: '25', pr: '25' }}
          cardMargin={{}}
          variant="none"
          backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          solidColor="white"
          outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
          flexDirection="row"
          type="feature"
          imageType="image"
          imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
            variant === 'dark' ? 'white' : 'blue'
          }.svg`}
          imageMargin={{ mr: '16' }}
          title="特色標題 3"
          titleStyle={{
            fontSize: 16,
            margin: { mb: '0' },
            textAlign: 'left',
            fontWeight: 'bold',
            color: variant === 'dark' ? 'white' : '#585858',
          }}
          cardPadding={{ pt: '25', pb: '25', pl: '25', pr: '25' }}
          cardMargin={{}}
          variant="none"
          backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          solidColor="white"
          outlineColor={variant === 'dark' ? 'white' : undefined}
        />
        <CraftCard
          flexDirection="row"
          type="feature"
          imageType="image"
          imageUrl={`https://static.kolable.com/images/demo/home/icon-thumb-${
            variant === 'dark' ? 'white' : 'blue'
          }.svg`}
          imageMargin={{ mr: '16' }}
          title="特色標題 4"
          titleStyle={{
            fontSize: 16,
            margin: { mb: '0' },
            textAlign: 'left',
            fontWeight: 'bold',
            color: variant === 'dark' ? 'white' : '#585858',
          }}
          cardPadding={{ pt: '25', pb: '25', pl: '25', pr: '25' }}
          cardMargin={{}}
          variant="none"
          backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          solidColor="white"
          outlineColor={variant === 'dark' ? 'white' : undefined}
        />
      </Element>
    </Element>
  )
}

export default FeatureSection
