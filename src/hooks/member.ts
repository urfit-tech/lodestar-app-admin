import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { isEmpty } from 'lodash'
import { sum } from 'ramda'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import hasura from '../hasura'
import { commonMessages } from '../helpers/translation'
import { CouponPlanProps } from '../types/checkout'
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
} from '../types/member'
import { notEmpty } from '../helpers'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'

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
          coupons {
            id
            status {
              outdated
              used
            }
            coupon_code {
              id
              coupon_plan {
                id
                title
                description
                scope
                type
                amount
                constraint
                started_at
                ended_at
                coupon_plan_products {
                  id
                  product_id
                }
              }
            }
          }
          member_permission_extras {
            id
            permission_id
          }
          coin_statuses_aggregate {
            aggregate {
              sum {
                remaining
              }
            }
          }
          order_logs(where: { status: { _eq: "SUCCESS" } }) {
            order_products_aggregate {
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

  const memberAdmin:
    | (MemberAdminProps & {
        coupons: {
          status: {
            outdated: boolean
            used: boolean
          }
          couponPlan: CouponPlanProps & {
            productIds: string[]
          }
        }[]
        noAgreedContract: boolean
        permissionGroups: Pick<PermissionGroupProps, 'id' | 'name'>[]
      })
    | null =
    loading || error || !data || !data.member_by_pk
      ? null
      : {
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
          phones: data.member_by_pk.member_phones.map(v => v.phone).filter(v => v),
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
          coupons: data.member_by_pk.coupons.map(v => ({
            status: {
              outdated: !!v.status?.outdated,
              used: !!v.status?.used,
            },
            couponPlan: {
              id: v.coupon_code.coupon_plan.id,
              title: v.coupon_code.coupon_plan.title || '',
              description: v.coupon_code.coupon_plan.description || '',
              scope: v.coupon_code.coupon_plan.scope,
              type:
                v.coupon_code.coupon_plan.type === 1 ? 'cash' : v.coupon_code.coupon_plan.type === 2 ? 'percent' : null,
              amount: v.coupon_code.coupon_plan.amount,
              constraint: v.coupon_code.coupon_plan.constraint,
              startedAt: v.coupon_code.coupon_plan.started_at ? new Date(v.coupon_code.coupon_plan.started_at) : null,
              endedAt: v.coupon_code.coupon_plan.ended_at ? new Date(v.coupon_code.coupon_plan.ended_at) : null,
              productIds: v.coupon_code.coupon_plan.coupon_plan_products.map(v => v.product_id),
            },
          })),
          permissionIds: data.member_by_pk.member_permission_extras.map(v => v.permission_id),
          consumption: sum(
            data.member_by_pk.order_logs.map(orderLog => orderLog.order_products_aggregate.aggregate?.sum?.price || 0),
          ),
          coins: data.member_by_pk.coin_statuses_aggregate.aggregate?.sum?.remaining || 0,
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

  return {
    loadingMemberAdmin: loading,
    errorMemberAdmin: error,
    memberAdmin,
    refetchMemberAdmin: refetch,
  }
}

export const useMemberNotesAdmin = (
  orderBy: hasura.member_note_order_by,
  filters?: {
    member?: string
  },
  keyword?: string,
) => {
  const splittedOrderBy: Array<hasura.member_note_order_by> = Object.entries(orderBy).map(([key, value]) => ({
    [key as keyof Partial<hasura.member_note_order_by>]: value,
  }))
  const { permissions, currentMemberId } = useAuth()
  const condition: hasura.GET_MEMBER_NOTES_ADMINVariables['condition'] = {
    deleted_at: { _is_null: true },
    author: permissions.VIEW_ALL_MEMBER_NOTE
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
      query GET_MEMBER_NOTES_ADMIN($orderBy: [member_note_order_by!]!, $condition: member_note_bool_exp) {
        member_note_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member_note(where: $condition, order_by: $orderBy, limit: 10) {
          id
          created_at
          type
          status
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
            options
          }
        }
      }
    `,
    { variables: { condition, orderBy: splittedOrderBy } },
  )

  const notes: Pick<
    MemberNote,
    'id' | 'createdAt' | 'type' | 'status' | 'author' | 'member' | 'duration' | 'description' | 'note' | 'attachments'
  >[] =
    data?.member_note.map(v => ({
      id: v.id,
      createdAt: new Date(v.created_at),
      type: v.type as NoteAdminProps['type'],
      status: v.status || null,
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
        options: u.options,
      })),
    })) || []

  const loadMoreNotes =
    (data?.member_note_aggregate.aggregate?.count || 0) > 10
      ? () =>
          fetchMore({
            variables: {
              orderBy: splittedOrderBy,
              condition: {
                _or: [
                  { ...condition, created_at: { _lt: data?.member_note.slice(-1)[0]?.created_at } },
                  {
                    ...condition,
                    created_at: { _eq: data?.member_note.slice(-1)[0]?.created_at },
                    id: { _gt: data?.member_note.slice(-1)[0]?.id },
                  },
                ],
              },
            },
            updateQuery: (prev, { fetchMoreResult }) => {
              if (!fetchMoreResult) {
                return prev
              }
              const result = prev ? prev.member_note : []
              return {
                ...prev,
                member_note_aggregate: fetchMoreResult?.member_note_aggregate,
                member_note: [...result, ...fetchMoreResult.member_note],
              }
            },
          })
      : undefined

  return {
    loadingNotes: loading,
    errorNotes: error,
    notes,
    refetchNotes: refetch,
    loadMoreNotes,
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
  const conditionAll: hasura.GET_MEMBER_ROLE_COUNTVariables['conditionAll'] = {
    app_id: { _eq: appId },
    name: filter?.name ? { _ilike: `%${filter.name}%` } : undefined,
    email: filter?.email ? { _ilike: `%${filter.email}%` } : undefined,
    manager: filter?.managerName
      ? {
          name: { _ilike: `%${filter.managerName}%` },
        }
      : undefined,
    manager_id: filter?.managerId ? { _eq: filter.managerId } : undefined,
    member_phones: filter?.phone
      ? {
          phone: { _ilike: `%${filter.phone}%` },
        }
      : undefined,
    member_categories: filter?.category
      ? {
          category: {
            name: {
              _ilike: `%${filter.category}%`,
            },
          },
        }
      : undefined,
    member_tags: filter?.tag
      ? {
          tag_name: {
            _ilike: filter.tag,
          },
        }
      : undefined,
    member_permission_groups: filter?.permissionGroup
      ? {
          permission_group: { name: { _like: `${filter.permissionGroup}` } },
        }
      : undefined,
    _and: filter?.properties?.length
      ? filter.properties
          .filter(property => property.value)
          .map(property => ({
            member_properties: {
              property_id: { _eq: property.id },
              value: { _ilike: `%${property.value}%` },
            },
          }))
      : undefined,
  }
  const conditionAppOwner: hasura.GET_MEMBER_ROLE_COUNTVariables['conditionAppOwner'] = {
    role: { _eq: 'app-owner' },
    ...conditionAll,
  }
  const conditionContentCreator: hasura.GET_MEMBER_ROLE_COUNTVariables['conditionContentCreator'] = {
    role: { _eq: 'content-creator' },
    ...conditionAll,
  }
  const conditionGeneralMember: hasura.GET_MEMBER_ROLE_COUNTVariables['conditionGeneralMember'] = {
    role: { _eq: 'general-member' },
    ...conditionAll,
  }

  const { loading, error, data, refetch } = useQuery<
    hasura.GET_MEMBER_ROLE_COUNT,
    hasura.GET_MEMBER_ROLE_COUNTVariables
  >(
    gql`
      query GET_MEMBER_ROLE_COUNT(
        $conditionAll: member_bool_exp
        $conditionAppOwner: member_bool_exp
        $conditionContentCreator: member_bool_exp
        $conditionGeneralMember: member_bool_exp
      ) {
        all: member_aggregate(where: $conditionAll) {
          aggregate {
            count
          }
        }
        app_owner: member_aggregate(where: $conditionAppOwner) {
          aggregate {
            count
          }
        }
        content_creator: member_aggregate(where: $conditionContentCreator) {
          aggregate {
            count
          }
        }
        general_member: member_aggregate(where: $conditionGeneralMember) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        conditionAll,
        conditionAppOwner,
        conditionContentCreator,
        conditionGeneralMember,
      },
    },
  )

  const menu: {
    role: string | null
    count: number
    intlKey: { id: string; defaultMessage: string }
  }[] = [
    {
      role: null,
      count: data?.all?.aggregate?.count || 0,
      intlKey: commonMessages.label.allMembers,
    },
    {
      role: 'app-owner',
      count: data?.app_owner?.aggregate?.count || 0,
      intlKey: commonMessages.label.appOwner,
    },
    {
      role: 'content-creator',
      count: data?.content_creator?.aggregate?.count || 0,
      intlKey: commonMessages.label.contentCreator,
    },
    {
      role: 'general-member',
      count: data?.general_member?.aggregate?.count || 0,
      intlKey: commonMessages.label.generalMember,
    },
  ]

  return {
    loading,
    error,
    menu,
    refetch,
  }
}

