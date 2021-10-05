import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import {
  CraftBackground,
  CraftLayout,
  CraftTitle,
  CraftTitleAndParagraph,
} from 'lodestar-app-element/src/components/craft'
import React from 'react'
import { StyledBoxWrapper } from '.'

const FAQSection: React.VFC = () => {
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
          </Element>,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/faq-column.png" />
    </StyledBoxWrapper>
  )
}

export default FAQSection
