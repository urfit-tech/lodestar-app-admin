import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { commonMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberShopProps } from '../../types/merchandise'

type MemberShopBasicFormProps = FormComponentProps & {
  memberShop: MemberShopProps
  refetch?: () => void
}
const MemberShopBasicForm: React.FC<MemberShopBasicFormProps> = ({ memberShop, refetch, form }) => {
  const { formatMessage } = useIntl()

  const [updateMemberShopName] = useMutation<types.UPDATE_MEMBER_SHOP_TITLE, types.UPDATE_MEMBER_SHOP_TITLEVariables>(
    UPDATE_MEMBER_SHOP_TITLE,
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
          title: values.title,
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
      <Form.Item label={formatMessage(merchandiseMessages.label.shopTitle)}>
        {form.getFieldDecorator('title', {
          initialValue: memberShop.title,
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

const UPDATE_MEMBER_SHOP_TITLE = gql`
  mutation UPDATE_MEMBER_SHOP_TITLE($memberShopId: uuid!, $title: String!) {
    update_member_shop(where: { id: { _eq: $memberShopId } }, _set: { title: $title }) {
      affected_rows
    }
  }
`

export default Form.create<MemberShopBasicFormProps>()(MemberShopBasicForm)
