import { Element } from '@craftjs/core'
import {
  CraftBackground,
  CraftCollapse,
  CraftLayout,
  CraftTitle,
  CraftTitleAndParagraph,
} from 'lodestar-app-element/src/components/craft'
import React from 'react'

const FAQSection: React.VFC<{ variant?: 'accordion' }> = ({ variant }) => {
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
        titleContent="常見問題"
        fontSize={20}
        margin={{ mb: '40' }}
        textAlign="center"
        fontWeight="bold"
        color={'#585858'}
      />
      {variant === 'accordion' ? (
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
      ) : (
        <Element
          id="CraftLayout"
          is={CraftLayout}
          canvas
          mobile={{ margin: { ml: '20', mr: '20' }, columnAmount: 1, columnRatio: [12], displayAmount: 5 }}
          desktop={{ margin: { ml: '200', mr: '200' }, columnAmount: 2, columnRatio: [6, 6], displayAmount: 5 }}
        >
          <CraftTitleAndParagraph
            title={{
              titleContent: '完全沒有相關背景也可以學會嗎？',
              fontSize: 16,
              margin: { mb: '13' },
              textAlign: 'left',
              fontWeight: 'normal',
              color: '#4c5b8f',
              padding: { pl: '8', pt: '2', pb: '2' },
              border: { borderLeftWidth: '4', borderLeftStyle: 'solid', borderLeftColor: '#4c5b8f' },
            }}
            paragraph={{
              paragraphContent:
                '在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一',
              fontSize: 16,
              margin: {},
              lineHeight: 1.69,
              textAlign: 'left',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
          <CraftTitleAndParagraph
            title={{
              titleContent: '你們跟坊間的其他課程有什麼不一樣？',
              fontSize: 16,
              margin: { mb: '13' },
              textAlign: 'left',
              fontWeight: 'normal',
              color: '#4c5b8f',
              padding: { pl: '8', pt: '2', pb: '2' },
              border: { borderLeftWidth: '4', borderLeftStyle: 'solid', borderLeftColor: '#4c5b8f' },
            }}
            paragraph={{
              paragraphContent:
                '在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一',
              fontSize: 16,
              margin: {},
              lineHeight: 1.69,
              textAlign: 'left',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
          <CraftTitleAndParagraph
            title={{
              titleContent: '我可以一邊工作、一邊上課嗎？',
              fontSize: 16,
              margin: { mb: '13' },
              textAlign: 'left',
              fontWeight: 'normal',
              color: '#4c5b8f',
              padding: { pl: '8', pt: '2', pb: '2' },
              border: { borderLeftWidth: '4', borderLeftStyle: 'solid', borderLeftColor: '#4c5b8f' },
            }}
            paragraph={{
              paragraphContent:
                '在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一',
              fontSize: 16,
              margin: {},
              lineHeight: 1.69,
              textAlign: 'left',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
          <CraftTitleAndParagraph
            title={{
              titleContent: '完成暖身課程大約需要花多少時間？',
              fontSize: 16,
              margin: { mb: '13' },
              textAlign: 'left',
              fontWeight: 'normal',
              color: '#4c5b8f',
              padding: { pl: '8', pt: '2', pb: '2' },
              border: { borderLeftWidth: '4', borderLeftStyle: 'solid', borderLeftColor: '#4c5b8f' },
            }}
            paragraph={{
              paragraphContent:
                '在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一',
              fontSize: 16,
              margin: {},
              lineHeight: 1.69,
              textAlign: 'left',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
          <CraftTitleAndParagraph
            title={{
              titleContent: '我已有相關基礎',
              fontSize: 16,
              margin: { mb: '13' },
              textAlign: 'left',
              fontWeight: 'normal',
              color: '#4c5b8f',
              padding: { pl: '8', pt: '2', pb: '2' },
              border: { borderLeftWidth: '4', borderLeftStyle: 'solid', borderLeftColor: '#4c5b8f' },
            }}
            paragraph={{
              paragraphContent:
                '在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一種服務在現時段是一',
              fontSize: 16,
              margin: {},
              lineHeight: 1.69,
              textAlign: 'left',
              fontWeight: 'lighter',
              color: '#585858',
            }}
          />
        </Element>
      )}
    </Element>
  )
}

export default FAQSection
