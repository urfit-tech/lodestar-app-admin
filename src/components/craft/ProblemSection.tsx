import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftBackground from 'lodestar-app-element/src/components/craft/CraftBackground'
import CraftCollapse from 'lodestar-app-element/src/components/craft/CraftCollapse'
import CraftLayout from 'lodestar-app-element/src/components/craft/CraftLayout'
import CraftTitle from 'lodestar-app-element/src/components/craft/CraftTitle'
import React from 'react'
import { StyledBoxWrapper } from '../../pages/CraftPage/CraftToolbox'

const ProblemSection: React.VFC<{
  variant?: 'default' | 'card'
}> = ({ variant = 'default' }) => {
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
            <CraftTitle
              titleContent="常見問題"
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
              mobile={{ margin: { ml: '20', mr: '20' }, columnAmount: 1, columnRatio: [12], displayAmount: 3 }}
              desktop={{ margin: { ml: '200', mr: '200' }, columnAmount: 1, columnRatio: [12], displayAmount: 3 }}
            >
              <Element
                id="CraftCollapse1"
                is={CraftCollapse}
                title="什麼是線上課程? 請問在哪裡上課？上課時間？"
                titleStyle={{
                  fontSize: 16,
                  margin: { mb: '0' },
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#585858',
                }}
                paragraph="網站的「線上課程」都可以隨時隨地透過電腦、手機、平板觀看購買後的課程影片，沒有時間和地點的限制！
              都可以隨時隨地透過電腦手機平板觀看購買後的課程影片沒有時間和地點的限制"
                paragraphStyle={{
                  fontSize: 16,
                  margin: { mt: '20' },
                  textAlign: 'left',
                  fontWeight: 'normal',
                  color: '#585858',
                }}
                cardPadding={{ pb: '20', pt: '20', pl: '20', pr: '20' }}
                cardMargin={{}}
                variant="none"
                backgroundType="none"
                canvas
              />
              <Element
                id="CraftCollapse2"
                is={CraftCollapse}
                title="課程可以看幾次？"
                titleStyle={{
                  fontSize: 16,
                  margin: { mb: '0' },
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#585858',
                }}
                paragraph="網站的「線上課程」都可以隨時隨地透過電腦、手機、平板觀看購買後的課程影片，沒有時間和地點的限制！
              都可以隨時隨地透過電腦手機平板觀看購買後的課程影片沒有時間和地點的限制"
                paragraphStyle={{
                  fontSize: 16,
                  margin: { mt: '20' },
                  textAlign: 'left',
                  fontWeight: 'normal',
                  color: '#585858',
                }}
                cardPadding={{ pb: '20', pt: '20', pl: '20', pr: '20' }}
                cardMargin={{ mt: '-15' }}
                variant="none"
                backgroundType="none"
                canvas
              />
              <Element
                id="CraftCollapse3"
                is={CraftCollapse}
                title="可以問老師問題嗎？"
                titleStyle={{
                  fontSize: 16,
                  margin: { mb: '0' },
                  textAlign: 'left',
                  fontWeight: 'bold',
                  color: '#585858',
                }}
                paragraph="網站的「線上課程」都可以隨時隨地透過電腦、手機、平板觀看購買後的課程影片，沒有時間和地點的限制！
              都可以隨時隨地透過電腦手機平板觀看購買後的課程影片沒有時間和地點的限制"
                paragraphStyle={{
                  fontSize: 16,
                  margin: { mt: '20' },
                  textAlign: 'left',
                  fontWeight: 'normal',
                  color: '#585858',
                }}
                cardPadding={{ pb: '20', pt: '20', pl: '20', pr: '20' }}
                cardMargin={{ mt: '-15' }}
                variant="none"
                backgroundType="none"
                canvas
              />
            </Element>
          </Element>,
        )
      }
    >
      {variant === 'default' && (
        <Image preview={false} src="https://static.kolable.com/images/default/craft/faq-accordion.png" />
      )}

      {/* {variant === 'card' && (
        <Image preview={false} src="https://static.kolable.com/images/default/craft/recommend-dialogue.png" />
      )} */}
    </StyledBoxWrapper>
  )
}

export default ProblemSection
