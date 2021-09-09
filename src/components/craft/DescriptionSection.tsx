import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftBackground from 'lodestar-app-element/src/components/craft/CraftBackground'
import CraftContainer from 'lodestar-app-element/src/components/craft/CraftContainer'
import CraftImage from 'lodestar-app-element/src/components/craft/CraftImage'
import CraftLayout from 'lodestar-app-element/src/components/craft/CraftLayout'
import CraftParagraph from 'lodestar-app-element/src/components/craft/CraftParagraph'
import CraftTitle from 'lodestar-app-element/src/components/craft/CraftTitle'
import React from 'react'
import { StyledBoxWrapper } from '../../pages/CraftPage/CraftToolbox'

const Description: React.VFC = () => {
  const { connectors } = useEditor()

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
            <Element
              id="CraftLayout"
              is={CraftLayout}
              canvas
              mobile={{ margin: { ml: '15', mr: '15' }, columnAmount: 1, columnRatio: [12], displayAmount: 2 }}
              desktop={{ margin: { ml: '200', mr: '200' }, columnAmount: 2, columnRatio: [6, 4], displayAmount: 2 }}
            >
              <Element is={CraftContainer} margin={{}}>
                <CraftTitle
                  titleContent="屹立不搖的組織都有相同的模式"
                  fontSize={20}
                  margin={{ mb: '24' }}
                  textAlign="left"
                  fontWeight="bold"
                  color="#585858"
                />
                <CraftParagraph
                  paragraphContent="但是什麼時候該理想，什麼時候該現實，什麼時候該堅持，什麼時候該妥協，又是一門藝術了，而這中間的拿捏，也是「初階的管理人才」與「進階的管理人才」之間的差別吧！但是什麼時候該理想，什麼時候該現實，什麼時候該堅持，什麼時候該妥協，又是一門藝術了，而這中間的拿捏，也是「初階的管理人才」與「進階的管理人才」之間的差別吧！"
                  fontSize={16}
                  margin={{}}
                  lineHeight={1.69}
                  textAlign="left"
                  fontWeight="normal"
                  color="#585858"
                />
              </Element>

              <CraftImage
                type="image"
                width="100%"
                padding={{}}
                margin={{}}
                coverUrl="https://static.kolable.com/images/demo/home/feature-img2.jpg"
              />
            </Element>
          </Element>,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/description.png" />
    </StyledBoxWrapper>
  )
}

export default Description
