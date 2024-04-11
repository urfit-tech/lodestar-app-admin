import { Element } from '@craftjs/core'
import {
  CraftActivityCollection,
  CraftButton,
  CraftImage,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import React from 'react'

const ActivityCollectionSection: React.VFC = () => {
  const theme = useAppTheme()

  return (
    <Element
      id="CraftSection"
      is={CraftSection}
      customStyle={{
        padding: '64 0',
        margin: '0 0 5 0',
      }}
      canvas
    >
      <CraftTitle
        title="活動"
        customStyle={{
          fontSize: 20,
          margin: '0 0 40 0',
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#585858',
        }}
      />
      <Element
        id="CraftSection"
        is={CraftSection}
        canvas
        customStyle={{
          padding: '0 32',
        }}
      >
        <CraftActivityCollection variant="card" source={{ from: 'publishedAt', limit: 4 }}>
          <CraftImage
            customStyle={{ backgroundImage: `url("https://static.kolable.com/images/demo/cover-01-m.png")` }}
            // responsive={{
            //   desktop: {
            //     customStyle: {
            //       backgroundImage: `url('https://static.kolable.com/images/demo/cover-01.png')`,
            //     },
            //   },
            // }}
          />
        </CraftActivityCollection>
      </Element>
      <div style={{ textAlign: 'center' }}>
        <CraftButton title="馬上查看 〉" link="/programs" openNewTab={false} size="md" block={false} variant="text" />
      </div>
    </Element>
  )
}

export default ActivityCollectionSection
