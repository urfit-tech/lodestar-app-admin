import { useNode, UserComponent } from '@craftjs/core'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftParagraphProps, CraftTextStyleProps, CraftTitleProps } from '../../types/craft'
import CraftParagraphContentBlock from './CraftParagraphContentBlock'
import CraftStyleBlock from './CraftStyleBlock'
import CraftTitleContentBlock from './CraftTitleContentBlock'

const CraftParagraphTypeB: UserComponent<
  { title: CraftTitleProps; paragraph: CraftParagraphProps } & {
    setActiveKey: React.Dispatch<React.SetStateAction<string>>
  }
> = ({ title, paragraph, setActiveKey, children }) => {
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
    props: {
      title: node.data.props.title as CraftTitleProps,
      paragraph: node.data.props.paragraph as CraftParagraphProps,
    },
  }))

  const [titleContent, setTitleContent] = useState(props.title.titleContent || '')
  const [titleStyle, setTitleStyle] = useState({
    fontSize: props.title.fontSize || 16,
    padding: props.title.padding || 0,
    textAlign: props.title.textAlign || 'left',
    fontWeight: props.title.fontWeight || 'normal',
    color: props.title.color || '#585858',
  })
  const [paragraphContent, setParagraphContent] = useState(props.paragraph.paragraphContent || '')
  const [paragraphStyle, setParagraphStyle] = useState<CraftTextStyleProps>({
    fontSize: props.paragraph.fontSize || 16,
    padding: props.paragraph.padding || 0,
    lineHeight: props?.paragraph.lineHeight || undefined,
    textAlign: props.paragraph.textAlign || 'left',
    fontWeight: props.paragraph.fontWeight || 'normal',
    color: props.paragraph.color || '#585858',
  })

  return (
    <>
      <CraftTitleContentBlock titleContent={titleContent} setTitleContent={setTitleContent} />
      <CraftStyleBlock
        type="title"
        title={formatMessage(craftPageMessages.label.titleStyle)}
        textStyle={titleStyle}
        setTextStyle={setTitleStyle}
      />
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
          setProp((props: { title: CraftTitleProps; paragraph: CraftParagraphProps }) => {
            props.title.titleContent = titleContent
            props.title.fontSize = titleStyle.fontSize
            props.title.padding = titleStyle.padding
            props.title.textAlign = titleStyle.textAlign
            props.title.fontWeight = titleStyle.fontWeight
            props.title.color = titleStyle.color
            props.paragraph.paragraphContent = paragraphContent
            props.paragraph.fontSize = paragraphStyle.fontSize
            props.paragraph.lineHeight = paragraphStyle.lineHeight
            props.paragraph.padding = paragraphStyle.padding
            props.paragraph.textAlign = paragraphStyle.textAlign
            props.paragraph.fontWeight = paragraphStyle.fontWeight
            props.paragraph.color = paragraphStyle.color
          })
        }}
      >
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </>
  )
}

CraftParagraphTypeB.craft = {
  related: {
    settings: LayoutSettings,
  },
  custom: {
    button: {
      label: 'deleteAllBlock',
    },
  },
}

export default CraftParagraphTypeB
