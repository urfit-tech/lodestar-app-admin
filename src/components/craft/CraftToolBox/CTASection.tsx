import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import { CraftBackground, CraftButton, CraftLayout, CraftTitle } from 'lodestar-app-element/src/components/craft'
import React from 'react'
import { StyledBoxWrapper } from '.'

const CTASection: React.VFC<{
  variant?: 'default' | 'dark'
}> = ({ variant = 'default' }) => {
  const { connectors } = useEditor()

  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        connectors.create(
          ref,
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
              mobile={{ margin: { ml: '20', mr: '20' }, columnAmount: 1, columnRatio: [12], displayAmount: 2 }}
              desktop={{ margin: { ml: '200', mr: '200' }, columnAmount: 2, columnRatio: [3, 2], displayAmount: 2 }}
            >
              <CraftTitle
                titleContent="還在等什麼？立即查看課程"
                fontSize={28}
                margin={{ mb: '0' }}
                textAlign="center"
                fontWeight="normal"
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
          </Element>,
        )
      }
    >
      {variant === 'default' && <Image preview={false} src="https://static.kolable.com/images/default/craft/cta.png" />}

      {variant === 'dark' && (
        <Image preview={false} src="https://static.kolable.com/images/default/craft/cta-dark.png" />
      )}
    </StyledBoxWrapper>
  )
}

export default CTASection
