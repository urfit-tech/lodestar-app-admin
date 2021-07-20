import { Collapse, Input } from 'antd'
import { CollapseProps } from 'antd/lib/collapse'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { AdminHeaderTitle, StyledCollapsePanel, StyledCraftSettingLabel } from '../admin'

const CraftTitleContentBlock: React.VFC<{ value?: string; onChange?: (value?: string) => void } & CollapseProps> = ({
  value,
  onChange,
  ...collapseProps
}) => {
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
          <StyledCraftSettingLabel>{formatMessage(craftPageMessages.label.title)}</StyledCraftSettingLabel>
          <Input className="mt-2" value={value} onChange={e => onChange && onChange(e.target.value)} />
        </div>
      </StyledCollapsePanel>
    </Collapse>
  )
}

export default CraftTitleContentBlock
