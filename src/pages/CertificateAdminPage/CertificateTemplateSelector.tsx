import { gql, useQuery } from '@apollo/client'
import Select, { SelectProps } from 'antd/lib/select'
import React from 'react'
import { useIntl } from 'react-intl'
import hasura from '../../hasura'
import pageMessages from '../translation'

const CertificateTemplateSelector: React.FC<{ certificateTemplateId: string } & SelectProps<string | string[]>> = ({
  certificateTemplateId,
  ...selectProps
}) => {
  const { formatMessage } = useIntl()
  const { loading, certificateTemplates } = useCertificateTemplate()

  return (
    <Select<string | string[]>
      loading={loading}
      style={{ width: '100%' }}
      allowClear
      showSearch
      placeholder={formatMessage(pageMessages.CertificateSelector.selectTemplate)}
      defaultValue={certificateTemplateId ? certificateTemplateId : undefined}
      filterOption={(input, option) =>
        option?.props.children
          ? (option?.props.children as string).toLowerCase().indexOf(input.toLowerCase()) >= 0
          : true
      }
      {...selectProps}
    >
      {certificateTemplates.map(certificateTemplate => (
        <Select.Option key={certificateTemplate.id} value={certificateTemplate.id} title={certificateTemplate.title}>
          {certificateTemplate.title}
        </Select.Option>
      ))}
    </Select>
  )
}

const useCertificateTemplate = () => {
  const { data, loading, error } = useQuery<hasura.GET_CERTIFICATE_TEMPLATE>(
    gql`
      query GET_CERTIFICATE_TEMPLATE {
        certificate_template {
          id
          title
          background_image
        }
      }
    `,
  )

  const certificateTemplates: { id: string; title: string; backgroundImage: string }[] =
    data?.certificate_template.map(v => ({
      id: v.id,
      title: v.title || '',
      backgroundImage: v.background_image,
    })) || []

  return {
    loading,
    certificateTemplates,
    error,
  }
}

export default CertificateTemplateSelector
