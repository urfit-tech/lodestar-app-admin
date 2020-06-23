import { Button, Form, Icon, InputNumber, Modal, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import styled from 'styled-components'
import { useAuth } from '../../contexts/AuthContext'
import { rgba } from '../../helpers'
import { commonMessages, errorMessages, podcastMessages } from '../../helpers/translation'
import SaleInput from '../admin/SaleInput'
import CreatorSelector from '../common/CreatorSelector'
import { BREAK_POINT } from '../common/Responsive'
import PodcastPeriodSelector from './PodcastPeriodSelector'

const StyledIcon = styled.div<{ available?: boolean }>`
  display: none;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  background: ${props => rgba(props.theme['@primary-color'], 0.1)};
  font-size: 2rem;

  svg path {
    fill: ${props => props.theme['@primary-color']};
  }

  @media (min-width: ${BREAK_POINT}px) {
    display: flex;
  }
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`

const messages = defineMessages({
  planPublished: { id: 'podcast.status.planPublished', defaultMessage: '發佈，立刻開賣訂閱方案' },
  planNotPublished: {
    id: 'podcast.status.planNotPublished',
    defaultMessage: '停售，方案暫停對外銷售，並從廣播頁中隱藏',
  },
})

export type PodcastPlanProps = (props: {
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
  data: {
    title: string
    isPublished: boolean
    isSubscription: boolean
    listPrice: number
    salePrice: number
    soldAt: Date | null
    periodAmount: number
    periodType: string
    creatorId: string
    podcastPlanId?: string
  }
}) => void

type PodcastPlanCreationModalProps = FormComponentProps & {
  onSubmit: PodcastPlanProps
  isVisible: boolean
  onVisibleSet: Dispatch<SetStateAction<boolean>>
  podcastPlan?: {
    id: string
    periodType: 'Y' | 'M' | 'W'
    periodAmount: number
    listPrice: number
    salePrice?: number | null
    soldAt?: Date | null
    isPublished?: boolean | null
    podcastPlanId?: string
    creatorId?: string | null
  } | null
}
const PodcastPlanAdminModal: React.FC<PodcastPlanCreationModalProps> = ({
  form,
  onSubmit,
  isVisible,
  onVisibleSet,
  podcastPlan,
  children,
}) => {
  const { formatMessage } = useIntl()
  const { currentUserRole } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onSubmit) {
        setLoading(true)

        onSubmit({
          onSuccess: () => onVisibleSet(false),
          onError: error => console.log(error),
          onFinally: () => setLoading(false),
          data: {
            title: values.title,
            isPublished: values.status,
            isSubscription: true,
            listPrice: values.listPrice,
            salePrice: values.sale ? values.sale.price : null,
            soldAt: values.sale ? values.sale.soldAt : null,
            periodAmount: values.period.amount,
            periodType: values.period.type,
            creatorId: values.creatorId,
          },
        })
      }
    })
  }

  return (
    <>
      {children}

      <Modal
        title={null}
        footer={null}
        destroyOnClose
        centered
        visible={isVisible}
        onCancel={() => onVisibleSet(false)}
      >
        <StyledIcon>
          <Icon type="file-add" />
        </StyledIcon>
        <StyledTitle>{formatMessage(podcastMessages.term.podcastPlan)}</StyledTitle>
        <Form hideRequiredMark colon={false}>
          {currentUserRole !== 'content-creator' && (
            <Form.Item label={formatMessage(commonMessages.label.selectInstructor)}>
              {form.getFieldDecorator('creatorId', {
                initialValue: podcastPlan ? podcastPlan.creatorId : '',
                rules: [{ required: true, message: formatMessage(errorMessages.form.selectInstructor) }],
              })(<CreatorSelector />)}
            </Form.Item>
          )}
          <Form.Item label={formatMessage(commonMessages.label.sellingStatus)}>
            {form.getFieldDecorator('status', {
              initialValue: podcastPlan ? podcastPlan.isPublished : true,
              rules: [{ required: true }],
            })(
              <Radio.Group>
                <Radio value={true}>{formatMessage(messages.planPublished)}</Radio>
                <Radio value={false}>{formatMessage(messages.planNotPublished)}</Radio>
              </Radio.Group>,
            )}
          </Form.Item>
          <Form.Item label={formatMessage(commonMessages.term.periodType)}>
            {form.getFieldDecorator('period', {
              initialValue: {
                amount: podcastPlan ? podcastPlan.periodAmount : 1,
                type: podcastPlan ? podcastPlan.periodType : 'D',
              },
              rules: [
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.periodType),
                  }),
                },
              ],
            })(<PodcastPeriodSelector />)}
          </Form.Item>
          <Form.Item label={formatMessage(commonMessages.term.listPrice)}>
            {form.getFieldDecorator('listPrice', {
              initialValue: podcastPlan ? podcastPlan.listPrice : 0,
              rules: [
                {
                  required: true,
                  message: formatMessage(errorMessages.form.isRequired, {
                    field: formatMessage(commonMessages.term.listPrice),
                  }),
                },
                { type: 'number' },
              ],
            })(
              <InputNumber
                min={0}
                formatter={value => `NT$ ${value}`}
                parser={value => (value ? value.replace(/\D/g, '') : '')}
              />,
            )}
          </Form.Item>

          <Form.Item>
            {form.getFieldDecorator('sale', {
              initialValue: podcastPlan?.soldAt
                ? {
                    price: podcastPlan.salePrice || 0,
                    soldAt: podcastPlan.soldAt,
                  }
                : null,
              rules: [{ validator: (rule, value, callback) => callback((value && !value.soldAt) || undefined) }],
            })(<SaleInput />)}
          </Form.Item>
        </Form>

        <div className="text-right">
          <Button className="mr-2" onClick={() => onVisibleSet(false)}>
            {formatMessage(commonMessages.ui.cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => handleSubmit()}>
            {formatMessage(commonMessages.ui.save)}
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default Form.create<PodcastPlanCreationModalProps>()(PodcastPlanAdminModal)
