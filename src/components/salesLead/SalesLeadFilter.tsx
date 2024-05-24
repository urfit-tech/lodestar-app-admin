import { Text } from '@chakra-ui/react'
import { Form, Radio } from 'antd'
import Checkbox, { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { salesLeadDeliveryPageMessages } from '../../pages/SalesLeadDeliveryPage/translation'

export const SalesLeadTypeFilter: React.FC<{ formName: string; formLabel: string }> = ({ formName, formLabel }) => {
  const { formatMessage } = useIntl()
  return (
    <Form.Item name={formName} label={formLabel}>
      <Radio.Group>
        <Radio value="contained">
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.contained)}
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
        </Radio>
        <Radio value="only">
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.onlyFilter)}
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
        </Radio>
        <Radio value="excluded">
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.excluded)}
          {formatMessage(salesLeadDeliveryPageMessages.salesLeadDeliveryPage.completedLead)}
        </Radio>
      </Radio.Group>
    </Form.Item>
  )
}

const StyledExcludeCheckBoxFormItem = styled(Form.Item)`
  margin-bottom: 0px;
`

export const ExcludeCheckBox: React.FC<{
  getValueProps: () => {}
  formName: string
  onChange: (e: CheckboxChangeEvent) => void
  disabled: boolean
  text: string
}> = ({ getValueProps, onChange, formName, disabled, text }) => {
  return (
    <StyledExcludeCheckBoxFormItem name={formName} valuePropName="checked" getValueProps={getValueProps}>
      <Checkbox onChange={onChange} style={{ display: 'flex', alignItems: 'center' }} disabled={disabled}>
        <Text color="var(--gary-dark)" size="sm">
          {text}
        </Text>
      </Checkbox>
    </StyledExcludeCheckBoxFormItem>
  )
}
