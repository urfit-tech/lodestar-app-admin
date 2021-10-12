import { Element, useEditor } from '@craftjs/core'
import { Image } from 'antd'
import CraftImage from 'lodestar-app-element/src/components/craft/CraftImage'
import { StyledBoxWrapper } from '.'

const ImageSection: React.VFC = () => {
  const { connectors } = useEditor()
  return (
    <StyledBoxWrapper
      className="mb-3"
      ref={ref =>
        ref &&
        connectors.create(
          ref,
          <Element
            is={CraftImage}
            desktop={{
              width: '100%',
              padding: {},
              margin: {},
              coverUrl: 'https://static.kolable.com/images/default/craft/image.png',
            }}
            mobile={{
              width: '100%',
              padding: {},
              margin: {},
              coverUrl: 'https://static.kolable.com/images/default/craft/image.png',
            }}
          />,
        )
      }
    >
      <Image preview={false} src="https://static.kolable.com/images/default/craft/image.png" />
    </StyledBoxWrapper>
  )
}

export default ImageSection
