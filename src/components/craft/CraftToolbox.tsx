import { Element, useEditor } from '@craftjs/core'
import { Button, Select } from 'antd'
import React from 'react'
import { useIntl } from 'react-intl'
import { craftPageMessages } from '../../helpers/translation'
import { StyledFullWidthSelect } from '../admin'
import CraftButton from './CraftButton'

const CraftToolbox: React.VFC<{ setActiveKey: React.Dispatch<React.SetStateAction<string>> }> = ({ setActiveKey }) => {
  const { connectors } = useEditor()
  const { formatMessage } = useIntl()

  return (
    <div className="px-3 mt-2">
      <StyledFullWidthSelect defaultValue="cover" className="mb-4">
        <Select.Option key="cover" value="cover">
          {formatMessage(craftPageMessages.label.cover)}
        </Select.Option>
      </StyledFullWidthSelect>

      <Button
        className="mb-4"
        block
        ref={ref =>
          ref &&
          connectors.create(
            ref,
            <Element
              is={CraftButton}
              canvas
              title="12"
              link=""
              openNewTab={true}
              size="md"
              block={true}
              variant="outline"
              color="#cdcdcd"
              setActiveKey={setActiveKey}
            />,
          )
        }
      >
        test
      </Button>
    </div>
  )
}

export default CraftToolbox
