import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import { CraftParagraph, CraftTitle, CraftTitleAndParagraph } from 'lodestar-app-element/src/components/craft'
import { StyledBoxWrapper } from '.'

const TextSection: React.VFC = () => {
  const { connectors } = useEditor()
  return (
    <>
      <StyledBoxWrapper
        className="mb-3"
        ref={ref =>
          ref &&
          connectors.create(
            ref,
            <Element
              is={CraftTitle}
              titleContent="幫助自己做出決定"
              fontSize={28}
              margin={{ mt: '25', mb: '25', ml: '25', mr: '25' }}
              textAlign="center"
              fontWeight="normal"
              color="#585858"
            />,
          )
        }
      >
        <Image preview={false} src="https://static.kolable.com/images/default/craft/title.png" />
      </StyledBoxWrapper>
      <StyledBoxWrapper
        className="mb-3"
        ref={ref =>
          ref &&
          connectors.create(
            ref,
            <Element
              is={CraftParagraph}
              paragraphContent="比起不學習更令人擔憂的是：「一直在無效學習！」
        所以我們不該是為學習而學習，而是在設定好學習目標，最關鍵的環節是需要找到適合自己有效的學習方式，才能在學習一項知識或技術後，真正轉化爲自己的能力。"
              fontSize={16}
              margin={{ mt: '25', mb: '25', ml: '25', mr: '25' }}
              lineHeight={1.69}
              textAlign="center"
              fontWeight="normal"
              color="#585858"
            />,
          )
        }
      >
        <Image preview={false} src="https://static.kolable.com/images/default/craft/paragraph.png" />
      </StyledBoxWrapper>
      <StyledBoxWrapper
        className="mb-3"
        ref={ref =>
          ref &&
          connectors.create(
            ref,
            <Element
              is={CraftTitleAndParagraph}
              title={{
                titleContent: '幫助自己做出決定',
                fontSize: 20,
                margin: { mt: '25', mb: '10', ml: '25', mr: '25' },
                textAlign: 'left',
                fontWeight: 'normal',
                color: '#4c5b8f',
              }}
              paragraph={{
                paragraphContent:
                  '比起不學習更令人擔憂的是：「一直在無效學習！」所以我們不該是為學習而學習，而是在設定好學習目標，最關鍵的環節是需要找到適合自己有效的學習方式，才能在學習一項知識或技術後，真正轉化爲自己的能力。',
                fontSize: 16,
                margin: { mb: '25', ml: '25', mr: '25' },
                lineHeight: 1.69,
                textAlign: 'left',
                fontWeight: 'lighter',
                color: '#585858',
              }}
            />,
          )
        }
      >
        <Image preview={false} src="https://static.kolable.com/images/default/craft/title-and-paragraph.png" />
      </StyledBoxWrapper>
    </>
  )
}

export default TextSection
