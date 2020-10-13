import '@ant-design/compatible/assets/index.css'
import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import gql from 'graphql-tag'
import React, { useContext, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import AppContext from '../../contexts/AppContext'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import { MemberShopProps } from '../../types/merchandise'
import ImageInput from '../form/ImageInput'

const messages = defineMessages({
  memberShopCover: { id: 'merchandise.text.memberShopCover', defaultMessage: '商城封面' },
})

type MemberShopBasicFormProps = {
  memberShop: MemberShopProps
  refetch?: () => void
}
const MemberShopBasicForm: React.FC<MemberShopBasicFormProps> = ({ memberShop, refetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const { id: appId } = useContext(AppContext)

  const [updateMemberShopTitle] = useMutation<types.UPDATE_MEMBER_SHOP_TITLE, types.UPDATE_MEMBER_SHOP_TITLEVariables>(
    UPDATE_MEMBER_SHOP_TITLE,
  )
  const [updateMembersShopCover] = useMutation<types.UPDATE_MEMBER_SHOP_COVER, types.UPDATE_MEMBER_SHOP_COVERVariables>(
    UPDATE_MEMBER_SHOP_COVER,
  )

  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateMemberShopTitle({
      variables: {
        memberShopId: memberShop.id,
        title: values.title,
      },
    })
      .then(() => {
        refetch && refetch()
        message.success(formatMessage(commonMessages.event.successfullyUpload))
      })
      .finally(() => setLoading(false))
  }

  const handleUpload = () => {
    updateMembersShopCover({
      variables: {
        memberShopId: memberShop.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/member_shop_covers/${appId}/${
          memberShop.id
        }?t=${Date.now()}`,
      },
    }).then(() => {
      refetch && refetch()
      message.success(formatMessage(commonMessages.event.successfullySaved))
    })
  }

  return (
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      hideRequiredMark
      onFinish={values => handleSubmit(values)}
      initialValues={{ title: memberShop.title, memberShopCover: memberShop.coverUrl }}
    >
      <Form.Item
        label={formatMessage(merchandiseMessages.label.shopTitle)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.term.title),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={<span>{formatMessage(messages.memberShopCover)}</span>}>
        <ImageInput
          path={`member_shop_covers/${appId}/${memberShop.id}`}
          image={{
            width: '160px',
            ratio: 9 / 16,
            shape: 'rounded',
          }}
          value={memberShop.coverUrl}
          onChange={() => handleUpload()}
        />
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
  mutation UPDATE_MEMBER_SHOP_TITLE($memberShopId: uuid!, $title: String) {
    update_member_shop(where: { id: { _eq: $memberShopId } }, _set: { title: $title }) {
      affected_rows
    }
  }
`

const UPDATE_MEMBER_SHOP_COVER = gql`
  mutation UPDATE_MEMBER_SHOP_COVER($memberShopId: uuid!, $coverUrl: String) {
    update_member_shop(where: { id: { _eq: $memberShopId } }, _set: { cover_url: $coverUrl }) {
      affected_rows
    }
  }
`

export default MemberShopBasicForm
