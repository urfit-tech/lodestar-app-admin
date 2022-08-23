import { Element } from '@craftjs/core'
import { CraftSection, CraftTitle } from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'

const MemberCollectionSection: React.VFC = () => {
  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      // backgroundType="none"
      // padding={{ pt: '64', pb: '64', pr: '120', pl: '120' }}
      // margin={{ mb: '5' }}
      canvas
    >
      <CraftTitle
        title="精選師資"
        // fontSize={20}
        // margin={{ mb: '25' }}
        // textAlign="center"
        // fontWeight="bold"
        // color={'#585858'}
      />
      {/* <CraftCreator type="newest" ids={repeat(null, 5)} /> */}
    </Element>
  )
}

export default MemberCollectionSection
