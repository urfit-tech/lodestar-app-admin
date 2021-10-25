import { Element } from '@craftjs/core'
import {
  CraftButton,
  CraftLayout,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'

const CTASection: React.VFC<{
  variant?: 'default' | 'dark'
}> = ({ variant = 'default' }) => {
  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      customStyle={{
        background:
          variant === 'dark'
            ? `url('https://i.picsum.photos/id/166/1920/1080.jpg?hmac=jxymCPYDSY6wglfW8ri3zwn-OgzKS9Kj5XdTHcbpnCk')`
            : 'unset',
        margin: '0 0 5 0',
        padding: '64 0',
      }}
      canvas
    >
      <Element
        id="CraftLayout"
        is={CraftLayout}
        ratios={[12]}
        customStyle={{
          margin: '0 20',
        }}
        responsive={{
          desktop: {
            ratios: [3, 2],
            customStyle: {
              margin: '0 200',
            },
          },
        }}
        canvas
      >
        <CraftTitle
          title="還在等什麼？立即查看課程"
          customStyle={{
            fontSize: 28,
            margin: 0,
            textAlign: 'center',
            fontWeight: 'normal',
            color: variant === 'dark' ? 'white' : '#585858',
          }}
        />
        <CraftButton
          title="馬上查看"
          link=""
          openNewTab={false}
          size="md"
          block={false}
          variant={variant === 'dark' ? 'outline' : 'solid'}
          customStyle={
            variant === 'dark'
              ? {
                  color: '#fff',
                  outlineColor: '#fff',
                  backgroundColor: '#4c5b8f',
                }
              : undefined
          }
        />
      </Element>
    </Element>
  )
}

export default CTASection
