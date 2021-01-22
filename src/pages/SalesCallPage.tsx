import Icon from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { AdminPageTitle } from 'lodestar-app-admin/src/components/admin'
import AdminLayout from 'lodestar-app-admin/src/components/layout/AdminLayout'
import { ReactComponent as PhoneIcon } from 'lodestar-app-admin/src/images/icon/phone.svg'
import { sum } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import { salesMessages } from '../helpers/translation'
import types from '../types'

const SalesCallPage: React.FC = () => {
  const { formatMessage } = useIntl()

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon className="mr-3" component={() => <PhoneIcon />} />
        <span>{formatMessage(salesMessages.label.salesCall)}</span>
      </AdminPageTitle>
    </AdminLayout>
  )
}

const useSalesSummary = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_SALES_SUMMARY, types.GET_SALES_SUMMARYVariables>(gql`
    query GET_SALES_SUMMARY(
      $salesId: String!
      $startOfToday: timestamptz!
      $startOfMonth: timestamptz!
      $startOfTwoWeeks: timestamptz!
      $startOfThreeMonths: timestamptz!
    ) {
      member_by_pk(id: $salesId) {
        id
        picture_url
        name
        username
      }
      order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
        order_executor_id
        total_price
        ratio
      }
      member_contract_aggregate(
        where: { author_id: { _eq: $salesId }, agreed_at: { _gte: $startOfMonth }, revoked_at: { _is_null: true } }
      ) {
        aggregate {
          count
        }
      }
      member_note_aggregate(
        where: {
          author_id: { _eq: $salesId }
          type: { _eq: "outbound" }
          status: { _eq: "answered" }
          duration: { _gt: 0 }
          created_at: { _gte: $startOfToday }
        }
      ) {
        aggregate {
          count
          sum {
            duration
          }
        }
      }
      assigned_members_today: member_aggregate(
        where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfToday } }
      ) {
        aggregate {
          count
        }
      }
      assigned_members_last_two_weeks: member_aggregate(
        where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfTwoWeeks } }
      ) {
        aggregate {
          count
        }
      }
      assigned_members_last_three_months: member_aggregate(
        where: { manager_id: { _eq: $salesId }, assigned_at: { _gte: $startOfThreeMonths } }
      ) {
        aggregate {
          count
        }
      }
    }
  `)

  const salesSummary = data
    ? {
        sales: data.member_by_pk
          ? {
              id: data.member_by_pk.id,
              picture_url: data.member_by_pk.picture_url,
              name: data.member_by_pk.name || data.member_by_pk.username,
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        contractsOfMonth: data.member_contract_aggregate.aggregate?.count || 0,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
        assignedMembersToday: data.assigned_members_today.aggregate?.count || 0,
        assignedMembersNew: data.assigned_members_last_two_weeks.aggregate?.count || 0,
        assignedMembersOld: data.assigned_members_last_three_months.aggregate?.count || 0,
      }
    : null

  return {
    loadingSalesSummary: loading,
    errorSalesSummary: error,
    salesSummary,
    refetchSalesSummary: refetch,
  }
}

const useFirstAssignedMember = () => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_FIRST_ASSIGNED_MEMBER,
    types.GET_FIRST_ASSIGNED_MEMBERVariables
  >(gql`
    query GET_FIRST_ASSIGNED_MEMBER($salesId: String!) {
      member(
        where: {
          manager_id: { _eq: $salesId }
          assigned_at: { _is_null: false }
          _not: { member_notes: { author_id: { _eq: $salesId } } }
        }
        order_by: [{ assigned_at: asc }]
      ) {
        id
        email
        name
        username
        member_phones {
          id
          phone
        }
        member_categories {
          id
          category {
            id
            name
          }
        }
        member_properties {
          id
          property {
            id
            name
          }
          value
        }
      }
    }
  `)

  const assignedMember = data?.member[0]
    ? {
        id: data.member[0].id,
        email: data.member[0].email,
        name: data.member[0].name || data.member[0].username,
        phones: data.member[0].member_phones.map(v => v.phone),
        categories: data.member[0].member_categories.map(v => ({
          id: v.category.id,
          name: v.category.name,
        })),
        properties: data.member[0].member_properties.map(v => ({
          id: v.property.id,
          name: v.property.name,
          value: v.value,
        })),
      }
    : null

  return {
    loadingAssignedMember: loading,
    errorAssignedMember: error,
    assignedMember,
    refetchAssignedMember: refetch,
  }
}

export default SalesCallPage
