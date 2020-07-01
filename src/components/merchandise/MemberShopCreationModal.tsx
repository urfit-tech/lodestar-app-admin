import { useMutation } from '@apollo/react-hooks'
import { Button, Form, Input } from 'antd'
import { FormComponentProps } from 'antd/lib/form'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import useRouter from 'use-react-router'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import types from '../../types'
import AdminModal from '../admin/AdminModal'
import CreatorSelector from '../common/CreatorSelector'

const MemberShopCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { history } = useRouter()
  const [insertMemberShop] = useMutation<types.INSERT_MEMBER_SHOP, types.INSERT_MEMBER_SHOPVariables>(
    INSERT_MEMBER_SHOP,
  )
  const [loading, setLoading] = useState(false)

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon="file-add" onClick={() => setVisible(true)}>
          {formatMessage(merchandiseMessages.ui.createMemberShop)}
        </Button>
      )}
      title={formatMessage(merchandiseMessages.ui.createMemberShop)}
      okText={formatMessage(commonMessages.ui.create)}
      cancelText={formatMessage(commonMessages.ui.cancel)}
      okButtonProps={{ loading }}
      onOk={() => {
        form.validateFields((errors, values) => {
          if (errors) {
            return
          }
          setLoading(true)
          insertMemberShop({
            variables: {
              memberId: values.creatorId,
              title: values.title,
            },
          })
            .then(
              ({ data }) =>
                data?.insert_member_shop?.returning[0]?.id &&
                history.push(`/member-shops/${data.insert_member_shop.returning[0].id}`),
            )
            .catch(handleError)
            .finally(() => setLoading(false))
        })
      }}
    >
      <Form hideRequiredMark colon={false}>
        <Form.Item label={formatMessage(merchandiseMessages.label.selectContentCreator)}>
          {form.getFieldDecorator('creatorId', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(merchandiseMessages.label.selectContentCreator),
                }),
              },
            ],
          })(<CreatorSelector />)}
        </Form.Item>
        <Form.Item label={formatMessage(merchandiseMessages.label.memberShopTitle)}>
          {form.getFieldDecorator('title', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.term.title),
                }),
              },
            ],
          })(<Input />)}
        </Form.Item>
      </Form>
    </AdminModal>
  )
}

const INSERT_MEMBER_SHOP = gql`
  mutation INSERT_MEMBER_SHOP($memberId: String!, $title: String!) {
    insert_member_shop(objects: { member_id: $memberId, title: $title }) {
      returning {
        id
      }
    }
  }
`

export default Form.create<FormComponentProps>()(MemberShopCreationModal)
