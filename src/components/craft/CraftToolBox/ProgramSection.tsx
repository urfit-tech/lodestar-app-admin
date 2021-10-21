import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import { CraftBackground, CraftButton, CraftTitle } from 'lodestar-app-element/src/components/craft'
import ProgramCardCollection from 'lodestar-app-element/src/components/craft/ProgramCardCollection'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import React from 'react'
import { StyledBoxWrapper } from '.'

const ProblemSection: React.VFC = () => {
  const { connectors } = useEditor()
  const theme = useAppTheme()

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
            backgroundType="none"
            padding={{ pt: '64', pb: '64' }}
            margin={{ mb: '5' }}
            canvas
          >
            <CraftTitle
              titleContent="線上課程"
              fontSize={20}
              margin={{ mb: '40' }}
              textAlign="center"
              fontWeight="bold"
              color={'#585858'}
            />
            <ProgramCardCollection options={{ source: 'publishedAt', limit: 4 }} />
            <div style={{ textAlign: 'center' }}>
              <CraftButton
                title="馬上查看 〉"
                link="/programs"
                openNewTab={false}
                size="md"
                block={false}
                variant="text"
                color={theme.colors.primary[500]}
              />
            </div>
          </Element>,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/program.png" />
    </StyledBoxWrapper>
  )
}

export default ProblemSection
