import { Button, Form, Modal, Icon, Input, Radio, Select, Checkbox, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import React, { useState } from 'react'
import { CreatePodcastPlanProps } from '../../containers/podcast/PodcastPlanCreationModal'
import styled from 'styled-components'

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

      {/* 在前端就做表單驗證？ */}
      {/* 用正則表示式做表單驗證？ */}
      <Modal title={null} footer={null} destroyOnClose centered visible={visible} onCancel={() => setVisible(false)}>
        <Icon type="file-add" />
        <StyledTitle>廣播頻道訂閱方案</StyledTitle>
        <Form>
          <Form.Item label="選擇講師">
            {/* 選擇講師這裡的行為會是什麼？ */}
            <Input placeholder="請輸入帳號 或 Email" />
          </Form.Item>
          <Form.Item label="販售狀態">
            <Radio.Group>
              <Radio value={1}>
                發佈，立刻開賣訂閱方案
              </Radio>
              <Radio value={2}>
                停售，方案暫停對外銷售，並從廣播頁中隱藏
              </Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="訂閱週期">
            <InputNumber size="large"/>
            <Select defaultValue="M" >
              <Select.Option value="D">天</Select.Option>
              <Select.Option value="W">週</Select.Option>
              <Select.Option value="M">月</Select.Option>
              <Select.Option value="Y">年</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="定價">
            <Input prefix="NT$"/>
          </Form.Item>
          <Checkbox>優惠價</Checkbox>
        </Form>
      </Modal>
    </>
  )
}

export default Form.create<PodcastPlanCreationModalProps>()(PodcastPlanCreationModal)
