import { ArrowLeftOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Spinner } from '@chakra-ui/react'
import { Button, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { Link, useParams } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import {
  AdminBlock,
  AdminBlockTitle,
  AdminHeader,
  AdminHeaderTitle,
  AdminPaneTitle,
  AdminTabBarWrapper,
} from '../../components/admin'
import MetaProductDeletionBlock from '../../components/common/MetaProductDeletionBlock'
import { StyledLayoutContent } from '../../components/layout/DefaultLayout'
import hasura from '../../hasura'
import { Certificate } from '../../types/certificate'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import CertificateBasicForm from './CertificateBasicForm'
import CertificateEligibilityListBlock from './CertificateEligibilityListBlock'
import CertificateIntroForm from './CertificateIntroForm'
import CertificatePreviewModal from './CertificatePreviewModal'
import CertificatePublishAdminBlock from './CertificatePublishAdminBlock'

const CertificateAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { certificateId } = useParams<{ certificateId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { loading, error, certificate, refetch } = useCertificate(certificateId)
  const [visible, setVisible] = useState(false)

  if (Object.keys(enabledModules).length === 0 || loading) {
    return <LoadingPage />
  }

  return (
    <>
      <AdminHeader>
        <Link to="/certificates">
          <Button type="link" className="mr-3">
            <ArrowLeftOutlined />
          </Button>
        </Link>

        {loading ? (
          <>
            <Spinner />
            <span className="flex-grow-1" />
          </>
        ) : (
          <AdminHeaderTitle>{certificate?.title}</AdminHeaderTitle>
        )}
        <Button className="mr-2" onClick={() => setVisible(true)}>
          {formatMessage(pageMessages.CertificateAdminPage.preview)}
        </Button>
      </AdminHeader>

      <StyledLayoutContent variant="gray">
        {!loading && error ? (
          <div className="d-flex justify-content-center align-items-center" style={{ height: '80%' }}>
            {formatMessage(pageMessages['*'].fetchDataError)}
          </div>
        ) : (
          <Tabs
            activeKey={activeKey || 'setting'}
            onChange={key => setActiveKey(key)}
            renderTabBar={(props, DefaultTabBar) => (
              <AdminTabBarWrapper>
                <DefaultTabBar {...props} className="mb-0" />
              </AdminTabBarWrapper>
            )}
          >
            <Tabs.TabPane key="setting" tab={formatMessage(pageMessages['*'].certificateSetting)}>
              <div className="container py-5">
                <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                  {formatMessage(pageMessages['*'].certificateSetting)}
                </AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(pageMessages['*'].basicSettings)}</AdminBlockTitle>
                  <CertificateBasicForm certificate={certificate} onRefetch={refetch} />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(pageMessages.CertificateAdminPage.certificateIntro)}</AdminBlockTitle>
                  <CertificateIntroForm certificate={certificate} onRefetch={refetch} />
                </AdminBlock>
                <MetaProductDeletionBlock
                  metaProductType="Certificate"
                  targetId={certificateId}
                  renderDeleteDangerText={formatMessage(pageMessages.CertificateAdminPage.deleteCertificateDangerText)}
                />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="eligibilityList" tab={formatMessage(pageMessages['*'].eligibilityList)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(pageMessages['*'].eligibilityList)}</AdminPaneTitle>
                <CertificateEligibilityListBlock certificateId={certificateId} />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="publish" tab={formatMessage(pageMessages['*'].publishSettings)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(pageMessages['*'].publishSettings)}</AdminPaneTitle>
                <AdminBlock>
                  <CertificatePublishAdminBlock certificate={certificate} onRefetch={refetch} />
                </AdminBlock>
              </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </StyledLayoutContent>
      {certificate && (
        <CertificatePreviewModal visible={visible} onCancel={() => setVisible(false)} certificate={certificate} />
      )}
    </>
  )
}
export default CertificateAdminPage

const useCertificate = (certificateId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_CERTIFICATE>(
    gql`
      query GET_CERTIFICATE($certificateId: uuid!) {
        certificate_by_pk(id: $certificateId) {
          id
          title
          description
          qualification
          code
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
          published_at
        }
      }
    `,
    {
      variables: {
        certificateId,
      },
    },
  )

  const certificate: Certificate | null = data?.certificate_by_pk
    ? {
        id: data?.certificate_by_pk?.id,
        title: data?.certificate_by_pk?.title || '',
        description: data?.certificate_by_pk?.description || '',
        qualification: data?.certificate_by_pk?.qualification || null,
        code: data?.certificate_by_pk?.code || null,
        periodType: data?.certificate_by_pk?.period_type as 'D' | 'W' | 'M' | 'Y',
        periodAmount: data?.certificate_by_pk?.period_amount,
        author: {
          id: data?.certificate_by_pk?.certificate_template?.author?.id || '',
          name: data?.certificate_by_pk?.certificate_template?.author?.name || '',
        },
        certificateTemplate: {
          id: data?.certificate_by_pk?.certificate_template?.id,
          title: data?.certificate_by_pk?.certificate_template?.title || '',
          template: data?.certificate_by_pk?.certificate_template?.template || '',
          backgroundImage: data?.certificate_by_pk?.certificate_template?.background_image || '',
          author: {
            id: data?.certificate_by_pk?.certificate_template?.author?.id || '',
            name: data?.certificate_by_pk?.certificate_template?.author?.name || '',
          },
        },
        publishedAt: data?.certificate_by_pk?.published_at ? new Date(data.certificate_by_pk.published_at) : null,
      }
    : null

  return {
    loading,
    error,
    certificate,
    refetch,
  }
}

export { useCertificate }
