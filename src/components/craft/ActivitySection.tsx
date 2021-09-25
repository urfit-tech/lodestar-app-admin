import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftActivity from 'lodestar-app-element/src/components/craft/CraftActivity'
import CraftBackground from 'lodestar-app-element/src/components/craft/CraftBackground'
import CraftButton from 'lodestar-app-element/src/components/craft/CraftButton'
import CraftImage from 'lodestar-app-element/src/components/craft/CraftImage'
import CraftTitle from 'lodestar-app-element/src/components/craft/CraftTitle'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import React from 'react'
import { StyledBoxWrapper } from '../../pages/CraftPage/CraftToolbox'

const ActivitySection: React.VFC = () => {
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
              titleContent="線下實體"
              fontSize={20}
              margin={{ mb: '40' }}
              textAlign="center"
              fontWeight="bold"
              color={'#585858'}
            />
            <Element id="CraftActivity" is={CraftActivity} canvas type="newest" ids={[]} defaultCategoryIds={[]}>
              <CraftImage
                desktop={{
                  width: '100%',
                  padding: {},
                  margin: {},
                  coverUrl: 'https://static.kolable.com/images/demo/home/feature-img2.jpg',
                }}
                mobile={{
                  width: '100%',
                  padding: {},
                  margin: {},
                  coverUrl: 'https://static.kolable.com/images/demo/home/feature-img2.jpg',
                }}
              />
            </Element>
            <div style={{ textAlign: 'center' }}>
              <CraftButton
                title="馬上查看 〉"
                link="/programs"
                openNewTab={false}
                size="md"
                block={false}
                variant="text"
                color={theme['@primary-color']}
              />
            </div>
          </Element>,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/activity.png" />
    </StyledBoxWrapper>
  )
}

export default ActivitySection
