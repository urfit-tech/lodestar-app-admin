import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftBackground from 'lodestar-app-element/src/components/craft/CraftBackground'
import CraftCreator from 'lodestar-app-element/src/components/craft/CraftCreator'
import CraftTitle from 'lodestar-app-element/src/components/craft/CraftTitle'
import { repeat } from 'ramda'
import React from 'react'
import { StyledBoxWrapper } from '../../pages/CraftPage/CraftToolbox'

const CreatorSection: React.VFC = () => {
  const {
    connectors: { create },
  } = useEditor()

  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        create(
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
              titleContent="精選師資"
              fontSize={20}
              margin={{ mb: '25' }}
              textAlign="center"
              fontWeight="bold"
              color={'#585858'}
            />
            <CraftCreator type="newest" ids={repeat(null, 5)} />
          </Element>,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/creator2.png" />
    </StyledBoxWrapper>
  )
}

export default CreatorSection
