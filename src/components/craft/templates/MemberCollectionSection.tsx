import { Element } from '@craftjs/core'
import { CraftBackground, CraftCreator, CraftTitle } from 'lodestar-app-element/src/components/craft'
import { repeat } from 'ramda'
import React from 'react'

const MemberCollectionSection: React.VFC = () => {
  return (
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
    </Element>
  )
}

export default MemberCollectionSection
