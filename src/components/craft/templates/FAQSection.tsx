import { Element } from '@craftjs/core'
import {
  CraftCollapse,
  CraftLayout,
  CraftSection,
  CraftTitle,
} from 'lodestar-app-element/src/components/common/CraftElement'
import React from 'react'
import { useIntl } from 'react-intl'
import craftMessages from '../translation'

const FAQSection: React.VFC<{ variant?: 'accordion' }> = ({ variant }) => {
  const { formatMessage } = useIntl()
  return (
    <Element id="CraftSection" is={CraftSection} customStyle={{ padding: '64 0', margin: '0 0 5 0' }} canvas>
      <CraftTitle
        title={formatMessage(craftMessages.FAQSection.faqTitle)}
        customStyle={{
          fontSize: 20,
          margin: '0 0 40 0',
          textAlign: 'center',
          fontWeight: 'bold',
          color: '#585858',
        }}
      />
      {variant === 'accordion' ? (
        <Element
          id="CraftLayout"
          is={CraftLayout}
          ratios={[12]}
          customStyle={{
            margin: '0 20',
          }}
          responsive={{
            desktop: {
              ratios: [12],
              customStyle: {
                margin: '0 200',
              },
            },
          }}
          canvas
        >
          <Element
            id="CraftCollapse1"
            is={CraftCollapse}
            list={[
              {
                title: formatMessage(craftMessages.FAQSection.title1),
                description: formatMessage(craftMessages.FAQSection.description1),
              },
              {
                title: formatMessage(craftMessages.FAQSection.title2),
                description: formatMessage(craftMessages.FAQSection.description2),
              },
              {
                title: formatMessage(craftMessages.FAQSection.title3),
                description: formatMessage(craftMessages.FAQSection.description3),
              },
            ]}
            customStyle={{
              padding: 20,
              '.title': {
                fontSize: 16,
                margin: 0,
                textAlign: 'left',
                fontWeight: 'bold',
                color: '#585858',
              },
              '.paragraph': {
                fontSize: 16,
                margin: '0 0 20 0',
                textAlign: 'left',
                fontWeight: 'normal',
                color: '#585858',
              },
            }}
            canvas
          />
        </Element>
      ) : (
        <Element
          id="CraftLayout"
          is={CraftLayout}
          ratios={[12]}
          customStyle={{
            margin: '0 20',
          }}
          responsive={{
            desktop: {
              ratios: [12],
              customStyle: {
                margin: '0 200',
              },
            },
          }}
          canvas
        >
          {/* <CraftTitleAndParagraph
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
          /> */}
        </Element>
      )}
    </Element>
  )
}

export default FAQSection
