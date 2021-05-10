import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import axios from 'axios'
import gql from 'graphql-tag'
import AdminModal, { AdminModalProps } from 'lodestar-app-admin/src/components/admin/AdminModal'
import { handleError } from 'lodestar-app-admin/src/helpers/index'
import moment from 'moment'
import React, { useState } from 'react'
import hasura from '../../hasura'

type ChaileaseApplyModalProps = {
  memberId: string
  email: string
  createdAt: Date
  idNumber: string
  chailease: {
    orderId: string
    productName: string
    infoReserve: { [key: string]: any }
    status?: string
  }[]
  onSuccess?: () => void
} & AdminModalProps

type ChaileaseApplyFieldProps = {
  productName: string
  productPrice: number
}

const ChaileaseApplyModal: React.FC<ChaileaseApplyModalProps> = ({
  memberId,
  email,
  createdAt,
  idNumber,
  chailease,
  onSuccess,
  ...props
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [form] = useForm<ChaileaseApplyFieldProps>()
  const [updateMemberMetadata] = useMutation<hasura.UPDATE_MEMBER_METADATA, hasura.UPDATE_MEMBER_METADATAVariables>(
    UPDATE_MEMBER_METADATA,
  )
  const handleSubmit = (setVisible: React.Dispatch<React.SetStateAction<boolean>>) => {
    form
      .validateFields()
      .then(async values => {
        setIsLoading(true)
        try {
          const orderId = moment().format('YYYYMMDDHHmmssSSS')
          const infoReserve = await requestChailease({
            orderId,
            email: email,
            createdAt: createdAt,
            idNumber: idNumber,
            ...values,
          })
          await updateMemberMetadata({
            variables: {
              memberId,
              metadata: {
                chailease: [
                  ...chailease,
                  {
                    orderId: orderId,
                    productName: values.productName,
                    infoReserve,
                  },
                ],
              },
            },
          })
          message.success('提交成功')
          setVisible(false)
          onSuccess?.()
        } catch (err) {
          handleError(err)
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <AdminModal
      title={'申請融資'}
      footer={null}
      renderFooter={({ setVisible }) => (
        <>
          <Button className="mr-2" onClick={() => setVisible(false)}>
            取消
          </Button>
          <Button type="primary" loading={isLoading} onClick={() => handleSubmit(setVisible)}>
            提交
          </Button>
        </>
      )}
      {...props}
    >
      <Form form={form} colon={false} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
        <Form.Item label={'產品名稱'} name="productName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={'產品價格'} name="productPrice" rules={[{ required: true }]}>
          <Input type="number" />
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const requestChailease = async (info: {
  orderId: string
  email: string
  createdAt: Date
  idNumber: string
  productName: string
  productPrice: number
}) => {
  const { orderId, email, createdAt, idNumber, productName, productPrice } = info

  const dateNow = new Date().getTime()
  const agedAccount = dateNow - createdAt.getTime() > 30 * 86400 * 1000

  const { data: apiData } = await axios.post(
    'https://api.chaileaseholding.com/api_zero_card',
    {
      product_name: productName,
      order_id: orderId,
      amount: productPrice,
      installment: 12,
      fee_type: 'vendor',
      notify_url: 'https://form.xuemi.co/api/chailease_notify',
      valid_days: 1,
      capture: false,
      buyer_data: {
        specific_id: idNumber,
        email,
        account_age: agedAccount,
      },
    },
    {
      headers: {
        '0Card-Merchant-Id': '50929405',
        '0Card-API-Key': process.env.CHAILEASE_API_KEY,
        'Content-Type': 'application/json',
      },
    },
  )
  if (apiData.result === '000') {
    const { info_reserve: infoReserve } = apiData
    return infoReserve
  } else {
    return new Error(apiData.result_message)
  }
}

const UPDATE_MEMBER_METADATA = gql`
  mutation UPDATE_MEMBER_METADATA($memberId: String!, $metadata: jsonb) {
    update_member_by_pk(pk_columns: { id: $memberId }, _append: { metadata: $metadata }) {
      id
    }
  }
`

export default ChaileaseApplyModal
