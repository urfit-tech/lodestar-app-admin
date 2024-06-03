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
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import MembershipCardBasicForm from './MembershipCardBasicForm'
import MembershipcardTemplateForm from './MembershipcardTemplateForm'

const MembershipCardAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { membershipCardId } = useParams<{ membershipCardId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { loading, error, data: membershipCard, refetch } = useMembershipCard(membershipCardId)

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
          <AdminHeaderTitle>{membershipCard?.title}</AdminHeaderTitle>
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
                  <MembershipCardBasicForm membershipCard={membershipCard} onRefetch={refetch} />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(pageMessages.CertificateAdminPage.certificateIntro)}</AdminBlockTitle>
                  <MembershipcardTemplateForm membershipCard={membershipCard} onRefetch={refetch} />
                </AdminBlock>
                <MetaProductDeletionBlock
                  metaProductType="Certificate"
                  targetId={membershipCardId}
                  renderDeleteDangerText={formatMessage(pageMessages.CertificateAdminPage.deleteCertificateDangerText)}
                />
              </div>
            </Tabs.TabPane>

            <Tabs.TabPane key="eligibilityList" tab={formatMessage(pageMessages['*'].eligibilityList)}>
              <div className="container py-5">
                <AdminPaneTitle>{formatMessage(pageMessages['*'].eligibilityList)}</AdminPaneTitle>
                {/* <CertificateEligibilityListBlock certificateId={membershipCardId} /> */}
              </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </StyledLayoutContent>
      {/* {membershipCard && (
        <CertificatePreviewModal visible={visible} onCancel={() => setVisible(false)} certificate={certificate} />
      )} */}
    </>
  )
}
export default MembershipCardAdminPage

const GetMemberShipCard = gql`
  query GetMemberShipCard($membershipCardId: uuid!) {
    card(where: { id: { _eq: $membershipCardId } }) {
      relative_period_type
      relative_period_amount
      app_id
      creator_id
      description
      sku
      template
      title
      fixed_end_date
      fixed_start_date
      id
      expiry_type
    }
  }
`

const useMembershipCard = (membershipCardId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GetMemberShipCard, hasura.GetMemberShipCardVariables>(
    GetMemberShipCard,
    {
      variables: {
        membershipCardId,
      },
      skip: !membershipCardId,
    },
  )
  const rawData = data?.card[0] ? data.card[0] : null

  const membershipCard = rawData
    ? {
        id: rawData.id,
        relativePeriodAmount: rawData.relative_period_amount ? rawData.relative_period_amount : null,
        relativePeriodType: rawData.relative_period_type,
        appId: rawData.app_id,
        description: rawData.description || '',
        template: rawData.template || '',
        fixedStartDate: rawData.fixed_start_date,
        fixedEndDate: rawData.fixed_end_date,
        expiryType: rawData.expiry_type,
        title: rawData.title,
      }
    : null

  return { loading, error, data: membershipCard, refetch }
}
