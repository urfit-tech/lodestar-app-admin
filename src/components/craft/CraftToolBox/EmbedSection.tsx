import { useEditor } from '@craftjs/core'
import { Image } from 'antd'
import { CraftEmbed } from 'lodestar-app-element/src/components/craft'
import { StyledBoxWrapper } from '.'

const EmbedSection: React.VFC = () => {
  const {
    connectors: { create },
  } = useEditor()

  return (
    <StyledBoxWrapper className="mb-3" ref={ref => ref && create(ref, <CraftEmbed iframe="" margin="0;0;0;0" />)}>
      <Image preview={false} src="https://static.kolable.com/images/default/craft/iframe.png" />
    </StyledBoxWrapper>
  )
}

export default EmbedSection
