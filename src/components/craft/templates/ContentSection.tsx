import { Element } from '@craftjs/core'
import {
  CraftImage,
  CraftLayout,
  CraftParagraph,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'

const FeatureSection: React.VFC = () => {
  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      customStyle={{
        marginBottom: 5,
        padding: '64 0',
      }}
      canvas
    >
      <Element
        id="CraftLayout"
        is={CraftLayout}
        ratios={[12]}
        customStyle={{
          margin: '0 15',
        }}
        responsive={{
          desktop: {
            ratios: [6, 4],
            customStyle: {
              margin: '0 200',
            },
          },
        }}
        canvas
      >
        <Element is={CraftSection}>
          <CraftTitle
            title="屹立不搖的組織都有相同的模式"
            customStyle={{
              fontSize: 20,
              margin: '0 0 24 0',
              textAlign: 'left',
              fontWeight: 'bold',
              color: '#585858',
            }}
          />
          <CraftParagraph
            content="但是什麼時候該理想，什麼時候該現實，什麼時候該堅持，什麼時候該妥協，又是一門藝術了，而這中間的拿捏，也是「初階的管理人才」與「進階的管理人才」之間的差別吧！但是什麼時候該理想，什麼時候該現實，什麼時候該堅持，什麼時候該妥協，又是一門藝術了，而這中間的拿捏，也是「初階的管理人才」與「進階的管理人才」之間的差別吧！"
            customStyle={{
              fontSize: 16,
              lineHeight: 1.69,
              textAlign: 'left',
              fontWeight: 'normal',
              color: '#585858',
            }}
          />
        </Element>

        <CraftImage src="https://static.kolable.com/images/demo/home/feature-img2.jpg" />
      </Element>
    </Element>
  )
}

export default FeatureSection
