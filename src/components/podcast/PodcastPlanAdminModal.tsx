import { Button, Checkbox, Form, Icon, Input, InputNumber, Modal, Radio, Select } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import styled from 'styled-components'
import { CreatePodcastPlanProps } from '../../containers/podcast/PodcastPlanAdminModal'
import { useAuth } from '../auth/AuthContext'
import PodcastPeriodSelector from './PodcastPeriodSelector'
import { BREAK_POINT } from '../common/Responsive'
import { rgba } from '../../helpers'

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
  onCreate?: CreatePodcastPlanProps
}
const PodcastPlanCreationModal: React.FC<PodcastPlanCreationModalProps> = ({ form, onCreate }) => {
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [hasSalePrice, setSalePrice] = useState(false)
  const { currentUserRole } = useAuth()

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) return

      if (onCreate) {
        setLoading(true)

        onCreate({
          data: {
            isSubscription: true,
            title: "",
            listPrice: 100,
            periodAmount: 20,
            periodType: 'M',
            creatorId: 'admin-haohoaming'
          },
        })
      }
    })
  }
  return (
    <>
      <Button icon="file-add" type="primary" onClick={() => setVisible(true)}>
        建立方案
      </Button>

      <Modal title={null} footer={null} destroyOnClose centered visible={visible} onCancel={() => setVisible(false)}>
        <StyledIcon>
          <Icon type="file-add" />
        </StyledIcon>
        <StyledTitle>廣播頻道訂閱方案</StyledTitle>
        <Form>
          {currentUserRole !== 'content-creator' && <Form.Item label="選擇講師">
            {form.getFieldDecorator('creator', {
              rules: [{ required: true, message: '請輸入帳號 或 Email' }]
            })(<Input placeholder="請輸入帳號 或 Email" />)}
          </Form.Item>}
          <Form.Item label="販售狀態">
            {form.getFieldDecorator('status',
              { rules: [{ required: true }] }
            )(
              <Radio.Group>
                <Radio value={1}>
                  發佈，立刻開賣訂閱方案
              </Radio>
                <Radio value={2}>
                  停售，方案暫停對外銷售，並從廣播頁中隱藏
              </Radio>
              </Radio.Group>
            )}
          </Form.Item>
          <Form.Item label="訂閱週期">
            {form.getFieldDecorator('period', {
              initialValue: { amount: 0, type: 'D' },
              rules: [{ required: true, message: '請輸入訂閱週期' }]
            })(<PodcastPeriodSelector />)}
          </Form.Item>
          <Form.Item label="定價">
            {form.getFieldDecorator('listPrice', { rules: [{ required: true, message: '請輸入定價' }] })(<Input prefix="NT$" />)}
          </Form.Item>
          <Checkbox
            checked={hasSalePrice}
            onChange={e => setSalePrice(e.target.checked)}
          >優惠價</Checkbox>
          {hasSalePrice && <Form.Item label="優惠價">
            {form.getFieldDecorator('salePrice')(<Input prefix="NT$" />)}
          </Form.Item>}
        </Form>
        <div className="text-right">
          <Button className="mr-2" onClick={() => setVisible(false)}>
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

export default Form.create<PodcastPlanCreationModalProps>()(PodcastPlanCreationModal)
