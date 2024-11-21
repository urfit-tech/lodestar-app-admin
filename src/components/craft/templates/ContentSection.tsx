import { Element } from '@craftjs/core'
import {
  CraftImage,
  CraftLayout,
  CraftParagraph,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'
import { useIntl } from 'react-intl'
import craftMessages from '../translation'

const FeatureSection: React.VFC = () => {
  const { formatMessage } = useIntl()
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
            title={formatMessage(craftMessages.ContentSection.sectionTitle)}
            customStyle={{
              fontSize: 20,
              margin: '0 0 24 0',
              textAlign: 'left',
              fontWeight: 'bold',
              color: '#585858',
            }}
          />
          <CraftParagraph
            content={formatMessage(craftMessages.ContentSection.sectionContent)}
            customStyle={{
              fontSize: 16,
              lineHeight: 1.69,
              textAlign: 'left',
              fontWeight: 'normal',
              color: '#585858',
            }}
          />
        </Element>

        <CraftImage
          customStyle={{ backgroundImage: 'url("https://static.kolable.com/images/demo/home/feature-img2.jpg")' }}
        />
      </Element>
    </Element>
  )
}

export default FeatureSection
