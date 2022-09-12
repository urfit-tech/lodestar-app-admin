import { DatePicker, Form, Input, Radio } from 'antd'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import ProductSelector from './ProductSelector'
import formMessages from './translation'

const StyledDiv = styled.div`
  margin-top: 12px;
`

const GiftPlanInput: React.VFC<{ value?: boolean; onChange?: (event: any) => void }> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  return (
    <>
      <Radio.Group defaultValue={value} onChange={onChange}>
        <Radio value={false} className="default d-block">
          {formatMessage(formMessages.GiftPlanInput.noGiftPlan)}
        </Radio>
        <Radio value={true} className="d-block">
          {formatMessage(formMessages.GiftPlanInput.hasGiftPlan)}
        </Radio>
      </Radio.Group>
      {value && (
        <StyledDiv>
          <Form.Item name="productGiftPlanId" hidden>
            <Input />
          </Form.Item>
          <Form.Item
            name="giftPlanProductId"
            rules={[
              {
                required: true,
                message: formatMessage(formMessages.GiftPlanInput.pleaseSelectAGiftPlan),
              },
            ]}
          >
            <ProductSelector allowTypes={['GiftPlan']} />
          </Form.Item>
          <Input.Group compact>
            <Form.Item name="giftPlanStartedAt">
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: 'HH:mm', defaultValue: moment('00:00:00', 'HH:mm:ss') }}
                placeholder={formatMessage(formMessages['*'].startedAt)}
              />
            </Form.Item>
            <Form.Item name="giftPlanEndedAt">
              <DatePicker
                format="YYYY-MM-DD HH:mm"
                showTime={{ format: 'HH:mm', defaultValue: moment('23:59:00', 'HH:mm:ss') }}
                placeholder={formatMessage(formMessages['*'].endedAt)}
              />
            </Form.Item>
          </Input.Group>
        </StyledDiv>
      )}
    </>
  )
}

export default GiftPlanInput
