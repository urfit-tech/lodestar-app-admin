import { Collapse, Input } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSettingLabel } from '../admin'

const CraftParagraphContentBlock: React.VFC<
  { paragraphContent: string; setParagraphContent: React.Dispatch<React.SetStateAction<string>> } & CollapseProps
> = ({ paragraphContent, setParagraphContent, ...collapseProps }) => {
  const { formatMessage } = useIntl()

  return (
    <Collapse
      {...collapseProps}
      className="mt-2 p-0"
      bordered={false}
      expandIconPosition="right"
      ghost
      defaultActiveKey={['paragraphContent']}
    >
      <StyledCollapsePanel
        key="paragraphContent"
        header={<AdminHeaderTitle>{formatMessage(craftPageMessages.label.content)}</AdminHeaderTitle>}
      >
        <div className="mb-2">
          <StyledCraftSettingLabel className="mb-2">
            {formatMessage(craftPageMessages.label.content)}
          </StyledCraftSettingLabel>
          <Input.TextArea
            rows={5}
            defaultValue={paragraphContent}
            onChange={e => setParagraphContent(e.target.value)}
          />
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export default CraftParagraphContentBlock
