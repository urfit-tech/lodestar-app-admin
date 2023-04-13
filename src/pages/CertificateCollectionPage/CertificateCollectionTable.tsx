import { SearchOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import { CustomRatioImage } from 'lodestar-app-element/src/components/common/Image'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import EmptyCover from '../../images/default/empty-cover.png'
import pageMessages from '../translation'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  line-height: 24px;
  letter-spacing: 0.2px;
  cursor: pointer;
`
const StyledLink = styled(Link)`
  color: ${props => props.theme['@primary-color']};
  font-size: 16px;
  letter-spacing: 0.2px;
  cursor: pointer;
`

const filterIcon = (filtered: boolean) => <SearchOutlined style={{ color: filtered ? 'var(--primary)' : undefined }} />

type CertificateColumn = {
  id: string
  title: string
  certificateTemplate: {
    id: string
    template: string
    backgroundImage: string
  }
}

const CertificateCollectionTable: React.VFC<{
  condition: hasura.GET_CERTIFICATE_PREVIEWVariables['condition']
}> = ({ condition }) => {
  const { formatMessage } = useIntl()
  const [searchName, setSearchName] = useState<string | null>(null)
  const { loading, error, certificates } = useCertificate({
    ...condition,
    title: searchName ? { _ilike: `%${searchName}%` } : undefined,
  })

  const columns: ColumnProps<CertificateColumn>[] = [
    {
      key: 'title',
      title: formatMessage(pageMessages['*'].title),
      width: '50%',
      render: (_, record) => (
        <Link
          className="d-flex align-items-center justify-content-between"
          to={`/certificates/${record.id}?tab=setting`}
        >
          <CustomRatioImage
            className="mr-4"
            width="60px"
            ratio={0.7}
            src={record.certificateTemplate.backgroundImage || EmptyCover}
          />
          <StyledTitle className="flex-grow-1">{record.title}</StyledTitle>
        </Link>
      ),
      filterDropdown: () => (
        <div className="p-2">
          <Input
            autoFocus
            value={searchName || ''}
            onChange={e => {
              searchName && setSearchName('')
              setSearchName(e.target.value)
            }}
          />
        </div>
      ),
      filterIcon,
    },
    {
      key: '',
      title: '',
      width: '30%',
      render: (_, record) => <div />,
    },
    {
      key: 'eligibilityList',
      title: '',
      width: '20%',
      render: (_, record) => (
        <StyledLink className="text-center" to={`/certificates/${record.id}?tab=eligibilityList`}>
          {formatMessage(pageMessages['*'].eligibilityList)}
        </StyledLink>
      ),
    },
  ]

  if (error) {
    return <div>{formatMessage(pageMessages['*'].fetchDataError)}</div>
  }

  return <Table<CertificateColumn> loading={loading} rowKey="id" columns={columns} dataSource={certificates} />
}

const useCertificate = (condition: hasura.GET_CERTIFICATE_PREVIEWVariables['condition']) => {
  const { loading, error, data } = useQuery<hasura.GET_CERTIFICATE_PREVIEW, hasura.GET_CERTIFICATE_PREVIEWVariables>(
    GET_CERTIFICATE_PREVIEW,
    {
      variables: {
        condition,
      },
    },
  )

  const certificates: CertificateColumn[] =
    data?.certificate.map(v => ({
      id: v.id,
      title: v.title || '',
      certificateTemplate: {
        id: v.certificate_template?.id,
        template: v.certificate_template?.template || '',
        backgroundImage: v.certificate_template?.background_image || '',
      },
    })) || []

  return {
    loading,
    error,
    certificates,
  }
}

const GET_CERTIFICATE_PREVIEW = gql`
  query GET_CERTIFICATE_PREVIEW($condition: certificate_bool_exp!) {
    certificate(where: $condition) {
      id
      title
      certificate_template {
        id
        template
        background_image
      }
    }
  }
`

export default CertificateCollectionTable
