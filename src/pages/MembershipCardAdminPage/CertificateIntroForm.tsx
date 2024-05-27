import { gql, useMutation } from '@apollo/client'
import { Button, Form, message, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import BraftEditor, { EditorState } from 'braft-editor'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import AdminBraftEditor from '../../components/form/AdminBraftEditor'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { Certificate } from '../../types/certificate'
import pageMessages from '../translation'

type FieldProps = {
  description: EditorState
}

const CertificateIntroForm: React.FC<{
  certificate: Pick<Certificate, 'id' | 'description'> | null
  onRefetch?: () => void
}> = ({ certificate, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [loading, setLoading] = useState(false)
  const [updateCertificateDescription] = useMutation<
    hasura.UPDATE_CERTIFICATE_DESCRIPTION,
    hasura.UPDATE_CERTIFICATE_DESCRIPTIONVariables
  >(UPDATE_CERTIFICATE_DESCRIPTION)

  if (!certificate) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateCertificateDescription({
      variables: {
        description: values.description?.getCurrentContent().hasText() ? values.description.toRAW() : null,
        certificateId: certificate.id,
      },
    })
      .then(() => {
        message.success(formatMessage(pageMessages['*'].successfullySaved))
        onRefetch?.()
      })
      .catch(handleError)
      .finally(() => setLoading(false))
  }

  return (
    <>
      <Form
        form={form}
        colon={false}
        labelAlign="left"
        labelCol={{ md: { span: 4 } }}
        wrapperCol={{ md: { span: 10 } }}
        initialValues={{
          description: BraftEditor.createEditorState(certificate.description),
        }}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="description"
          label={formatMessage(pageMessages.CertificateIntroForm.certificateDescription)}
          wrapperCol={{ md: { span: 20 } }}
        >
          <AdminBraftEditor />
        </Form.Item>

        <Form.Item wrapperCol={{ md: { offset: 4 } }}>
          <Button className="mr-2" onClick={() => form.resetFields()}>
            {formatMessage(pageMessages['*'].cancel)}
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {formatMessage(pageMessages['*'].save)}
          </Button>
        </Form.Item>
      </Form>
    </>
  )
}

const UPDATE_CERTIFICATE_DESCRIPTION = gql`
  mutation UPDATE_CERTIFICATE_DESCRIPTION($description: String, $certificateId: uuid!) {
    update_certificate(_set: { description: $description }, where: { id: { _eq: $certificateId } }) {
      affected_rows
    }
  }
`

export default CertificateIntroForm
