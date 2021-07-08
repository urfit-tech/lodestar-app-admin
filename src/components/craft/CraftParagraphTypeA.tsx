import { useNode, UserComponent } from '@craftjs/core'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftParagraphProps, CraftTextStyleProps } from '../../types/craft'
import CraftParagraphContentBlock from './CraftParagraphContentBlock'
import CraftStyleBlock from './CraftStyleBlock'

const CraftParagraphTypeA: UserComponent<
  CraftParagraphProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }
> = ({ paragraphContent, fontSize, padding, textAlign, fontWeight, color, setActiveKey, children }) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={ref => ref && connect(drag(ref))} onClick={() => setActiveKey('settings')}>
      {children}
    </div>
  )
}

const LayoutSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftParagraphProps,
  }))
  const [paragraphContent, setParagraphContent] = useState(props.paragraphContent || '')
  const [paragraphStyle, setParagraphStyle] = useState<CraftTextStyleProps>({
    fontSize: props.fontSize || 16,
    padding: props.padding || 0,
    lineHeight: props?.lineHeight || undefined,
    textAlign: props.textAlign || 'left',
    fontWeight: props.fontWeight || 'normal',
    color: props.color || '#585858',
  })

  return (
    <>
      <CraftParagraphContentBlock paragraphContent={paragraphContent} setParagraphContent={setParagraphContent} />
      <CraftStyleBlock
        type="paragraph"
        title={formatMessage(craftPageMessages.label.paragraphStyle)}
        textStyle={paragraphStyle}
        setTextStyle={setParagraphStyle}
      />
      <Button
        className="mb-3"
        type="primary"
        block
        onClick={() => {
          setProp((props: CraftParagraphProps) => {
            props.paragraphContent = paragraphContent
            props.fontSize = paragraphStyle.fontSize
            props.lineHeight = paragraphStyle.lineHeight
            props.padding = paragraphStyle.padding
            props.textAlign = paragraphStyle.textAlign
            props.fontWeight = paragraphStyle.fontWeight
            props.color = paragraphStyle.color
          })
        }}
      >
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </>
  )
}

CraftParagraphTypeA.craft = {
  related: {
    settings: LayoutSettings,
  },
}

export default CraftParagraphTypeA
