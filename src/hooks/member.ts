import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { isEmpty } from 'lodash'
import { sum } from 'ramda'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import hasura from '../hasura'
import { commonMessages } from '../helpers/translation'
import { PermissionGroupProps } from '../types/general'
import {
  MemberPropertyProps,
  MemberAdminProps,
  MemberInfoProps,
  MemberOptionProps,
  MemberProps,
  MemberPublicProps,
  NoteAdminProps,
  UserRole,
  MemberNote,
  ResponseMembers,
  MemberCollectionProps,
} from '../types/member'
import { notEmpty } from '../helpers'
import axios from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { FieldFilter } from '../pages/MemberCollectionAdminPage/MemberCollectionAdminPage'

interface MenuItem {
  role: string | null
  count: number | null
  intlKey: {
    id: string
    defaultMessage: string
  }
}

export const useMember = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<hasura.GET_MEMBER, hasura.GET_MEMBERVariables>(
    gql`
      query GET_MEMBER($memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
          email
          username
          picture_url
          description
          abstract
          title
          member_specialities(distinct_on: [tag_name]) {
            id
            tag_name
          }
          member_tags(distinct_on: [tag_name]) {
            id
            tag_name
          }
          creator_categories {
            category_id
          }
          role
        }
      }
    `,
    { variables: { memberId } },
  )

  const member: MemberProps | null =
    loading || error || !data || !data.member_by_pk
      ? null
      : {
          id: data.member_by_pk.id || '',
          name: data.member_by_pk.name || '',
          email: data.member_by_pk.email || '',
          username: data.member_by_pk.username || '',
          pictureUrl: data.member_by_pk.picture_url || '',
          description: data.member_by_pk.description || '',
          abstract: data.member_by_pk.abstract || '',
          title: data.member_by_pk.title || '',
          specialities: data.member_by_pk.member_specialities.map(v => v.tag_name),
          creatorCategoryIds: data.member_by_pk.creator_categories.map(v => v.category_id),
          memberTags: data.member_by_pk.member_tags.map(tag => ({
            id: tag.id || '',
            tagName: tag.tag_name || '',
          })),
          role: data.member_by_pk.role || '',
        }

  return {
    loadingMember: loading,
    errorMember: error,
    member,
    refetchMember: refetch,
  }
}

