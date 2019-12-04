import { Button, Checkbox, DatePicker, Form, Icon, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { AdminBlock, AdminPaneTitle } from '../admin'

const StyledIcon = styled(Icon)`
  color: #ff7d62;
`

const PodcastProgramPlanAdminBlock: React.FC<FormComponentProps> = ({ form }) => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const [withSalePrice, setWithSalePrice] = useState(typeof podcastProgramAdmin.salePrice === 'number')
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)

      updatePodcastProgram({
        onFinally: () => setLoading(false),
        data: {
          listPrice: values.listPrice,
          salePrice: withSalePrice ? values.salePrice || 0 : null,
          soldAt: withSalePrice && values.soldAt ? moment(values.soldAt).toDate() : null,
        },
      })
    })
  }

  return (
    <div className="container py-5">
      <AdminPaneTitle>銷售方案</AdminPaneTitle>

      <AdminBlock>
        <Form
          hideRequiredMark
          colon={false}
          onSubmit={e => {
            e.preventDefault()
            handleSubmit()
          }}
        >
          <Form.Item label="定價">
            {form.getFieldDecorator('listPrice', {
              initialValue: podcastProgramAdmin.listPrice,
            })(
              <InputNumber
                min={0}
                formatter={value => `NT$ ${value}`}
                parser={value => (value ? value.replace(/\D/g, '') : '')}
              />,
            )}
          </Form.Item>
          <div className="mb-4">
            <Checkbox defaultChecked={withSalePrice} onChange={e => setWithSalePrice(e.target.checked)}>
              優惠價
            </Checkbox>
          </div>
          <Form.Item className={withSalePrice ? 'm-0' : 'd-none'}>
            <Form.Item className="d-inline-block mr-2">
              {form.getFieldDecorator('salePrice', {
                initialValue: podcastProgramAdmin.salePrice || 0,
              })(
                <InputNumber
                  min={0}
                  formatter={value => `NT$ ${value}`}
                  parser={value => (value ? value.replace(/\D/g, '') : '')}
                />,
              )}
            </Form.Item>
            <Form.Item className="d-inline-block mr-2">
              {form.getFieldDecorator('soldAt', {
                initialValue:
                  podcastProgramAdmin && podcastProgramAdmin.soldAt ? moment(podcastProgramAdmin.soldAt) : null,
                rules: [{ required: withSalePrice, message: '請選擇日期' }],
              })(<DatePicker />)}
            </Form.Item>
            {form.getFieldValue('soldAt') && moment(form.getFieldValue('soldAt')).isBefore(moment()) ? (
              <div className="d-inline-block">
                <StyledIcon type="exclamation-circle" theme="filled" className="mr-1" />
                <span>已過期</span>
              </div>
            ) : null}
          </Form.Item>
          <Form.Item>
            <Button onClick={() => form.resetFields()} className="mr-2">
              取消
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              儲存
            </Button>
          </Form.Item>
        </Form>
      </AdminBlock>
    </div>
  )
}

export default Form.create()(PodcastProgramPlanAdminBlock)
