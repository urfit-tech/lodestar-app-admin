import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftButton from 'lodestar-app-element/src/components/craft/CraftButton'
import { StyledBoxWrapper } from '.'

const ButtonSection: React.FC = () => {
  const { connectors } = useEditor()
  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        connectors.create(
          ref,
          <Element
            is={CraftButton}
            title="馬上查看"
            link=""
            openNewTab={false}
            size="lg"
            block={false}
            variant="solid"
            color="#fff"
            backgroundType="solidColor"
            backgroundColor="#4c5b8f"
          />,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/button.png" />
    </StyledBoxWrapper>
  )
}

export default ButtonSection
