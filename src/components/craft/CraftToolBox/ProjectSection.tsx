import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import {
  CraftBackground,
  CraftButton,
  CraftLayout,
  CraftProject,
  CraftTitle,
} from 'lodestar-app-element/src/components/craft'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { StyledBoxWrapper } from '.'
import { craftPageMessages } from '../../../helpers/translation'
const ProjectSection: React.VFC<{ projectType?: 'pre-order' | 'funding' }> = ({ projectType = 'pre-order' }) => {
  const { formatMessage } = useIntl()
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
              titleContent={
                (projectType === 'pre-order'
                  ? formatMessage(craftPageMessages.label.preOrder)
                  : formatMessage(craftPageMessages.label.fundraising)) + '專案'
              }
              fontSize={20}
              margin={{ mb: '40' }}
              textAlign="center"
              fontWeight="bold"
              color={'#585858'}
            />
            <Element
              id="CraftLayout"
              is={CraftLayout}
              canvas
              mobile={{
                margin: { ml: '16', mr: '16', mb: '20' },
                columnAmount: 1,
                columnRatio: [12],
                displayAmount: 3,
              }}
              desktop={{
                margin: { ml: '120', mr: '120', mb: '20' },
                columnAmount: 3,
                columnRatio: [4, 4, 4],
                displayAmount: 3,
              }}
            >
              <CraftProject projectType={projectType} />
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
          </Element>,
        )
      }
    >
      <Image
        preview={false}
        src={
          projectType === 'pre-order'
            ? 'https://static.kolable.com/images/default/craft/pre-order.png'
            : 'https://static.kolable.com/images/default/craft/fundraising.png'
        }
      />
    </StyledBoxWrapper>
  )
}

export default ProjectSection