export const useMemberAdmin = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MEMBER_ADMIN, hasura.GET_MEMBER_ADMINVariables>(
    gql`
      query GET_MEMBER_ADMIN($memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          picture_url
          username
          name
          email
          star
          role
          title
          description
          abstract
          created_at
          logined_at
          assigned_at
          last_member_note_answered
          last_member_note_called
          manager {
            id
            email
            name
            picture_url
          }
          member_tags(distinct_on: [tag_name]) {
            id
            tag_name
          }
          member_specialities {
            id
            tag_name
          }
          member_phones {
            id
            phone
            is_valid
            country_code
          }
          member_contracts(where: { agreed_at: { _is_null: false } }) {
            id
          }
          member_notes(where: { rejected_at: { _is_null: false } }, order_by: [{ rejected_at: desc }], limit: 1) {
            id
            author {
              id
              name
            }
            description
            rejected_at
          }
          member_permission_extras {
            id
            permission_id
          }
          order_logs(where: { status: { _eq: "SUCCESS" } }) {
            order_products_aggregate {
              aggregate {
                sum {
                  price
                }
              }
            }
            order_discounts_aggregate {
              aggregate {
                sum {
                  price
                }
              }
            }
          }
          member_categories {
            category {
              id
              name
            }
          }
          member_permission_groups {
            permission_group {
              id
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        memberId,
      },
    },
  )

  const { data: coinStatusRemainingData } = useQuery<
    hasura.GetCoinStatusRemaining,
    hasura.GetCoinStatusRemainingVariables
  >(
    gql`
      query GetCoinStatusRemaining($memberId: String!) {
        coin_status_aggregate(where: { member_id: { _eq: $memberId } }) {
          aggregate {
            sum {
              remaining
            }
          }
        }
      }
    `,
    {
      variables: {
        memberId,
      },
    },
  )

  const memberAdmin:
    | (MemberAdminProps & {
        noAgreedContract: boolean
        permissionGroups: Pick<PermissionGroupProps, 'id' | 'name'>[]
      })
    | null = data?.member_by_pk
    ? {
        id: data.member_by_pk.id,
        avatarUrl: data.member_by_pk.picture_url || null,
        username: data.member_by_pk.username,
        name: data.member_by_pk.name,
        email: data.member_by_pk.email,
        star: data.member_by_pk.star,
        role: data.member_by_pk.role as UserRole,
        title: data.member_by_pk.title || '',
        description: data.member_by_pk.description || '',
        abstract: data.member_by_pk.abstract || '',
        createdAt: new Date(data.member_by_pk.created_at),
        loginedAt: data.member_by_pk.logined_at && new Date(data.member_by_pk.logined_at),
        assignedAt: data.member_by_pk.assigned_at && new Date(data.member_by_pk.assigned_at),
        manager: data.member_by_pk.manager
          ? {
              id: data.member_by_pk.manager.id,
              email: data.member_by_pk.manager.email,
              name: data.member_by_pk.manager.name,
              avatarUrl: data.member_by_pk.manager.picture_url || null,
            }
          : null,
        tags: data.member_by_pk.member_tags.map(v => v.tag_name),
        specialities: data.member_by_pk.member_specialities.map(v => v.tag_name),
        phones: data.member_by_pk.member_phones.map(v => ({
          isValid: v.is_valid,
          phoneNumber: v.phone,
          countryCode: v?.country_code || '',
        })),
        lastRejectedNote: data.member_by_pk.member_notes[0]
          ? {
              author: {
                name: data.member_by_pk.member_notes[0].author.name,
              },
              description: data.member_by_pk.member_notes[0].description || '',
              rejectedAt: new Date(data.member_by_pk.member_notes[0].rejected_at),
            }
          : null,
        noAgreedContract: isEmpty(data.member_by_pk.member_contracts),
        permissionIds: data.member_by_pk.member_permission_extras.map(v => v.permission_id),
        consumption: Math.max(
          sum(
            data.member_by_pk.order_logs.map(orderLog => orderLog.order_products_aggregate.aggregate?.sum?.price || 0),
          ) -
            sum(
              data.member_by_pk.order_logs.map(
                orderLog => orderLog.order_discounts_aggregate.aggregate?.sum?.price || 0,
              ),
            ),
        ),
        coins: coinStatusRemainingData?.coin_status_aggregate
          ? coinStatusRemainingData?.coin_status_aggregate?.aggregate?.sum?.remaining
          : 0,
        categories: data.member_by_pk.member_categories.map(v => ({
          id: v.category.id,
          name: v.category.name,
        })),
        permissionGroups: data.member_by_pk.member_permission_groups.map(v => ({
          id: v.permission_group.id,
          name: v.permission_group.name,
        })),
        lastMemberNoteAnswered: data.member_by_pk.last_member_note_answered,
        lastMemberNoteCalled: data.member_by_pk.last_member_note_called,
      }
    : null

  return {
    loadingMemberAdmin: loading,
    errorMemberAdmin: error,
    memberAdmin,
    refetchMemberAdmin: refetch,
  }
}

export const useMemberNotesAdmin = (
  currentIndex: React.MutableRefObject<number>,
  orderBy: hasura.member_note_order_by,
  filters?: {
    member?: string
  },
  keyword?: string,
) => {
  const { permissions, currentMemberId } = useAuth()
  const limit = 10

  const splittedOrderBy: Array<hasura.member_note_order_by> = Object.entries(orderBy).map(([key, value]) => ({
    [key as keyof Partial<hasura.member_note_order_by>]: value,
  }))

  const condition: hasura.GET_MEMBER_NOTES_ADMINVariables['condition'] = {
    deleted_at: { _is_null: true },
    author:
      permissions.VIEW_ALL_MEMBER_NOTE || permissions.MEMBER_NOTE_ADMIN
        ? undefined
        : {
            id: {
              _eq: currentMemberId,
            },
          },
    member: filters?.member ? { id: { _eq: filters.member } } : undefined,
    description: keyword ? { _like: `%${keyword}%` } : undefined,
  }

  const { loading, error, data, refetch, fetchMore } = useQuery<
    hasura.GET_MEMBER_NOTES_ADMIN,
    hasura.GET_MEMBER_NOTES_ADMINVariables
  >(
    gql`
      query GET_MEMBER_NOTES_ADMIN(
        $orderBy: [member_note_order_by!]!
        $condition: member_note_bool_exp
        $offset: Int!
        $limit: Int!
      ) {
        member_note_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_note(where: $condition, order_by: $orderBy, offset: $offset, limit: $limit) {
          id
          created_at
          updated_at
          type
          status
          metadata
          transcript
          author {
            id
            picture_url
            name
          }
          member {
            id
            picture_url
            name
            email
            username
          }
          duration
          description
          note
          member_note_attachments(where: { data: { _is_null: false } }) {
            attachment_id
            data
            created_at
            options
            attachment {
              id
              type
            }
          }
        }
      }
    `,
    { variables: { condition, orderBy: splittedOrderBy, offset: 0, limit } },
  )

  const notes =
    data?.member_note.map(v => ({
      id: v.id,
      createdAt: new Date(v.created_at),
      type: v.type as NoteAdminProps['type'],
      status: v.status || null,
      transcript: v.transcript || null,
      author: {
        id: v.author.id,
        pictureUrl: v.author.picture_url || null,
        name: v.author.name,
      },
      member: {
        id: v.member?.id || '',
        pictureUrl: v.member?.picture_url || '',
        name: v.member?.name || v.member?.username || '',
        email: v.member?.email || '',
      },
      duration: v.duration || 0,
      description: v.description || null,
      note: v.note || '',
      attachments: v.member_note_attachments.map(u => ({
        id: u.attachment_id,
        data: u.data,
        type: u.attachment?.type || '',
        options: u.options,
        createdAt: new Date(u.created_at),
      })),
      metadata: v.metadata,
    })) || []

  const loadMoreNotes = () =>
    fetchMore({
      variables: {
        orderBy: splittedOrderBy,
        condition,
        offset: 10 + currentIndex.current,
        limit,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        currentIndex.current += limit
        return {
          ...prev,
          member_note_aggregate: fetchMoreResult?.member_note_aggregate,
          member_note: [...prev.member_note, ...fetchMoreResult.member_note],
        }
      },
    })

  return {
    loadingNotes: loading,
    errorNotes: error,
    notes,
    refetchNotes: refetch,
    loadMoreNotes,
    noteAggregate: data?.member_note_aggregate.aggregate?.count || 0,
  }
}

export const useMutateMemberNote = () => {
  const [insertMemberNote] = useMutation<hasura.INSERT_MEMBER_NOTE, hasura.INSERT_MEMBER_NOTEVariables>(gql`
    mutation INSERT_MEMBER_NOTE(
      $memberId: String!
      $authorId: String!
      $type: String
      $status: String
      $duration: Int
      $description: String
      $note: String
      $rejectedAt: timestamptz
    ) {
      insert_member_note_one(
        object: {
          member_id: $memberId
          author_id: $authorId
          type: $type
          status: $status
          duration: $duration
          description: $description
          note: $note
          rejected_at: $rejectedAt
        }
      ) {
        id
      }
      update_member(where: { id: { _eq: $memberId } }, _set: { last_member_note_created: "now()" }) {
        affected_rows
      }
    }
  `)

  const [updateLastMemberNoteCalled] = useMutation<
    hasura.UPDATE_LAST_MEMBER_NOTE_CALLED,
    hasura.UPDATE_LAST_MEMBER_NOTE_CALLEDVariables
  >(gql`
    mutation UPDATE_LAST_MEMBER_NOTE_CALLED($memberId: String!, $lastMemberNoteCalled: timestamptz) {
      update_member(where: { id: { _eq: $memberId } }, _set: { last_member_note_called: $lastMemberNoteCalled }) {
        affected_rows
      }
    }
  `)
  const [updateLastMemberNoteAnswered] = useMutation<
    hasura.UPDATE_LAST_MEMBER_NOTE_ANSWERED,
    hasura.UPDATE_LAST_MEMBER_NOTE_ANSWEREDVariables
  >(gql`
    mutation UPDATE_LAST_MEMBER_NOTE_ANSWERED($memberId: String!, $lastMemberNoteAnswered: timestamptz) {
      update_member(where: { id: { _eq: $memberId } }, _set: { last_member_note_answered: $lastMemberNoteAnswered }) {
        affected_rows
      }
    }
  `)

  const [updateMemberNote] = useMutation<hasura.UPDATE_MEMBER_NOTE, hasura.UPDATE_MEMBER_NOTEVariables>(gql`
    mutation UPDATE_MEMBER_NOTE($memberNoteId: String!, $data: member_note_set_input!) {
      update_member_note_by_pk(pk_columns: { id: $memberNoteId }, _set: $data) {
        id
      }
    }
  `)

  const [deleteMemberNote] = useMutation(gql`
    mutation DELETE_MEMBER_NOTE($memberNoteId: String!, $deletedAt: timestamptz, $currentMemberId: String!) {
      update_member_note(
        where: { id: { _eq: $memberNoteId } }
        _set: { deleted_at: $deletedAt, deleted_from: $currentMemberId }
      ) {
        affected_rows
      }
    }
  `)

  return {
    insertMemberNote,
    updateMemberNote,
    deleteMemberNote,
    updateLastMemberNoteAnswered,
    updateLastMemberNoteCalled,
  }
}

export const usePublicMember = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<hasura.GET_PUBLIC_MEMBER, hasura.GET_PUBLIC_MEMBERVariables>(
    gql`
      query GET_PUBLIC_MEMBER($memberId: String!) {
        member_public(where: { id: { _eq: $memberId } }) {
          id
          name
          username
          picture_url
          description
          role
        }
      }
    `,
    { variables: { memberId } },
  )

  const member: MemberPublicProps =
    loading || error || !data
      ? {
          id: '',
          name: '',
          username: '',
          pictureUrl: '',
          description: '',
          role: '',
        }
      : data.member_public.map(member => ({
          id: member.id || '',
          name: member.name || '',
          username: member.name || '',
          pictureUrl: member.picture_url || '',
          description: member.description || '',
          role: member.role || '',
        }))[0]

  return {
    member,
    loadingMember: loading,
    refetchMember: refetch,
  }
}

export const useMemberRoleCount = (
  appId: string,
  filter?: {
    name?: string
    email?: string
    phone?: string
    category?: string
    managerName?: string
    managerId?: string
    tag?: string
    properties?: {
      id: string
      value?: string
    }[]
    permissionGroup?: string
  },
) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<any>('')
  const [menu, setMenu] = useState<MenuItem[]>([])

  const { authToken } = useAuth()

  const fetchMemberRoleCount = async (filter?: {
    name?: string
    email?: string
    phone?: string
    category?: string
    managerName?: string
    managerId?: string
    tag?: string
    properties?: {
      id: string
      value?: string
    }[]
    permissionGroup?: string
  }) => {
    if (!filter) {
      return
    }

    const payload = {
      name: filter.name ? `%${filter.name}%` : undefined,
      email: filter.email ? `%${filter.email}%` : undefined,
      managerName: filter.managerName ? { name: `%${filter.managerName}%` } : undefined,
      managerId: filter.managerId ? filter.managerId : undefined,
      phone: filter.phone ? { phone: `%${filter.phone}%` } : undefined,
      category: filter.category ? { category: { name: `%${filter.category}%` } } : undefined,
      tag: filter.tag ? { tag_name: `%${filter.tag}%` } : undefined,
      permissionGroup: filter.permissionGroup ? `${filter.permissionGroup}` : undefined,
      properties: filter.properties?.length
        ? filter.properties
            .filter(property => property.value)
            .map(property => ({
              [property.id]: `%${property.value}%`,
            }))
        : undefined,
    }

    const { data: res } = await axios.post(
      `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/members/member-role-count`,
      payload,
      {
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${authToken}` },
      },
    )
    return res
  }

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const { data } = await fetchMemberRoleCount(filter)
        if (data) {
          const totalMembers = data.reduce((sum: number, item: { count: number }) => sum + item.count, 0)
          const roleCounts: { 'app-owner': number; 'content-creator': number; 'general-member': number } = {
            'app-owner': 0,
            'content-creator': 0,
            'general-member': 0,
          }
          data.forEach((item: { role: 'app-owner' | 'content-creator' | 'general-member'; count: number }) => {
            roleCounts[item.role] = item.count
          })
          setMenu([
            {
              role: null,
              count: totalMembers,
              intlKey: commonMessages.label.allMembers,
            },
            {
              role: 'app-owner',
              count: roleCounts['app-owner'],
              intlKey: commonMessages.label.appOwner,
            },
            {
              role: 'content-creator',
              count: roleCounts['content-creator'],
              intlKey: commonMessages.label.contentCreator,
            },
            {
              role: 'general-member',
              count: roleCounts['general-member'],
              intlKey: commonMessages.label.generalMember,
            },
          ])
        }
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, appId, JSON.stringify(filter)])

  return {
    loading,
    error,
    menu,
    fetchMemberRoleCount,
  }
}

