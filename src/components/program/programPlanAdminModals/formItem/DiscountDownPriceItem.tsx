import { Checkbox, Form } from 'antd'
import { CheckboxChangeEvent } from 'antd/lib/checkbox'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { commonMessages } from '../../../../helpers/translation'
import CurrencyInput from '../../../form/CurrencyInput'

interface DiscountDownPriceProps {
  label?: string
  name: string
  isChecked: boolean
  ProgramPlanCurrencyId: string
  onChange: (e: CheckboxChangeEvent) => void
}

const StyledNotation = styled.div`
  line-height: 1.5;
  letter-spacing: 0.4px;
  font-size: 14px;
  font-weight: 500;
  color: #9b9b9b;
  white-space: pre-line;
`

const DiscountDownPriceItem: React.FC<DiscountDownPriceProps> = ({
  name,
  isChecked,
  ProgramPlanCurrencyId,
  onChange,
}) => {
  const { formatMessage } = useIntl()

  return (
    <>
      <div>
        <Checkbox
          checked={isChecked}
          className="mb-2"
          onChange={e => {
            onChange(e)
          }}
        >
          {formatMessage(commonMessages.label.discountDownPrice)}
        </Checkbox>
        {isChecked && (
          <Form.Item
            name={name}
            help={
              <StyledNotation className="mt-2 mb-4">
                {formatMessage(commonMessages.text.discountDownNotation)}
              </StyledNotation>
            }
          >
            <CurrencyInput currencyId={ProgramPlanCurrencyId} />
          </Form.Item>
        )}
      </div>
    </>
  )
}

export default DiscountDownPriceItem
