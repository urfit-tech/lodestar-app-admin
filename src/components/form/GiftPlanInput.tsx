import { gql, useQuery } from '@apollo/client'
import { DatePicker, Form, Input, Radio, Select } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { GiftPlan } from '../../types/giftPlan'
import formMessages from './translation'

const StyledDiv = styled.div`
  margin-top: 12px;
`

const GiftPlanInput: React.VFC<{ value?: boolean; onChange?: (event: any) => void }> = ({ value, onChange }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const { giftPlans } = useGiftPlans(appId)

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
            {giftPlans ? (
              <Select placeholder={formatMessage(formMessages.GiftPlanInput.pleaseSelectAGiftPlan)}>
                {giftPlans.map(giftPlan => (
                  <Select.Option key={giftPlan.id} value={giftPlan.id}>
                    {giftPlan.title}
                  </Select.Option>
                ))}
              </Select>
            ) : (
              formatMessage(formMessages.GiftPlanInput.pleaseCreateGiftPlan)
            )}
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

const useGiftPlans = (appId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_GIFT_PLANS, hasura.GET_GIFT_PLANSVariables>(
    GET_GIFT_PLANS,
    {
      variables: {
        appId,
      },
    },
  )

  const giftPlans: Pick<GiftPlan, 'id' | 'title'>[] =
    data?.gift_plan.map(v => ({
      id: v.id,
      title: v.title || '',
    })) || []

  return {
    giftPlans: giftPlans,
    refetchGiftPlans: refetch,
    giftPlansLoading: loading,
    giftPlansError: error,
  }
}

const GET_GIFT_PLANS = gql`
  query GET_GIFT_PLANS($appId: String!) {
    gift_plan(where: { app_id: { _eq: $appId } }, order_by: { created_at: desc }) {
      id
      title
    }
  }
`
