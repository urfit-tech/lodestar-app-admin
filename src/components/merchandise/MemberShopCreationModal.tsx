import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { FileAddOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Input } from 'antd'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { commonMessages, errorMessages, merchandiseMessages } from '../../helpers/translation'
import AdminModal from '../admin/AdminModal'
import ContentCreatorSelector from '../form/ContentCreatorSelector'

const MemberShopCreationModal: React.FC<FormComponentProps> = ({ form }) => {
  const { formatMessage } = useIntl()
  const { permissions, currentMemberId } = useAuth()
  const history = useHistory()
  const [insertMemberShop] = useMutation<hasura.INSERT_MEMBER_SHOP, hasura.INSERT_MEMBER_SHOPVariables>(
    INSERT_MEMBER_SHOP,
  )
  const [loading, setLoading] = useState(false)

  return (
    <AdminModal
      renderTrigger={({ setVisible }) => (
        <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
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
              memberId: values?.creatorId || currentMemberId,
              title: values.title || '',
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
      <Form layout="vertical" hideRequiredMark colon={false}>
        {permissions.MERCHANDISE_ADMIN ? (
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
            })(<ContentCreatorSelector />)}
          </Form.Item>
        ) : null}

        <Form.Item label={formatMessage(merchandiseMessages.label.memberShopTitle)}>
          {form.getFieldDecorator('title', {
            rules: [
              {
                required: true,
                message: formatMessage(errorMessages.form.isRequired, {
                  field: formatMessage(commonMessages.label.title),
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
