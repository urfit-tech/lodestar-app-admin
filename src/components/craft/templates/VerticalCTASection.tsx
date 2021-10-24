import { Element } from '@craftjs/core'
import { CraftBackground, CraftButton, CraftLayout, CraftTitle } from 'lodestar-app-element/src/components/craft'
import React from 'react'

const VerticalCTASection: React.VFC<{
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
      <Element
        id="CraftLayout"
        is={CraftLayout}
        canvas
        mobile={{ margin: { ml: '20', mr: '20' }, columnAmount: 1, columnRatio: [12], displayAmount: 3 }}
        desktop={{ margin: { ml: '200', mr: '200' }, columnAmount: 1, columnRatio: [12], displayAmount: 3 }}
      >
        <CraftTitle
          titleContent="還在等什麼？立即查看課程"
          fontSize={28}
          margin={{ mb: '0' }}
          textAlign="center"
          fontWeight="normal"
          color={variant === 'dark' ? 'white' : '#585858'}
        />
        <CraftTitle
          titleContent="所以我們不該是為學習而學習，而是在設定好學習目標"
          fontSize={16}
          margin={{ mb: '10' }}
          textAlign="center"
          fontWeight="lighter"
          color={variant === 'dark' ? 'white' : '#585858'}
        />
        <CraftButton
          title="馬上查看"
          link=""
          openNewTab={false}
          size="md"
          block={false}
          variant={variant === 'dark' ? 'outline' : 'solid'}
          color="#fff"
          outlineColor={variant === 'dark' ? '#fff' : undefined}
          backgroundType={variant === 'dark' ? 'none' : 'solidColor'}
          backgroundColor={variant === 'dark' ? undefined : '#4c5b8f'}
        />
      </Element>
    </Element>
  )
}

export default VerticalCTASection
