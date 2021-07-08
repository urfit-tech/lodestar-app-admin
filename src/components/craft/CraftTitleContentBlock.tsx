import { Collapse, Input } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSettingLabel } from '../admin'

const CraftTitleContentBlock: React.VFC<
  { titleContent: string; setTitleContent: React.Dispatch<React.SetStateAction<string>> } & CollapseProps
> = ({ titleContent, setTitleContent, ...collapseProps }) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
      {...collapseProps}
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['titleContent']}
    >
      <StyledCollapsePanel
        key="titleContent"
        header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.titleContent)}</AdminHeaderTitle>}
      >
        <div className="mb-2">
          <StyledCraftSettingLabel className="mb-2">
            {formatMessage(craftPageMessages.label.titleContent)}
          </StyledCraftSettingLabel>
          <Input value={titleContent} onChange={e => setTitleContent(e.target.value)} />
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export default CraftTitleContentBlock
