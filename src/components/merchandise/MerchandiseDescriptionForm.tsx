import { useMutation } from '@apollo/react-hooks'
import { Button, Form, message } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import types from '../../types'
import { MerchandiseProps } from '../../types/merchandise'
import AdminBraftEditor from '../form/AdminBraftEditor'

const MerchandiseDescriptionForm: React.FC<{
  merchandise: MerchandiseProps
  merchandiseId: string
  onRefetch?: () => void
}> = ({ merchandise, merchandiseId, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm()
  const [updateMerchandiseDescription] = useMutation<
    types.UPDATE_MERCHANDISE_DESCRIPTION,
    types.UPDATE_MERCHANDISE_DESCRIPTIONVariables
  >(UPDATE_MERCHANDISE_DESCRIPTION)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (values: any) => {
    setLoading(true)
    updateMerchandiseDescription({
      variables: {
        merchandiseId,
        description: values.description.toRAW(),
      },
    })
      .then(() => {
        onRefetch && onRefetch()
        message.success(formatMessage(commonMessages.event.successfullySaved))
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <Form
      form={form}
      colon={false}
      hideRequiredMark
      initialValues={{
        description: BraftEditor.createEditorState(merchandise.description),
      }}
      onFinish={handleSubmit}
    >
      <Form.Item name="description">
        <AdminBraftEditor />
      </Form.Item>

      <Form.Item>
        <Button onClick={() => form.resetFields()} className="mr-2">
          {formatMessage(commonMessages.ui.cancel)}
        </Button>
        <Button type="primary" htmlType="submit" loading={loading}>
          {formatMessage(commonMessages.ui.save)}
        </Button>
      </Form.Item>
    </Form>
  )
}

const UPDATE_MERCHANDISE_DESCRIPTION = gql`
  mutation UPDATE_MERCHANDISE_DESCRIPTION($merchandiseId: uuid!, $description: String) {
    update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { description: $description }) {
      affected_rows
    }
  }
`

export default MerchandiseDescriptionForm
