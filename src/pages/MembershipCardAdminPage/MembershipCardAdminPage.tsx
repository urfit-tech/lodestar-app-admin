import { ArrowLeftOutlined } from '@ant-design/icons'
import { gql, useQuery } from '@apollo/client'
import { Spinner } from '@chakra-ui/react'
import { Button, Tabs } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
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
import MemberShipCardDiscountBlock from '../../components/membershipCard/MemberShipCardDiscountBlock'
import hasura from '../../hasura'
import { MembershipCard } from '../../types/membershipCard'
import LoadingPage from '../LoadingPage'
import pageMessages from '../translation'
import MembershipCardBasicForm from './MembershipCardBasicForm'
import MembershipCardTemplateForm from './MembershipCardTemplateBlock'
import MembershipCardAdminPageMessages from './translation'

const MembershipCardAdminPage: React.VFC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { membershipCardId } = useParams<{ membershipCardId: string }>()
  const [activeKey, setActiveKey] = useQueryParam('tab', StringParam)
  const { loading, error, data: membershipCard, refetch } = useMembershipCard(membershipCardId)

  if (Object.keys(enabledModules).length === 0 || loading) {
    return <LoadingPage />
  }

  return (
    <>
      <AdminHeader>
        <Link to="/membership-card">
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
            <Tabs.TabPane
              key="setting"
              tab={formatMessage(MembershipCardAdminPageMessages.adminPage.membershipCardSetting)}
            >
              <div className="container py-5">
                <AdminPaneTitle className="d-flex align-items-center justify-content-between">
                  {formatMessage(MembershipCardAdminPageMessages.adminPage.membershipCardSetting)}
                </AdminPaneTitle>
                <AdminBlock>
                  <AdminBlockTitle>{formatMessage(pageMessages['*'].basicSettings)}</AdminBlockTitle>
                  <MembershipCardBasicForm membershipCard={membershipCard} onRefetch={refetch} />
                </AdminBlock>
                <AdminBlock>
                  <AdminBlockTitle>
                    {formatMessage(MembershipCardAdminPageMessages.adminPage.membershipCardIntro)}
                  </AdminBlockTitle>
                  <MembershipCardTemplateForm membershipCard={membershipCard} onRefetch={refetch} />
                </AdminBlock>
                <MetaProductDeletionBlock metaProductType="MembershipCard" targetId={membershipCardId} />
              </div>
            </Tabs.TabPane>
            <Tabs.TabPane tab={formatMessage(MembershipCardAdminPageMessages.adminPage.discountSetting)}>
              <div className="container py-5">
                <MemberShipCardDiscountBlock membershipCardId={membershipCardId} />
              </div>
            </Tabs.TabPane>
          </Tabs>
        )}
      </StyledLayoutContent>
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

  const rawData = data?.card[0] || null

  const membershipCard: MembershipCard | null = rawData
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
        sku: rawData.sku || '',
      }
    : null

  return { loading, error, data: membershipCard, refetch }
}
