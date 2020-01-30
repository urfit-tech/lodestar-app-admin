import { Button, DatePicker, Form, Input, InputNumber } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import moment from 'moment'
import React, { useState } from 'react'
import ProductSelector from '../../containers/common/ProductSelector'
import AdminModal, { AdminModalProps } from '../admin/AdminModal'
import PlanCodeSelector, { PlanCodeProps } from '../checkout/PlanCodeSelector'

export type VoucherPlanFields = {
  title: string
  productQuantityLimit: number
  voucherCodes: PlanCodeProps[]
  voucherPlanProducts: string[]
  description: string | null
  startedAt?: Date
  endedAt?: Date
}
type VoucherPlanAdminModalProps = AdminModalProps &
  FormComponentProps & {
    voucherPlan?: {
      id: string
      title: string
      description: string | null
      startedAt?: Date
      endedAt?: Date
      productQuantityLimit: number
      productIds: string[]
    }
    onSubmit?: (
      setVisible: React.Dispatch<React.SetStateAction<boolean>>,
      setLoading: React.Dispatch<React.SetStateAction<boolean>>,
      values: VoucherPlanFields,
    ) => void
  }
const VoucherPlanAdminModal: React.FC<VoucherPlanAdminModalProps> = ({ form, voucherPlan, onSubmit, ...props }) => {
  const [loading, setLoading] = useState(false)

  const handleClick = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      if (onSubmit) {
        onSubmit(setVisible, setLoading, values)
      }
    })
  }

  return (
    <AdminModal
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={loading} onClick={() => handleClick(setVisible)}>
            確定
          </Button>
        </>
      )}
      maskClosable={false}
      {...props}
    >
      <Form hideRequiredMark colon={false}>
        <Form.Item label="兌換方案名稱">
          {form.getFieldDecorator('title', {
            initialValue: voucherPlan ? voucherPlan.title : '',
            rules: [{ required: true, message: '請輸入兌換方案名稱' }],
          })(<Input type="text" />)}
        </Form.Item>

        {!voucherPlan && (
          <Form.Item label="兌換碼">
            {form.getFieldDecorator('voucherCodes', {
              rules: [{ required: true, message: '至少一組兌換碼' }],
            })(<PlanCodeSelector planType="voucher" />)}
          </Form.Item>
        )}

        <Form.Item label="兌換項目">
          {form.getFieldDecorator('voucherPlanProducts', {
            initialValue: voucherPlan ? voucherPlan.productIds : [],
            rules: [{ required: true, message: '至少選一個兌換項目' }],
          })(<ProductSelector allowTypes={['Program', 'Card', 'ActivityTicket']} />)}
        </Form.Item>

        <Form.Item label="兌換項目數量">
          {form.getFieldDecorator('productQuantityLimit', {
            initialValue: voucherPlan ? voucherPlan.productQuantityLimit : 1,
            rules: [{ required: true, message: '數量至少為 1' }],
          })(<InputNumber min={1} />)}
        </Form.Item>

        <Form.Item label="有效期限">
          <Form.Item className="d-inline-block m-0">
            {form.getFieldDecorator('startedAt', {
              initialValue: voucherPlan && voucherPlan.startedAt ? moment(voucherPlan.startedAt) : null,
            })(
              <DatePicker
                placeholder="開始日期"
                format="YYYY-MM-DD HH:mm"
                showTime={{ defaultValue: moment('00:00:00', 'HH:mm') }}
              />,
            )}
          </Form.Item>
          <span className="d-inline-block px-2">-</span>
          <Form.Item className="d-inline-block m-0">
            {form.getFieldDecorator('endedAt', {
              initialValue: voucherPlan && voucherPlan.endedAt ? moment(voucherPlan.endedAt) : null,
            })(
              <DatePicker
                placeholder="截止日期"
                format="YYYY-MM-DD HH:mm"
                showTime={{ defaultValue: moment('23:59:59', 'HH:mm') }}
              />,
            )}
          </Form.Item>
        </Form.Item>
        <Form.Item label="使用限制和描述">
          {form.getFieldDecorator('description', {
            initialValue: voucherPlan ? voucherPlan.description : '',
            rules: [{ required: false }],
          })(<Input.TextArea rows={4} placeholder="非必填" />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

export default Form.create<VoucherPlanAdminModalProps>()(VoucherPlanAdminModal)
