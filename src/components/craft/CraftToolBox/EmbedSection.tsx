import { useEditor, UserComponent } from '@craftjs/core'
import { Image } from 'antd'
import { StyledBoxWrapper } from '.'

const EmbedSection: React.VFC = () => {
  const {
    connectors: { create },
  } = useEditor()

  return (
    <StyledBoxWrapper className="mb-3" ref={ref => ref && create(ref, <CraftEmbed />)}>
      <Image preview={false} src="https://static.kolable.com/images/default/craft/creator2.png" />
    </StyledBoxWrapper>
  )
}

const CraftEmbed: UserComponent<{}> = () => {
  return <div></div>
}

export default EmbedSection
