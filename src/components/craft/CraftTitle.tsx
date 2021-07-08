import { useNode, UserComponent } from '@craftjs/core'
import { Button } from 'antd'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, craftPageMessages } from '../../helpers/translation'
import { CraftTitleProps } from '../../types/craft'
import CraftStyleBlock from './CraftStyleBlock'
import CraftTitleContentBlock from './CraftTitleContentBlock'

const CraftTitle: UserComponent<CraftTitleProps & { setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({
  titleContent,
  fontSize,
  padding,
  textAlign,
  fontWeight,
  color,
  setActiveKey,
  children,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()

  return (
    <div ref={ref => ref && connect(drag(ref))} onClick={() => setActiveKey('settings')}>
      {children}
    </div>
  )
}

const TitleSettings: React.VFC = () => {
  const { formatMessage } = useIntl()
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as CraftTitleProps,
  }))
  const [titleContent, setTitleContent] = useState(props.titleContent || '')
  const [titleStyle, setTitleStyle] = useState({
    fontSize: props.fontSize || 16,
    padding: props.padding || 0,
    textAlign: props.textAlign || 'left',
    fontWeight: props.fontWeight || 'normal',
    color: props.color || '#585858',
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
      <Button
        className="mb-3"
        type="primary"
        block
        onClick={() => {
          setProp((props: CraftTitleProps) => {
            props.titleContent = titleContent
            props.fontSize = titleStyle.fontSize
            props.padding = titleStyle.padding
            props.textAlign = titleStyle.textAlign
            props.fontWeight = titleStyle.fontWeight
            props.color = titleStyle.color
          })
        }}
      >
        {formatMessage(commonMessages.ui.save)}
      </Button>
    </>
  )
}

CraftTitle.craft = {
  related: {
    settings: TitleSettings,
  },
}

export default CraftTitle