export const useMemberCollection = (filter?: {
  role?: UserRole
  name?: string
  username?: string
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
  permissionGroup?: string | null
}) => {
  const { id: appId } = useApp()
  const condition: hasura.GetMemberCollectionVariables['condition'] = {
    app_id: { _eq: appId },
    role: filter?.role ? { _eq: filter.role } : undefined,
    name: filter?.name ? { _ilike: `%${filter.name}%` } : undefined,
    username: filter?.username ? { _ilike: `%${filter.username}%` } : undefined,
    email: filter?.email ? { _ilike: `%${filter.email}%` } : undefined,
    manager: filter?.managerName
      ? {
          name: { _ilike: `%${filter.managerName}%` },
        }
      : undefined,
    manager_id: filter?.managerId ? { _eq: filter.managerId } : undefined,
    member_phones: filter?.phone
      ? {
          phone: { _ilike: `%${filter.phone}%` },
        }
      : undefined,
    member_categories: filter?.category
      ? {
          category: {
            name: {
              _ilike: `%${filter.category}%`,
            },
          },
        }
      : undefined,
    member_tags: filter?.tag
      ? {
          tag_name: {
            _ilike: filter.tag,
          },
        }
      : undefined,
    member_permission_groups: filter?.permissionGroup
      ? {
          permission_group: { name: { _like: `${filter.permissionGroup}` } },
        }
      : undefined,
    _and: filter?.properties?.length
      ? filter.properties
          .filter(property => property.value)
          .map(property => ({
            member_properties: {
              property_id: { _eq: property.id },
              value: { _ilike: `%${property.value}%` },
            },
          }))
      : undefined,
  }

  const {
    loading: loadingMemberAggregate,
    error: errorMemberAggregate,
    data: memberAggregateData,
    refetch: refetchMemberAggregate,
  } = useQuery<hasura.GetMemberAggregate, hasura.GetMemberAggregateVariables>(
    gql`
      query GetMemberAggregate($condition: member_bool_exp) {
        member_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { condition } },
  )

  const {
    loading: loadingMemberCollection,
    error: errorMemberCollection,
    data: memberCollectionData,
    refetch: refetchMemberCollection,
    fetchMore: fetchMoreMemberCollection,
  } = useQuery<hasura.GetMemberCollection, hasura.GetMemberCollectionVariables>(
    gql`
      query GetMemberCollection($condition: member_bool_exp, $limit: Int!) {
        member(where: $condition, order_by: [{ created_at: desc_nulls_last }, { id: asc }], limit: $limit) {
          id
          picture_url
          name
          email
          role
          created_at
          username
          logined_at
          manager_id
        }
      }
    `,
    {
      variables: {
        condition,
        limit: 10,
      },
    },
  )

  const { loading: loadingMemberPhones, data: memberPhonesData } = useQuery<
    hasura.GetMemberPhones,
    hasura.GetMemberPhonesVariables
  >(
    gql`
      query GetMemberPhones($memberIdList: [String!]) {
        member_phone(where: { member_id: { _in: $memberIdList } }) {
          id
          phone
        }
      }
    `,
    { variables: { memberIdList: memberCollectionData?.member.map(v => v.id) } },
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
    { variables: { memberIdList: memberCollectionData?.member.map(v => v.id) } },
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
    { variables: { managerIdList: memberCollectionData?.member.map(v => v.manager_id).filter(notEmpty) } },
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
    { variables: { memberIdList: memberCollectionData?.member.map(v => v.id) } },
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
      variables: { memberIdList: memberCollectionData?.member.map(v => v.id) },
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
      variables: { memberIdList: memberCollectionData?.member.map(v => v.id) },
    },
  )
  const managers: { id: string; name: string }[] = managerInfoData?.member.map(v => ({ id: v.id, name: v.name })) || []

  const memberOrderProductPrice: { memberId: string; price: number }[] =
    memberOrderProductPriceData?.order_log.map(v => ({
      memberId: v.member_id,
      price: v.order_products_aggregate.aggregate?.sum?.price || 0,
    })) || []

  let members: MemberInfoProps[] =
    memberCollectionData?.member.map(v => ({
      id: v.id,
      avatarUrl: v.picture_url || null,
      name: v.name,
      username: v.username,
      email: v.email,
      role: v.role as UserRole,
      createdAt: v.created_at ? new Date(v.created_at) : null,
      loginedAt: v.logined_at ? new Date(v.logined_at) : null,
      phones: [],
      consumption: 0,
      manager: null,
      categories: [],
      tags: [],
      properties: null,
    })) || []

  const loadMoreMembers = () =>
    fetchMoreMemberCollection({
      variables: {
        condition: {
          _and: [
            condition,
            {
              _or: [
                {
                  _and: [
                    { created_at: { _eq: memberCollectionData?.member.slice(-1)[0]?.created_at } },
                    { id: { _gt: memberCollectionData?.member.slice(-1)[0]?.id } },
                  ],
                },
                { created_at: { _lt: memberCollectionData?.member.slice(-1)[0]?.created_at } },
              ],
            },
          ],
        },
        limit: 10,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        return Object.assign({}, prev, {
          member: [...prev.member, ...fetchMoreResult.member],
        })
      },
    })

  members.forEach(member => ({
    ...member,
    phones: memberPhonesData?.member_phone.map(memberPhone => memberPhone.phone),
    manager: managers.filter(manager => manager.id === member.id),
    consumption: sum(
      memberOrderProductPrice
        .filter(memberOrderProduct => memberOrderProduct.memberId === member.id)
        .map(memberOrderProduct => memberOrderProduct.price),
    ),
    categories: memberCategoriesData?.member_category
      .filter(memberCategory => memberCategory.member_id === member.id)
      .map(memberCategory => ({
        id: memberCategory.category.id,
        name: memberCategory.category.name,
      })),
    tags: memberTagsData?.member_tag
      .filter(memberTag => memberTag.member_id === member.id)
      .map(memberTag => memberTag.tag_name),
    properties: memberPropertiesData?.member_property
      .filter(memberProperty => memberProperty.member_id === member.id)
      .reduce((acc, cur) => {
        return { ...acc, [cur.property_id]: cur.value }
      }, {} as MemberInfoProps['properties']),
  }))

  return {
    loadingMemberAggregate,
    loadingMemberCollection,
    loadingMemberPhones,
    loadingManagerInfo,
    loadingMemberOrderProductPrice,
    loadingMemberCategories,
    loadingMemberTags,
    loadingMemberProperties,
    errorMemberCollection,
    errorMemberAggregate,
    members,
    refetchMemberAggregate,
    refetchMemberCollection,
    refetchMemberOrderProductPrice,
    refetchMemberCategories,
    refetchMemberTags,
    refetchMemberProperties,
    loadMoreMembers: (memberAggregateData?.member_aggregate?.aggregate?.count || 0) > 10 ? loadMoreMembers : undefined,
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
    { variables: { type: 'member' } },
  )

  const properties =
    data?.property.map(v => ({
      id: v.id,
      name: v.name,
      placeholder: v.placeholder?.replace(/[()]/g, ''),
      isEditable: v.is_editable,
      isRequired: v.is_required,
    })) || []

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
