import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { sum, prop, sortBy } from 'ramda'
import hasura from '../hasura'
import { SalesProps, LeadProps } from '../types/sales'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { notEmpty } from '../helpers'

export const useSales = (salesId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_SALES, hasura.GET_SALESVariables>(
    gql`
      query GET_SALES($salesId: String!, $startOfToday: timestamptz!, $startOfMonth: timestamptz!) {
        member_by_pk(id: $salesId) {
          id
          picture_url
          name
          username
          email
          metadata
          member_properties(where: { property: { name: { _eq: "分機號碼" } } }) {
            id
            value
          }
          attends(where: { ended_at: { _is_null: false } }, order_by: [{ started_at: desc }], limit: 1) {
            id
            started_at
            ended_at
          }
        }
        order_executor_sharing(where: { executor_id: { _eq: $salesId }, created_at: { _gte: $startOfMonth } }) {
          order_executor_id
          total_price
          ratio
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
      }
    `,
    {
      variables: {
        salesId,
        startOfToday: moment().startOf('day').toDate(),
        startOfMonth: moment().startOf('month').toDate(),
      },
    },
  )

  const sales: SalesProps | null = data?.member_by_pk
    ? {
        id: data.member_by_pk.id,
        pictureUrl: data.member_by_pk.picture_url,
        name: data.member_by_pk.name,
        email: data.member_by_pk.email,
        telephone: data.member_by_pk.member_properties[0]?.value || '',
        metadata: data.member_by_pk.metadata,
        baseOdds: parseFloat(data.member_by_pk.metadata?.assignment?.odds || '0'),
        lastAttend: data.member_by_pk.attends[0]
          ? {
              startedAt: new Date(data.member_by_pk.attends[0].started_at),
              endedAt: new Date(data.member_by_pk.attends[0].ended_at),
            }
          : null,
        sharingOfMonth: sum(
          data.order_executor_sharing.map(sharing => Math.floor(sharing.total_price * sharing.ratio)),
        ),
        sharingOrdersOfMonth: data.order_executor_sharing.length,
        totalDuration: data.member_note_aggregate.aggregate?.sum?.duration || 0,
        totalNotes: data.member_note_aggregate.aggregate?.count || 0,
      }
    : null

  return {
    loadingSales: loading,
    errorSales: error,
    sales,
    refetchSales: refetch,
  }
}

export const useSalesLeads = (managerId: string, leadFilter?: (lead: LeadProps) => boolean) => {
  const { id: appId } = useApp()
  const { data, error, loading, refetch } = useQuery<hasura.GET_SALES_LEADS, hasura.GET_SALES_LEADSVariables>(
    GET_SALES_LEADS,
    { variables: { managerId } },
  )
  const convertToLead = (v: hasura.GET_SALES_LEADS_xuemi_lead_status): LeadProps | null => {
    return v.member && v.member.member_phones.length > 0
      ? {
          id: v.member.id,
          star: v.member.star,
          name: v.member.name,
          email: v.member.email,
          createdAt: moment(v.member.created_at).toDate(),
          phones: v.member.member_phones.map(_v => _v.phone),
          categoryNames: v.member.member_categories.map(_v => _v.category.name),
          properties: v.member.member_properties.map(v => ({
            id: v.property.id,
            name: v.property.name,
            value: v.value,
          })),
          paid: v.paid,
          status: v.status as LeadProps['status'],
          notified: v.recent_contacted_at === null,
          recentTaskedAt: v.recent_tasked_at ? new Date(v.recent_tasked_at) : null,
          recentContactedAt: v.recent_contacted_at ? new Date(v.recent_contacted_at) : null,
        }
      : null
  }

  const totalLeads: LeadProps[] = sortBy(prop('id'))(data?.xuemi_lead_status.map(convertToLead).filter(notEmpty) || [])
  const filteredLeads = totalLeads.filter(lead => (leadFilter ? leadFilter(lead) : true))
  return {
    loading,
    error,
    refetch,
    totalLeads,
    dedicatedLeads: filteredLeads.filter(lead => lead.status === 'DEDICATED'),
    existedLeads: filteredLeads.filter(lead => lead.status === 'EXISTED'),
    idledLeads: filteredLeads.filter(lead => lead.status === 'IDLED'),
    contactedLeads: filteredLeads.filter(lead => lead.status === 'CONTACTED'),
    invitedLeads: filteredLeads.filter(lead => lead?.status === 'INVITED'),
    presentedLeads: filteredLeads.filter(lead => lead?.status === 'PRESENTED'),
    paidLeads: filteredLeads.filter(lead => lead?.status === 'SIGNED'),
    closedLeads: filteredLeads.filter(lead => lead?.status === 'CLOSED'),
  }
}

const GET_SALES_LEADS = gql`
  query GET_SALES_LEADS($managerId: String!) {
    xuemi_lead_status(where: { manager_id: { _eq: $managerId } }) {
      member {
        id
        name
        email
        star
        created_at
        assigned_at
        member_properties {
          property {
            id
            name
          }
          value
        }
        member_phones {
          phone
        }
        member_categories {
          category {
            name
          }
        }
      }
      status
      paid
      recent_contacted_at
      recent_tasked_at
    }
  }
`
