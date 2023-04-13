import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { v4 as uuid } from 'uuid'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import { MemberShopProps } from '../../types/merchandise'
import ImageInput from '../form/ImageInput'

const messages = defineMessages({
  memberShopCover: { id: 'merchandise.text.memberShopCover', defaultMessage: '商店封面' },
})

type FieldProps = {
  title: string
}

const MemberShopBasicForm: React.FC<{
  memberShop: MemberShopProps
  onRefetch?: () => void
}> = ({ memberShop, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const { id: appId } = useApp()
  const [updateMemberShopTitle] = useMutation<
    hasura.UPDATE_MEMBER_SHOP_TITLE,
    hasura.UPDATE_MEMBER_SHOP_TITLEVariables
  >(UPDATE_MEMBER_SHOP_TITLE)
  const [updateMembersShopCover] = useMutation<
    hasura.UPDATE_MEMBER_SHOP_COVER,
    hasura.UPDATE_MEMBER_SHOP_COVERVariables
  >(UPDATE_MEMBER_SHOP_COVER)
  const [loading, setLoading] = useState(false)
  const coverId = uuid()

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateMemberShopTitle({
      variables: {
        memberShopId: memberShop.id,
        title: values.title || '',
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullyUpload))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  const handleUpload = () => {
    setLoading(true)
    updateMembersShopCover({
      variables: {
        memberShopId: memberShop.id,
        coverUrl: `https://${process.env.REACT_APP_S3_BUCKET}/member_shop_covers/${appId}/${memberShop.id}/${coverId}/400`,
      },
    })
      .then(() => {
        message.success(formatMessage(commonMessages.event.successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
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
      initialValues={{ title: memberShop.title }}
    >
      <Form.Item
        label={formatMessage(merchandiseMessages.label.shopTitle)}
        name="title"
        rules={[
          {
            required: true,
            message: formatMessage(errorMessages.form.isRequired, {
              field: formatMessage(commonMessages.label.title),
            }),
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label={<span>{formatMessage(messages.memberShopCover)}</span>}>
        <ImageInput
          path={`member_shop_covers/${appId}/${memberShop.id}/${coverId}`}
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
        <Button type="primary" htmlType="submit" loading={loading}>
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