export const useMembers = (authToken: string, limit: number, filter?: FieldFilter) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<any>('')
  const [members, setMembers] = useState<
    {
      id: string
      pictureUrl: string | null
      name: string
      email: string
      role: 'general-member' | 'content-creator' | 'app-owner'
      createdAt: Date
      username: string
      loginedAt: Date | null
      managerId: string | null
    }[]
  >([])
  const [prevToken, setPrevToken] = useState<string | null>(null)
  const [nextToken, setNextToken] = useState<string | null>(null)

  const fetchMembers = async (
    filter: FieldFilter | undefined,
    option: {
      limit?: number
      nextToken?: string | null
    },
  ) => {
    const payload = {
      condition: {
        role: filter?.role ? filter.role : undefined,
        name: filter?.name ? `%${filter.name}%` : undefined,
        email: filter?.email ? `%${filter.email}%` : undefined,
        username: filter?.username ? `%${filter.username}%` : undefined,
        managerName: filter?.managerName ? `%${filter.managerName}%` : undefined,
        phone: filter?.phone ? `%${filter.phone}%` : undefined,
        tag: filter?.tag ? `%${filter.tag}%` : undefined,
        category: filter?.category ? `%${filter.category}%` : undefined,
        permissionGroup: filter?.permissionGroup ? `${filter.permissionGroup}` : undefined,
        properties: filter?.properties
          ? Object.entries(filter?.properties).map(([key, value]) => ({ [key]: `%${value}%` }))
          : undefined,
      },
      option,
    }
    const { data: res } = await axios.post<ResponseMembers>(
      `${process.env.REACT_APP_LODESTAR_SERVER_ENDPOINT}/members`,
      payload,
      {
        headers: { 'Content-Type': 'application/json', authorization: `Bearer ${authToken}` },
      },
    )
    return res
  }

  useEffect(() => {
    setLoading(true)
    ;(async () => {
      try {
        const res = await fetchMembers(filter, {
          limit,
        })
        setMembers(() =>
          res.data.map(v => ({
            id: v.id,
            pictureUrl: v.picture_url,
            name: v.name,
            email: v.email,
            role: v.role,
            createdAt: new Date(v.created_at),
            username: v.username,
            loginedAt: v.logined_at ? new Date(v.logined_at) : null,
            managerId: v.manager_id,
          })),
        )
        setPrevToken(() => res.cursor.beforeCursor)
        setNextToken(() => res.cursor.afterCursor)
      } catch (error) {
        setError(error)
      } finally {
        setLoading(false)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authToken, limit, JSON.stringify(filter)])

  return {
    loading,
    error,
    members,
    fetchMembers,
    prevToken,
    nextToken,
  }
}

export const useMemberCollection = (members: MemberCollectionProps[]) => {
  const { loading: loadingMemberPhones, data: memberPhonesData } = useQuery<
    hasura.GetMemberPhones,
    hasura.GetMemberPhonesVariables
  >(
    gql`
      query GetMemberPhones($memberIdList: [String!]) {
        member_phone(where: { member_id: { _in: $memberIdList } }) {
          id
          member_id
          phone
        }
      }
    `,
    { variables: { memberIdList: members.map(member => member.id) } },
  )

  const {
    loading: loadingMemberOrderProductPrice,
    data: memberOrderProductPriceData,
    refetch: refetchMemberOrderProductPrice,
  } = useQuery<hasura.GetMemberOrderProductPrice, hasura.GetMemberOrderProductPriceVariables>(
    gql`
      query GetMemberOrderProductPrice($memberIdList: [String!]) {
        order_log(where: { member_id: { _in: $memberIdList }, status: { _eq: "SUCCESS" } }) {
          id
          member_id
          order_products_aggregate {
            aggregate {
              sum {
                price
              }
            }
          }
        }
      }
    `,
    { variables: { memberIdList: members.map(member => member.id) } },
  )

  const {
    loading: loadingMemberOrderDiscountPrice,
    data: memberOrderDiscountPriceData,
    refetch: refetchMemberOrderDiscountPrice,
  } = useQuery<hasura.GetMemberOrderDiscountPrice, hasura.GetMemberOrderDiscountPriceVariables>(
    gql`
      query GetMemberOrderDiscountPrice($memberIdList: [String!]) {
        order_log(where: { member_id: { _in: $memberIdList }, status: { _eq: "SUCCESS" } }) {
          id
          member_id
          order_discounts_aggregate {
            aggregate {
              sum {
                price
              }
            }
          }
        }
      }
    `,
    { variables: { memberIdList: members.map(member => member.id) } },
  )

  const { loading: loadingManagerInfo, data: managerInfoData } = useQuery<
    hasura.GetManagerInfo,
    hasura.GetManagerInfoVariables
  >(
    gql`
      query GetManagerInfo($managerIdList: [String!]) {
        member(where: { id: { _in: $managerIdList } }) {
          id
          name
        }
      }
    `,
    { variables: { managerIdList: members.map(member => member.managerId).filter(notEmpty) } },
  )

  const {
    loading: loadingMemberCategories,
    data: memberCategoriesData,
    refetch: refetchMemberCategories,
  } = useQuery<hasura.GetMemberCategories, hasura.GetMemberCategoriesVariables>(
    gql`
      query GetMemberCategories($memberIdList: [String!]) {
        member_category(where: { member_id: { _in: $memberIdList } }) {
          id
          member_id
          category {
            id
            name
          }
        }
      }
    `,
    {
      variables: {
        memberIdList: members.map(member => member.id),
      },
    },
  )
  const {
    loading: loadingMemberTags,
    data: memberTagsData,
    refetch: refetchMemberTags,
  } = useQuery<hasura.GetMemberTags, hasura.GetMemberTagsVariables>(
    gql`
      query GetMemberTags($memberIdList: [String!]) {
        member_tag(where: { member_id: { _in: $memberIdList } }) {
          id
          member_id
          tag_name
        }
      }
    `,
    {
      variables: { memberIdList: members.map(member => member.id) },
    },
  )
  const {
    loading: loadingMemberProperties,
    data: memberPropertiesData,
    refetch: refetchMemberProperties,
  } = useQuery<hasura.GetMemberProperties, hasura.GetMemberPropertiesVariables>(
    gql`
      query GetMemberProperties($memberIdList: [String!]) {
        member_property(where: { member_id: { _in: $memberIdList } }) {
          id
          member_id
          property_id
          value
        }
      }
    `,
    {
      variables: {
        memberIdList: members.map(member => member.id),
      },
    },
  )

  const memberOrderProductPrice: { memberId: string; price: number }[] =
    memberOrderProductPriceData?.order_log.map(v => ({
      memberId: v.member_id,
      price: v.order_products_aggregate.aggregate?.sum?.price || 0,
    })) || []

  const memberOrderDiscountPrice: { memberId: string; price: number }[] =
    memberOrderDiscountPriceData?.order_log.map(v => ({
      memberId: v.member_id,
      price: v.order_discounts_aggregate.aggregate?.sum?.price || 0,
    })) || []

  const memberCollection: MemberInfoProps[] =
    members.map(v => ({
      ...v,
      avatarUrl: v.pictureUrl,
      phones:
        memberPhonesData?.member_phone
          .filter(memberPhone => memberPhone.member_id === v.id)
          .map(memberPhone => memberPhone.phone) || [],
      consumption: Math.max(
        sum(
          memberOrderProductPrice
            .filter(memberOrderProduct => memberOrderProduct.memberId === v.id)
            .map(memberOrderProduct => memberOrderProduct.price),
        ) -
          sum(
            memberOrderDiscountPrice
              .filter(memberOrderDiscount => memberOrderDiscount.memberId === v.id)
              .map(memberOrderDiscount => memberOrderDiscount.price),
          ),
      ),
      manager: managerInfoData?.member.find(manager => manager.id === v.managerId)
        ? {
            id: managerInfoData?.member.find(manager => manager.id === v.managerId)?.id || '',
            name: managerInfoData?.member.find(manager => manager.id === v.managerId)?.name || '',
          }
        : null,
      categories:
        memberCategoriesData?.member_category
          .filter(memberCategory => memberCategory.member_id === v.id)
          .map(memberCategory => ({
            id: memberCategory.category.id,
            name: memberCategory.category.name,
          })) || [],
      tags:
        memberTagsData?.member_tag
          .filter(memberTag => memberTag.member_id === v.id)
          .map(memberTag => memberTag.tag_name) || [],
      properties: memberPropertiesData?.member_property
        .filter(memberProperty => memberProperty.member_id === v.id)
        .reduce((acc, cur) => {
          return { ...acc, [cur.property_id]: cur.value }
        }, {} as MemberInfoProps['properties']),
    })) || []

  return {
    loadingMemberPhones,
    loadingManagerInfo,
    loadingMemberOrderProductPrice,
    loadingMemberOrderDiscountPrice,
    loadingMemberCategories,
    loadingMemberTags,
    loadingMemberProperties,
    memberCollection,
    refetchMemberOrderProductPrice,
    refetchMemberOrderDiscountPrice,
    refetchMemberCategories,
    refetchMemberTags,
    refetchMemberProperties,
  }
}

export const useMemberSummaryCollection = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_MEMBER_SUMMARY_COLLECTION>(
    gql`
      query GET_MEMBER_SUMMARY_COLLECTION {
        member {
          id
          picture_url
          name
          username
          email
        }
      }
    `,
  )

  const members: MemberOptionProps[] =
    loading || error || !data
      ? []
      : data.member.map(member => ({
          id: member.id,
          avatarUrl: member.picture_url || null,
          name: member.name,
          username: member.username,
          email: member.email,
        }))

  return {
    loadingMembers: loading,
    errorMembers: error,
    members,
    refetchMembers: refetch,
  }
}

export const useProperty = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GET_PROPERTY, hasura.GET_PROPERTYVariables>(
    gql`
      query GET_PROPERTY($type: String!) {
        property(where: { type: { _eq: $type } }, order_by: { position: asc }) {
          id
          name
          placeholder
          is_editable
          is_required
        }
      }
    `,
    {
      variables: { type: 'member' },
    },
  )

  const properties = useMemo(() => {
    return (
      data?.property.map(v => ({
        id: v.id,
        name: v.name,
        placeholder: v.placeholder?.replace(/[()]/g, ''),
        isEditable: v.is_editable,
        isRequired: v.is_required,
      })) || []
    )
  }, [data])

  return {
    loadingProperties: loading,
    errorProperties: error,
    properties,
    refetchProperties: refetch,
  }
}
export const useMutateMember = () => {
  const [updateMemberAvatar] = useMutation<hasura.UPDATE_MEMBER_AVATAR, hasura.UPDATE_MEMBER_AVATARVariables>(gql`
    mutation UPDATE_MEMBER_AVATAR($memberId: String!, $pictureUrl: String!) {
      update_member(where: { id: { _eq: $memberId } }, _set: { picture_url: $pictureUrl }) {
        affected_rows
      }
    }
  `)
  return {
    updateMemberAvatar,
  }
}

