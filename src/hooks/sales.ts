import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import moment from 'moment'
import { sum, prop, sortBy, max } from 'ramda'
import hasura from '../hasura'
import { SalesProps, LeadProps, LeadStatus, Manager } from '../types/sales'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { notEmpty } from '../helpers'
import dayjs from 'dayjs'
import { useManagers } from '../hooks'

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

export const useManagerLeads = (manager: Manager) => {
  const { data, error, loading, refetch } = useQuery<hasura.GET_SALES_LEADS, hasura.GET_SALES_LEADSVariables>(
    GET_SALES_LEADS,
    { variables: { managerId: manager.id } },
  )
  const convertToLead = (v: hasura.GET_SALES_LEADS_member | null): LeadProps | null => {
    if (!v || v.member_phones.length === 0) {
      return null
    }

    const star = Number(v.star) || 0
    const signed = v.member_contracts.length > 0
    const status: LeadStatus =
      Number(v.star) === Number(manager.telephone)
        ? 'STARRED'
        : star < -999
        ? 'DEAD'
        : star === -999
        ? 'CLOSED'
        : signed
        ? 'SIGNED'
        : data?.member_task
            .filter(u => u.status === 'done')
            .map(u => u.member_id)
            .includes(v.id)
        ? 'PRESENTED'
        : data?.member_task
            .filter(u => u.status !== 'done')
            .map(u => u.member_id)
            .includes(v.id)
        ? 'INVITED'
        : v.last_member_note_created
        ? 'CONTACTED'
        : 'IDLED'
    return {
      id: v.id,
      star: v.star,
      name: v.name,
      email: v.email,
      createdAt: moment(v.created_at).toDate(),
      phones: v.member_phones.map(_v => _v.phone),
      categoryNames: v.member_categories.map(_v => _v.category.name),
      properties: v.member_properties.map(v => ({
        id: v.property.id,
        name: v.property.name,
        value: v.value,
      })),
      status,
      assignedAt: v.assigned_at ? dayjs(v.assigned_at).toDate() : null,
      notified: !v.last_member_note_created,
      recentContactedAt: v.last_member_note_created ? dayjs(v.last_member_note_created).toDate() : null,
    }
  }
  const totalLeads: LeadProps[] = sortBy(prop('id'))(data?.member.map(convertToLead).filter(notEmpty) || [])
  return {
    loading,
    error,
    refetch,
    totalLeads,
    idledLeads: totalLeads.filter(lead => lead.status === 'IDLED'),
    contactedLeads: totalLeads.filter(lead => lead.status === 'CONTACTED'),
    invitedLeads: totalLeads.filter(lead => lead?.status === 'INVITED'),
    presentedLeads: totalLeads.filter(lead => lead?.status === 'PRESENTED'),
    signedLeads: totalLeads.filter(lead => lead?.status === 'SIGNED'),
    closedLeads: totalLeads.filter(lead => lead?.status === 'CLOSED'),
  }
}

const GET_SALES_LEADS = gql`
  query GET_SALES_LEADS($managerId: String!) {
    member_task(where: { member: { manager_id: { _eq: $managerId } } }, distinct_on: [member_id]) {
      member_id
      status
    }
    member(where: { manager_id: { _eq: $managerId }, member_phones: { phone: { _is_null: false } } }) {
      id
      name
      email
      star
      created_at
      assigned_at
      last_member_note_created
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
      member_contracts(where: { agreed_at: { _is_null: false } }) {
        agreed_at
        revoked_at
        values
      }
    }
  }
`
