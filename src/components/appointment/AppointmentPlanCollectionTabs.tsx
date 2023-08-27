import { useQuery } from '@apollo/client'
import { Skeleton, Tabs } from 'antd'
import { gql } from '@apollo/client'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React from 'react'
import { useIntl } from 'react-intl'
import { AdminPageBlock } from '../../components/admin'
import hasura from '../../hasura'
import { commonMessages } from '../../helpers/translation'
import AppointmentPlanCollectionTable from './AppointmentPlanCollectionTable'

const AppointmentPlanCollectionTabs: React.VFC<{
  creatorId?: string
}> = ({ creatorId }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { loading, counts } = useAppointmentPlansCounts(creatorId)

  if (loading) {
    return <Skeleton active />
  }

  const tabContents: {
    key: string
    tab: string
    condition: hasura.GET_APPOINTMENT_PLAN_COLLECTION_ADMINVariables['condition']
    withAppointmentButton?: Boolean
    permissionIsAllowed: boolean
  }[] = [
    {
      key: 'published',
      tab: formatMessage(commonMessages.status.published),
      condition: {
        published_at: { _is_null: false },
        is_private: { _eq: false },
        creator_id: { _eq: creatorId },
      },
      withAppointmentButton: true,
      permissionIsAllowed: true,
    },
    {
      key: 'privatelyPublished',
      tab: formatMessage(commonMessages.status.privatelyPublish),
      condition: {
        published_at: { _is_null: false },
        is_private: { _eq: true },
        creator_id: { _eq: creatorId },
      },
      withAppointmentButton: true,
      permissionIsAllowed: !!enabledModules.private_appointment_plan,
    },
    {
      key: 'draft',
      tab: formatMessage(commonMessages.status.notPublished),
      condition: {
        published_at: { _is_null: true },
        creator_id: { _eq: creatorId },
      },
      withAppointmentButton: false,
      permissionIsAllowed: true,
    },
  ]

  return (
    <Tabs defaultActiveKey="published">
      {tabContents
        .filter(v => v.permissionIsAllowed)
        .map(tabContent => (
          <Tabs.TabPane key={tabContent.key} tab={`${tabContent.tab} ${`(${counts[tabContent.key]})`}`}>
            <AdminPageBlock>
              <AppointmentPlanCollectionTable
                condition={tabContent.condition}
                withAppointmentButton={tabContent?.withAppointmentButton}
              />
            </AdminPageBlock>
          </Tabs.TabPane>
        ))}
    </Tabs>
  )
}

const useAppointmentPlansCounts = (creatorId?: string | null) => {
  const { loading, data } = useQuery<hasura.GetAppointmentPlanCounts, hasura.GetAppointmentPlanCountsVariables>(
    gql`
      query GetAppointmentPlanCounts($condition: appointment_plan_bool_exp!) {
        published: appointment_plan_aggregate(
          where: { _and: [$condition, { published_at: { _is_null: false }, is_private: { _eq: false } }] }
        ) {
          aggregate {
            count
          }
        }
        privately_published: appointment_plan_aggregate(
          where: { _and: [$condition, { published_at: { _is_null: false }, is_private: { _eq: true } }] }
        ) {
          aggregate {
            count
          }
        }
        draft: appointment_plan_aggregate(where: { _and: [$condition, { published_at: { _is_null: true } }] }) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: { condition: creatorId ? { creator_id: { _eq: creatorId } } : {} },
      fetchPolicy: 'no-cache',
    },
  )

  const counts: { [key: string]: number } | null = data
    ? {
        published: data.published.aggregate?.count || 0,
        privatelyPublished: data.privately_published.aggregate?.count || 0,
        draft: data.draft.aggregate?.count || 0,
      }
    : null

  return {
    loading,
    counts,
  }
}

export default AppointmentPlanCollectionTabs