export const useMemberPropertyCollection = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_MEMBER_PROPERTY_COLLECTION,
    hasura.GET_MEMBER_PROPERTY_COLLECTIONVariables
  >(
    gql`
      query GET_MEMBER_PROPERTY_COLLECTION($memberId: String!) {
        member_property(where: { member: { id: { _eq: $memberId } } }) {
          id
          property {
            id
            name
          }
          value
        }
      }
    `,
    {
      variables: {
        memberId,
      },
      context: {
        important: true,
      },
    },
  )

  const memberProperties: MemberPropertyProps[] =
    data?.member_property.map(v => ({
      id: v.property.id,
      name: v.property.name,
      value: v.value,
    })) || []

  return {
    loadingMemberProperties: loading,
    errorMemberProperties: error,
    memberProperties,
    refetchMemberProperties: refetch,
  }
}

export const useMutateMemberProperty = () => {
  const [updateMemberProperty] = useMutation<hasura.UPDATE_MEMBER_PROPERTY, hasura.UPDATE_MEMBER_PROPERTYVariables>(gql`
    mutation UPDATE_MEMBER_PROPERTY($memberProperties: [member_property_insert_input!]!) {
      insert_member_property(
        objects: $memberProperties
        on_conflict: { constraint: member_property_member_id_property_id_key, update_columns: [value] }
      ) {
        affected_rows
      }
    }
  `)
  return { updateMemberProperty }
}

