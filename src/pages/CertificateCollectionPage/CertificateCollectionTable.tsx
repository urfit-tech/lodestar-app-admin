import { SearchOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Input, Table } from 'antd'
import { ColumnProps } from 'antd/lib/table'
import gql from 'graphql-tag'
import { CustomRatioImage } from 'lodestar-app-element/src/components/common/Image'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import hasura from '../../hasura'
import EmptyCover from '../../images/default/empty-cover.png'
import { Certificate } from '../../types/certificate'
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

type CertificateColumn = Pick<Certificate, 'id' | 'title' | 'certificateTemplate'>

const CertificateCollectionTable: React.VFC<{
  condition: hasura.GET_CERTIFICATEVariables['condition']
}> = ({ condition }) => {
  const { formatMessage } = useIntl()
  const [searchName, setSearchName] = useState<string>('')
  const { loading, error, certificates } = useCertificate(condition)

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
        <StyledLink
          className="text-center"
          to={`${process.env.PUBLIC_URL}/certificates/${record.id}?tab=eligibilityList`}
        >
          {formatMessage(pageMessages.CertificateCollectionTable.eligibilityList)}
        </StyledLink>
      ),
    },
  ]

  if (error) {
    return <div>{formatMessage(pageMessages['*'].fetchDataError)}</div>
  }

  return <Table<CertificateColumn> loading={loading} rowKey="id" columns={columns} dataSource={certificates} />
}

const useCertificate = (condition: hasura.GET_CERTIFICATEVariables['condition']) => {
  const { loading, error, data } = useQuery<hasura.GET_CERTIFICATE, hasura.GET_CERTIFICATEVariables>(GET_CERTIFICATE, {
    variables: {
      condition,
    },
  })

  const certificates: Certificate[] =
    data?.certificate.map(v => ({
      id: v.id,
      title: v.title,
      description: v.description,
      qualification: v.qualification,
      periodType: v.period_type as 'D' | 'W' | 'M' | 'Y',
      periodAmount: v.period_amount,
      author: {
        id: v.certificate_template?.author?.id || '',
        name: v.certificate_template?.author?.name || '',
      },
      certificateTemplate: {
        id: v.certificate_template?.id,
        title: v.certificate_template?.title || '',
        template: v.certificate_template?.template || '',
        backgroundImage: v.certificate_template?.background_image || '',
        author: {
          id: v.certificate_template?.author?.id || '',
          name: v.certificate_template?.author?.name || '',
        },
      },
    })) || []

  return {
    loading,
    error,
    certificates,
  }
}

const GET_CERTIFICATE = gql`
  query GET_CERTIFICATE($condition: certificate_bool_exp!) {
    certificate(where: $condition) {
      id
      title
      description
      qualification
      period_type
      period_amount
      author {
        id
        name
      }
      certificate_template {
        id
        title
        template
        background_image
        author {
          id
          name
        }
      }
    }
  }
`

export default CertificateCollectionTable
