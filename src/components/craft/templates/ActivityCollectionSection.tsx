import { Element } from '@craftjs/core'
import {
  CraftActivityCollection,
  CraftBackground,
  CraftButton,
  CraftImage,
  CraftTitle,
} from 'lodestar-app-element/src/components/craft'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import React from 'react'

const ActivityCollectionSection: React.VFC = () => {
  const theme = useAppTheme()

  return (
    <Element
      id="CraftBackground"
      is={CraftBackground}
      backgroundType="none"
      padding={{ pt: '64', pb: '64' }}
      margin={{ mb: '5' }}
      canvas
    >
      <CraftTitle
        titleContent="線下實體"
        fontSize={20}
        margin={{ mb: '40' }}
        textAlign="center"
        fontWeight="bold"
        color={'#585858'}
      />
      <Element
        id="CraftBackground"
        is={CraftBackground}
        canvas
        backgroundType="none"
        margin={{}}
        padding={{ pl: '32px', pr: '32px' }}
      >
        <CraftActivityCollection variant="card" sourceOptions={{ source: 'publishedAt', limit: 4 }}>
          <CraftImage
            desktop={{
              width: '100%',
              padding: {},
              margin: { mb: '8px' },
              coverUrl: 'https://static.kolable.com/images/demo/cover-01.png',
            }}
            mobile={{
              width: '100%',
              padding: {},
              margin: { mb: '8px' },
              coverUrl: 'https://static.kolable.com/images/demo/cover-01-m.png',
            }}
          />
        </CraftActivityCollection>
      </Element>
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
    </Element>
  )
}

export default ActivityCollectionSection
