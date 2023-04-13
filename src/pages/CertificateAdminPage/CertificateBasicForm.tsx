import { gql, useMutation } from '@apollo/client'
import { Button, Form, Input, message, Radio, Select, Skeleton } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import { handleError } from '../../helpers'
import { Certificate } from '../../types/certificate'
import pageMessages from '../translation'
import CertificateTemplateSelector from './CertificateTemplateSelector'

type FieldProps = Pick<Certificate, 'id' | 'title' | 'qualification' | 'periodType' | 'periodAmount'> & {
  certificateTemplate: string
}

const CertificateBasicForm: React.FC<{
  certificate: Certificate | null
  onRefetch?: () => void
}> = ({ certificate, onRefetch }) => {
  const { formatMessage } = useIntl()
  const [form] = useForm<FieldProps>()
  const [updateCertificateBasic] = useMutation<
    hasura.UPDATE_CERTIFICATE_BASIC,
    hasura.UPDATE_CERTIFICATE_BASICVariables
  >(UPDATE_CERTIFICATE_BASIC)
  const [loading, setLoading] = useState(false)

  if (!certificate) {
    return <Skeleton active />
  }

  const handleSubmit = (values: FieldProps) => {
    setLoading(true)
    updateCertificateBasic({
      variables: {
        certificateId: certificate.id,
        title: values.title || '',
        certificateTemplateId: values.certificateTemplate,
        qualification: values.qualification,
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
    <Form
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{ md: { span: 4 } }}
      wrapperCol={{ md: { span: 8 } }}
      initialValues={{
        title: certificate.title || '',
        certificateTemplate: certificate.certificateTemplate.id,
        qualification: certificate.qualification,
      }}
      onFinish={handleSubmit}
    >
      <Form.Item label={formatMessage(pageMessages.CertificateBasicForm.certificateTitle)} name="title">
        <Input />
      </Form.Item>
      <Form.Item
        label={formatMessage(pageMessages.CertificateBasicForm.certificateTemplate)}
        name="certificateTemplate"
        rules={[
          {
            validator: (_: any, value: string) => {
              if (value) {
                return Promise.resolve()
              }
              return Promise.reject(
                new Error(formatMessage(pageMessages.CertificateBasicForm.certificateTemplateIsRequired)),
              )
            },
          },
        ]}
      >
        <CertificateTemplateSelector certificateTemplateId={certificate.certificateTemplate.id} />
      </Form.Item>
      <Form.Item label={formatMessage(pageMessages.CertificateBasicForm.qualification)} name="qualification">
        <Input />
      </Form.Item>

      {/* 
      //TODO: temporarily display none  
      */}
      <Form.Item
        className="d-none"
        label={formatMessage(pageMessages.CertificateBasicForm.expirationDate)}
        name="expirationDate"
      >
        <>
          <Radio.Group className="mb-2">
            <Radio value={false}>{formatMessage(pageMessages['*'].noExpirationDate)}</Radio>
            <Radio value={true}>{formatMessage(pageMessages['*'].hasExpirationDate)}</Radio>
          </Radio.Group>

          <Input.Group compact>
            <Input className="mr-2" key="periodAmount" style={{ width: '50%' }} />
            <Select key="periodType">
              <Select.Option value="D">{formatMessage(pageMessages['*'].year)}</Select.Option>
              <Select.Option value="W">{formatMessage(pageMessages['*'].week)}</Select.Option>
              <Select.Option value="M">{formatMessage(pageMessages['*'].month)}</Select.Option>
              <Select.Option value="Y">{formatMessage(pageMessages['*'].hour)}</Select.Option>
            </Select>
          </Input.Group>
        </>
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
  )
}

const UPDATE_CERTIFICATE_BASIC = gql`
  mutation UPDATE_CERTIFICATE_BASIC(
    $certificateId: uuid!
    $title: String
    $certificateTemplateId: uuid!
    $qualification: String
  ) {
    update_certificate(
      where: { id: { _eq: $certificateId } }
      _set: { title: $title, certificate_template_id: $certificateTemplateId, qualification: $qualification }
    ) {
      affected_rows
    }
  }
`

export default CertificateBasicForm
