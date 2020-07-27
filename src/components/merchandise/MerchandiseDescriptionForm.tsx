import { Form } from '@ant-design/compatible'
import '@ant-design/compatible/assets/index.css'
import { FormComponentProps } from '@ant-design/compatible/lib/form'
import { useMutation } from '@apollo/react-hooks'
import { Button, message } from 'antd'
import BraftEditor from 'braft-editor'
import gql from 'graphql-tag'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { handleError } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import { MerchandiseProps } from '../../types/merchandise'
import AdminBraftEditor from '../admin/AdminBraftEditor'

type MerchandiseDescriptionFormProps = FormComponentProps & {
  merchandise: MerchandiseProps
  merchandiseId: string
  refetch?: () => void
}
const MerchandiseDescriptionForm: React.FC<MerchandiseDescriptionFormProps> = ({
  form,
  merchandise,
  merchandiseId,
  refetch,
}) => {
  const { formatMessage } = useIntl()
  const updateMerchandiseDescription = useUpdateMerchandiseDescription(merchandiseId)
  const [loading, setLoading] = useState(false)

  const handleSubmit = () => {
    form.validateFields((errors, values) => {
      if (errors) {
        return
      }

      setLoading(true)
      updateMerchandiseDescription({
        description: values.description.toRAW(),
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
      hideRequiredMark
      onSubmit={e => {
        e.preventDefault()
        handleSubmit()
      }}
    >
      <Form.Item>
        {form.getFieldDecorator('description', {
          initialValue: BraftEditor.createEditorState(merchandise.description),
        })(<AdminBraftEditor />)}
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

const useUpdateMerchandiseDescription = (merchandiseId: string) => {
  const [updateDescription] = useMutation(gql`
    mutation UPDATE_MERCHANDISE_DESCRIPTION($merchandiseId: uuid!, $description: String) {
      update_merchandise(where: { id: { _eq: $merchandiseId } }, _set: { description: $description }) {
        affected_rows
      }
    }
  `)

  const updateMerchandiseDescription: (data: { description: string }) => Promise<void> = async ({ description }) => {
    try {
      await updateDescription({
        variables: {
          merchandiseId,
          description,
        },
      })
    } catch (error) {
      handleError(error)
    }
  }

  return updateMerchandiseDescription
}

export default Form.create<MerchandiseDescriptionFormProps>()(MerchandiseDescriptionForm)
