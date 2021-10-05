import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import { CraftBackground, CraftInstructor, CraftTitle } from 'lodestar-app-element/src/components/craft'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { StyledBoxWrapper } from '.'

const InstructorSection: React.VFC = () => {
  const { connectors } = useEditor()
  const { id: appId } = useApp()

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
            padding={{ pt: '64', pb: '64', pr: '120', pl: '120' }}
            margin={{ mb: '5' }}
            canvas
          >
            <CraftTitle
              titleContent="專業師資"
              fontSize={20}
              margin={{ mb: '25' }}
              textAlign="center"
              fontWeight="bold"
              color={'#585858'}
            />
            <CraftInstructor appId={appId} />
          </Element>,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/creator.png" />
    </StyledBoxWrapper>
  )
}

export default InstructorSection
