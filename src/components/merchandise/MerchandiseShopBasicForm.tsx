import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberShopProps } from '../../types/merchandise'

type MerchandiseShopBasicFormProps = FormComponentProps & {
  memberShop: MemberShopProps
  refetch?: () => void
}
const MerchandiseShopBasicForm: React.FC<MerchandiseShopBasicFormProps> = ({ memberShop, refetch, form }) => {
  const { formatMessage } = useIntl()

  const [updateMemberShopName] = useMutation<types.UPDATE_MEMBER_SHOP_NAME, types.UPDATE_MEMBER_SHOP_NAMEVariables>(
    UPDATE_MEMBER_SHOP_NAME,
  )
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((error, values) => {
      if (error) {
        return
      }

      setLoading(true)
      updateMemberShopName({
        variables: {
          memberShopId: memberShop.id,
          name: values.name,
        },
      })
        .then(() => {
          refetch && refetch()
          message.success(formatMessage(commonMessages.event.successfullySaved))
        })
        .finally(() => setLoading(false))
    })
  }

  return (
    <Form
      labelCol={{ span: 24, md: { span: 4 } }}
      wrapperCol={{ span: 24, md: { span: 8 } }}
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item label={formatMessage(merchandiseMessages.label.shopName)}>
        {form.getFieldDecorator('name', {
          initialValue: memberShop.name,
          rules: [{ required: true }],
        })(<Input />)}
      </Form.Item>

      <div>
        <Button className="mr-2" onClick={() => form.resetFields()}>
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" loading={loading} htmlType="submit">
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </div>
    </Form>
  )
}

const UPDATE_MEMBER_SHOP_NAME = gql`
  mutation UPDATE_MEMBER_SHOP_NAME($memberShopId: uuid!, $name: String!) {
    update_member_shop(where: { id: { _eq: $memberShopId } }, _set: { name: $name }) {
      affected_rows
    }
  }
`

export default Form.create<MerchandiseShopBasicFormProps>()(MerchandiseShopBasicForm)
