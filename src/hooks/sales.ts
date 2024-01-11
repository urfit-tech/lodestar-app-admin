import { useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import moment from 'moment'
import { sum, prop, sortBy } from 'ramda'
import hasura from '../hasura'
import { SalesProps, LeadProps, LeadStatus, Manager, GetSalesLeadMemberDataInfo } from '../types/sales'
import { notEmpty } from '../helpers'
import dayjs from 'dayjs'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import axios from 'axios'

export const useManagers = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MANAGER_COLLECTION_BY_MEMBER_PERMISSION>(
    gql`
      query GET_MANAGER_COLLECTION_BY_MEMBER_PERMISSION {
        member_permission(where: { permission_id: { _eq: "BACKSTAGE_ENTER" } }) {
          member {
            id
            name
            picture_url
            username
            email
          }
        }
      }
    `,
  )

  const { data: managerTelephoneExtData } = useQuery<
    hasura.GET_MANAGER_TELEPHONE_EXT,
    hasura.GET_MANAGER_TELEPHONE_EXTVariables
  >(
    gql`
      query GET_MANAGER_TELEPHONE_EXT($memberIds: [String!]!) {
        member_property(where: { member_id: { _in: $memberIds }, property: { name: { _eq: "分機號碼" } } }) {
          value
          member_id
        }
      }
    `,
    {
      variables: {
        memberIds: data?.member_permission.map(d => d.member?.id || '') || [],
      },
    },
  )

  const managers: Manager[] = useMemo(
    () =>
      data?.member_permission.map(v => ({
        id: v.member?.id || '',
        name: v.member?.name || '',
        username: v.member?.username || '',
        avatarUrl: v.member?.picture_url || null,
        email: v.member?.email || '',
        telephone: managerTelephoneExtData?.member_property.find(d => d.member_id === v.member?.id)?.value || '',
      })) || [],
    [data, managerTelephoneExtData],
  )

  return {
    loading,
    error,
    managers,
    refetch,
  }
}

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
        pictureUrl: data.member_by_pk.picture_url || null,
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
  const { id: appId } = useApp();
  const {
    data: salesLeadMemberPhoneData,
    error: errorMembers,
    loading: loadingMembers,
    refetch: refetchMembers,
  } = useQuery<hasura.GetSalesLeadMembers, hasura.GetSalesLeadMembersVariables>(GetSalesLeadMembers, {
    variables: { managerId: manager.id, appId },
  });
  const { authToken } = useAuth();

  const [salesLeadMemberInfo, setSalesLeadMemberInfo] = useState<GetSalesLeadMemberDataInfo>();
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
  
    if (authToken && manager && manager.id && appId ) {
      try {
        const payload = {
          managerId: manager.id,
          appId: appId 
        };
  
        const { data } = await axios.post(
          `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/members/saleLeadMemberData`,
          payload,
          { headers: { authorization: `Bearer ${authToken}` } },
        );
  
        setSalesLeadMemberInfo(data);
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, [authToken]);
  

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };
  const convertToLead = (v: hasura.GetSalesLeadMembers['member'][number] | null): LeadProps | null => {
    if (!v || v.member_phones.length === 0) {
      return null
    }
    const signed = Number(salesLeadMemberInfo?.activeMemberContract?.filter(mc => mc.memberId === v.id).length) > 0
    const status: LeadStatus = v.followed_at
      ? 'FOLLOWED'
      : signed
      ? 'SIGNED'
      : v.excluded_at
      ? 'DEAD'
      : v.closed_at
      ? 'CLOSED'
      : v.completed_at
      ? 'COMPLETED'
      : salesLeadMemberInfo?.memberTask?.find(mt => mt.memberId === v.id)?.status === 'done'
      ? 'PRESENTED'
      : salesLeadMemberInfo?.memberTask?.find(mt => mt.memberId === v.id) //member has member_task => INVITED demo
      ? 'INVITED'
      : v.last_member_note_answered
      ? 'ANSWERED'
      : v.last_member_note_called
      ? 'CONTACTED'
      : 'IDLED'
    return {
      id: v.id,
      star: v.star,
      name: v.name,
      email: v.email,
      pictureUrl: v.picture_url || '',
      createdAt: moment(v.created_at).toDate(),
      phones: v.member_phones?.map(_v => ({ phoneNumber: _v.phone, isValid: _v.is_valid })),
      notes: salesLeadMemberInfo?.memberNote?.filter(mn => mn.memberId === v.id)[0]?.description || '',
      categoryNames:
      salesLeadMemberInfo?.memberCategory
          .filter(mc => mc.memberId === v.id)
          .map(_v => _v.name || '') || [],
      properties:
        salesLeadMemberInfo?.memberProperty?.filter(mp => mp.memberId === v.id)
          .map(v => ({
            id: v.propertyId || '',
            name: v.name || '',
            value: v.value,
          })) || [],
      status,
      assignedAt: v.assigned_at ? dayjs(v.assigned_at).toDate() : null,
      notified: !v.last_member_note_created,
      recentContactedAt: v.last_member_note_called ? dayjs(v.last_member_note_called).toDate() : null,
      recentAnsweredAt: v.last_member_note_answered ? dayjs(v.last_member_note_answered).toDate() : null,
      completedAt: v.completed_at ? dayjs(v.completed_at).toDate() : null,
      closedAt: v.closed_at ? dayjs(v.closed_at).toDate() : null,
      followedAt: v.followed_at ? dayjs(v.followed_at).toDate() : null,
      excludedAt: v.excluded_at ? dayjs(v.excluded_at).toDate() : null,
      recycledAt: v.recycled_at ? dayjs(v.recycled_at).toDate() : null,
    }
  }

  const totalLeads: LeadProps[] = sortBy(prop('id'))(
    salesLeadMemberPhoneData?.member.map(convertToLead)?.filter(notEmpty) || [],
  )

  return {
    loading,
    error,
    refetch,
    loadingMembers,
    errorMembers,
    refetchMembers,
    totalLeads,
    followedLeads: totalLeads.filter(lead => lead.status === 'FOLLOWED'),
    idledLeads: totalLeads.filter(lead => lead.status === 'IDLED'),
    contactedLeads: totalLeads.filter(lead => lead.status === 'CONTACTED'),
    answeredLeads: totalLeads.filter(lead => lead.status === 'ANSWERED'),
    invitedLeads: totalLeads.filter(lead => lead?.status === 'INVITED'),
    presentedLeads: totalLeads.filter(lead => lead?.status === 'PRESENTED'),
    signedLeads: totalLeads.filter(lead => lead?.status === 'SIGNED'),
    closedLeads: totalLeads.filter(lead => lead?.status === 'CLOSED'),
    completedLeads: totalLeads.filter(lead => lead?.status === 'COMPLETED'),
  };
};

const GetSalesLeadMembers = gql`
  query GetSalesLeadMembers($appId: String!, $managerId: String!) {
    member(
      where: { app_id: { _eq: $appId }, manager_id: { _eq: $managerId }, member_phones: { phone: { _is_null: false } } }
    ) {
      id
      name
      email
      picture_url
      star
      created_at
      assigned_at
      followed_at
      closed_at
      completed_at
      excluded_at
      recycled_at
      last_member_note_created
      last_member_note_called
      last_member_note_answered
      member_phones {
        phone
        is_valid
      }
    }
  }
`