export const useMemberPermissionGroups = (memberId: string) => {
  const { loading, data, error } = useQuery<
    hasura.GetMemberPermissionGroups,
    hasura.GetMemberPermissionGroupsVariables
  >(
    gql`
      query GetMemberPermissionGroups($memberId: String!) {
        member_permission_group(where: { member_id: { _eq: $memberId } }) {
          id
          permission_group {
            id
            name
          }
        }
      }
    `,
    { variables: { memberId } },
  )
  const memberPermissionGroups: { permission_group_id: string; name: string }[] =
    data?.member_permission_group.map(v => ({
      permission_group_id: v.permission_group.id,
      name: v.permission_group.name,
    })) || []

  return {
    loading,
    memberPermissionGroups,
    error,
  }
}

export const useTransferManagers = () => {
  const { loading, error, data } = useQuery<hasura.GetTransferManagers>(
    gql`
      query GetTransferManagers {
        member(where: { member_permissions: { permission_id: { _in: ["SALES_LEAD_ADMIN", "SALES_LEAD_NORMAL"] } } }) {
          id
          email
          name
        }
      }
    `,
    {},
  )

  const [transferLeads] = useMutation<hasura.TransferLeads, hasura.TransferLeadsVariables>(gql`
    mutation TransferLeads($memberIds: [String!]!, $managerId: String!, $leadStatusCategoryId: uuid) {
      update_member(
        where: { id: { _in: $memberIds } }
        _set: { manager_id: $managerId, lead_status_category_id: $leadStatusCategoryId }
      ) {
        affected_rows
      }
    }
  `)

  const transferManagers: { id: string; email: string; name: string }[] =
    data?.member.map(v => ({
      id: v.id || '',
      email: v.email || '',
      name: v.name || '',
    })) || []

  return {
    loading,
    error,
    transferManagers,
    transferLeads,
  }
}
