import { Button, Checkbox, DatePicker, Form, Icon, InputNumber, Modal, Radio } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment'
import React, { Dispatch, SetStateAction, useState } from 'react'
import styled from 'styled-components'
import CreatorSelector from '../../containers/common/CreatorSelector'
import { rgba } from '../../helpers'
import { useAuth } from '../auth/AuthContext'
import { BREAK_POINT } from '../common/Responsive'
import PodcastPeriodSelector from './PodcastPeriodSelector'
export type PodcastPlanProps = (
  props: {
    onSuccess?: () => void,
    onError?: (error: Error) => void,
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
type PodcastPlanCreationModalProps = FormComponentProps & {
  onSubmit: PodcastPlanProps
  isVisible: boolean
  onVisibleSet: Dispatch<SetStateAction<boolean>>
  podcastPlan?: {
    id: string
    periodType: "Y" | 'M' | "W"
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
  children
}) => {
  const [loading, setLoading] = useState(false)
  const { currentUserRole } = useAuth()

  const [hasSalePrice, setSalePrice] = useState<boolean>(Boolean(podcastPlan && podcastPlan.salePrice))

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) return

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
            salePrice: values.salePrice,
            soldAt: values.soldAt,
            periodAmount: values.period.amount,
            periodType: values.period.type,
            creatorId: values.creatorId
          }
        })
      }
    })
  }

  return (
    <>
      {children}

      <Modal title={null} footer={null} destroyOnClose centered visible={isVisible} onCancel={() => onVisibleSet(false)}>
        <StyledIcon>
          <Icon type="file-add" />
        </StyledIcon>
        <StyledTitle>廣播頻道訂閱方案</StyledTitle>
        <Form>
          {currentUserRole !== 'content-creator' && <Form.Item label="選擇講師">
            {form.getFieldDecorator('creatorId', {
              initialValue: podcastPlan ? podcastPlan.creatorId : '',
              rules: [{ required: true, message: '請輸入帳號 或 Email' }]
            })(<CreatorSelector />)}
          </Form.Item>}
          <Form.Item label="販售狀態">
            {form.getFieldDecorator('status', {
              initialValue: podcastPlan ? podcastPlan.isPublished : true,
              rules: [{ required: true }]
            })(
              <Radio.Group>
                <Radio value={true}>
                  發佈，立刻開賣訂閱方案
                </Radio>
                <Radio value={false}>
                  停售，方案暫停對外銷售，並從廣播頁中隱藏
                </Radio>
              </Radio.Group>
            )}
          </Form.Item>
          <Form.Item label="訂閱週期">
            {form.getFieldDecorator('period', {
              initialValue: {
                amount: podcastPlan ? podcastPlan.periodAmount : 1,
                type: podcastPlan ? podcastPlan.periodType : "D"
              },
              rules: [{ required: true, message: '請輸入訂閱週期' }]
            })(<PodcastPeriodSelector />)}
          </Form.Item>
          <Form.Item label="定價">
            {form.getFieldDecorator('listPrice', {
              initialValue: podcastPlan ? podcastPlan.listPrice : 0,
              rules: [{ required: true, message: '請輸入定價' }, { type: 'number' }]
            })(<InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
            />)}
          </Form.Item>
          <Checkbox
            checked={hasSalePrice}
            onChange={e => setSalePrice(e.target.checked)}
          >優惠價</Checkbox>
          {hasSalePrice && <Form.Item label="優惠價">
            {form.getFieldDecorator('salePrice', {
              initialValue: podcastPlan ? podcastPlan.salePrice : 0,
              rules: [{ required: true, message: '請輸入優惠價' }, { type: 'number' }],
            })(<InputNumber
              min={0}
              formatter={value => `NT$ ${value}`}
              parser={value => (value ? value.replace(/\D/g, '') : '')}
              className="mr-2"
            />)}
            {form.getFieldDecorator('soldAt', {
              initialValue: podcastPlan && podcastPlan.soldAt ? moment(podcastPlan.soldAt) : null,
              rules: [{ required: true }]
            })(<DatePicker placeholder="優惠截止日期" />)}
          </Form.Item>}
        </Form>
        <div className="text-right">
          <Button className="mr-2" onClick={() => onVisibleSet(false)}>
            取消
          </Button>
          <Button type="primary" htmlType="submit" loading={loading} onClick={() => handleSubmit()}>
            儲存
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default Form.create<PodcastPlanCreationModalProps>()(PodcastPlanAdminModal)
