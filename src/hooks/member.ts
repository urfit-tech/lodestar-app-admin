import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import { commonMessages } from '../helpers/translation'
import types from '../types'
import { CouponPlanProps } from '../types/checkout'
import {
  MemberAdminProps,
  MemberInfoProps,
  MemberNoteAdminProps,
  MemberOptionProps,
  MemberProps,
  MemberPublicProps,
  UserRole,
} from '../types/member'

export const useMember = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<types.GET_MEMBER, types.GET_MEMBERVariables>(
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
  const { loading, error, data, refetch } = useQuery<
    types.GET_MEMBER_DESCRIPTION,
    types.GET_MEMBER_DESCRIPTIONVariables
  >(
    gql`
      query GET_MEMBER_DESCRIPTION($memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          picture_url
          username
          name
          email
          role
          created_at
          logined_at
          assigned_at
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
          member_notes(order_by: { created_at: desc }) {
            id
            type
            status
            duration
            description
            created_at
            author {
              id
              name
              picture_url
            }
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
          coin_logs_aggregate {
            aggregate {
              sum {
                amount
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
        }
      }
    `,
    { variables: { memberId } },
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
      })
    | null =
    loading || error || !data || !data.member_by_pk
      ? null
      : {
          id: data.member_by_pk.id,
          avatarUrl: data.member_by_pk.picture_url,
          username: data.member_by_pk.username,
          name: data.member_by_pk.name,
          email: data.member_by_pk.email,
          role: data.member_by_pk.role as UserRole,
          createdAt: new Date(data.member_by_pk.created_at),
          loginedAt: data.member_by_pk.logined_at && new Date(data.member_by_pk.logined_at),
          assignedAt: data.member_by_pk.assigned_at && new Date(data.member_by_pk.assigned_at),
          manager: data.member_by_pk.manager
            ? {
                id: data.member_by_pk.manager.id,
                email: data.member_by_pk.manager.email,
                name: data.member_by_pk.manager.name,
                avatarUrl: data.member_by_pk.manager.picture_url,
              }
            : null,
          tags: data.member_by_pk.member_tags.map(v => v.tag_name),
          specialities: data.member_by_pk.member_specialities.map(v => v.tag_name),
          phones: data.member_by_pk.member_phones.map(v => v.phone).filter(v => v),
          notes: data.member_by_pk.member_notes.map(v => ({
            id: v.id,
            type: v.type as MemberNoteAdminProps['type'],
            status: v.status,
            duration: v.duration,
            description: v.description,
            createdAt: new Date(v.created_at),
            author: {
              name: v.author.name,
              pictureUrl: v.author.picture_url,
            },
          })),
          coupons: data.member_by_pk.coupons.map(v => ({
            status: {
              outdated: !!v.status?.outdated,
              used: !!v.status?.used,
            },
            couponPlan: {
              id: v.coupon_code.coupon_plan.id,
              title: v.coupon_code.coupon_plan.title,
              description: v.coupon_code.coupon_plan.description,
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
          coins: data.member_by_pk.coin_logs_aggregate.aggregate?.sum?.amount || 0,
          categories: data.member_by_pk.member_categories.map(v => ({
            id: v.category.id,
            name: v.category.name,
          })),
        }

  return {
    loadingMemberAdmin: loading,
    errorMemberAdmin: error,
    memberAdmin,
    refetchMemberAdmin: refetch,
  }
}

export const useMutateMemberNote = () => {
  const [insertMemberNote] = useMutation(gql`
    mutation INSERT_MEMBER_NOTE(
      $memberId: String!
      $authorId: String!
      $type: String
      $status: String
      $duration: Int
      $description: String
    ) {
      insert_member_note_one(
        object: {
          member_id: $memberId
          author_id: $authorId
          type: $type
          status: $status
          duration: $duration
          description: $description
        }
      ) {
        id
      }
    }
  `)

  const [updateMemberNote] = useMutation<types.UPDATE_MEMBER_NOTE, types.UPDATE_MEMBER_NOTEVariables>(gql`
    mutation UPDATE_MEMBER_NOTE(
      $memberNoteId: String!
      $type: String
      $status: String
      $duration: Int
      $description: String
    ) {
      update_member_note_by_pk(
        pk_columns: { id: $memberNoteId }
        _set: { type: $type, status: $status, duration: $duration, description: $description }
      ) {
        id
      }
    }
  `)

  const [deleteMemberNote] = useMutation(gql`
    mutation DELETE_MEMBER_NOTE($memberNoteId: String!) {
      delete_member_note_by_pk(id: $memberNoteId) {
        id
      }
    }
  `)

  return {
    insertMemberNote,
    updateMemberNote,
    deleteMemberNote,
  }
}

export const usePublicMember = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<types.GET_PUBLIC_MEMBER, types.GET_PUBLIC_MEMBERVariables>(
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

export const useMemberRoleCount = (appId: string, filter?: { name?: string; email?: string }) => {
  const { loading, error, data, refetch } = useQuery<types.GET_MEMBER_ROLE_COUNT, types.GET_MEMBER_ROLE_COUNTVariables>(
    gql`
      query GET_MEMBER_ROLE_COUNT($appId: String, $email: String, $name: String) {
        all: member_aggregate(
          where: { _and: [{ app_id: { _eq: $appId } }, { name: { _like: $name } }, { email: { _like: $email } }] }
        ) {
          aggregate {
            count
          }
        }
        app_owner: member_aggregate(
          where: {
            _and: [
              { app_id: { _eq: $appId } }
              { role: { _eq: "app-owner" } }
              { name: { _like: $name } }
              { email: { _like: $email } }
            ]
          }
        ) {
          aggregate {
            count
          }
        }
        content_creator: member_aggregate(
          where: {
            _and: [
              { app_id: { _eq: $appId } }
              { role: { _eq: "content-creator" } }
              { name: { _like: $name } }
              { email: { _like: $email } }
            ]
          }
        ) {
          aggregate {
            count
          }
        }
        general_member: member_aggregate(
          where: {
            _and: [
              { app_id: { _eq: $appId } }
              { role: { _eq: "general-member" } }
              { name: { _like: $name } }
              { email: { _like: $email } }
            ]
          }
        ) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        appId,
        name: filter?.name && `%${filter.name}%`,
        email: filter?.email && `%${filter.email}%`,
      },
    },
  )

  const count =
    loading || error || !data
      ? {
          all: 0,
          appOwner: 0,
          contentCreator: 0,
          generalMember: 0,
        }
      : {
          all: data?.all?.aggregate?.count || 0,
          appOwner: data?.app_owner?.aggregate?.count || 0,
          contentCreator: data?.content_creator?.aggregate?.count || 0,
          generalMember: data?.general_member?.aggregate?.count || 0,
        }

  return {
    loading,
    error,
    menu: [
      {
        role: null,
        count: count.all,
        intlKey: commonMessages.label.allMembers,
      },
      {
        role: 'app-owner',
        count: count.appOwner,
        intlKey: commonMessages.term.appOwner,
      },
      {
        role: 'content-creator',
        count: count.contentCreator,
        intlKey: commonMessages.term.contentCreator,
      },
      {
        role: 'general-member',
        count: count.generalMember,
        intlKey: commonMessages.term.generalMember,
      },
    ],
    refetch,
  }
}

export const useMemberCollection = (filter?: {
  role?: UserRole
  name?: string
  email?: string
  phone?: string
  category?: string
  managerName?: string
  tag?: string
  properties?: {
    id: string
    value?: string
  }[]
}) => {
  const condition: types.GET_PAGE_MEMBER_COLLECTIONVariables['condition'] = {
    role: filter?.role ? { _eq: filter.role } : undefined,
    name: filter?.name ? { _ilike: `%${filter.name}%` } : undefined,
    email: filter?.email ? { _ilike: `%${filter.email}%` } : undefined,
    manager: filter?.managerName
      ? {
          name: { _ilike: `%${filter.managerName}%` },
        }
      : undefined,
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
    member_properties: filter?.properties?.length
      ? {
          _and: filter.properties
            .filter(property => property.value)
            .map(property => ({
              property_id: { _eq: property.id },
              value: { _ilike: `%${property.value}%` },
            })),
        }
      : undefined,
  }

  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_PAGE_MEMBER_COLLECTION,
    types.GET_PAGE_MEMBER_COLLECTIONVariables
  >(
    gql`
      query GET_PAGE_MEMBER_COLLECTION($condition: member_bool_exp, $limit: Int!) {
        member_aggregate(where: $condition) {
          aggregate {
            count
          }
        }
        member(where: $condition, order_by: { created_at: desc_nulls_last }, limit: $limit) {
          id
          picture_url
          name
          username
          email
          created_at
          logined_at
          role
          manager {
            id
            name
          }
          assigned_at
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
          member_tags {
            id
            tag_name
          }
          member_properties {
            id
            property_id
            value
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
        }
      }
    `,
    {
      variables: {
        condition,
        limit: 10,
      },
      context: {
        important: true,
      },
    },
  )

  const members: MemberInfoProps[] =
    loading || error || !data
      ? []
      : data.member.map(v => ({
          id: v.id,
          avatarUrl: v.picture_url,
          name: v.name || v.username,
          email: v.email,
          role: v.role as UserRole,
          createdAt: v.created_at ? new Date(v.created_at) : null,
          loginedAt: v.logined_at,
          manager: v.manager,
          assignedAt: v.assigned_at,
          phones: v.member_phones.map(v => v.phone),
          consumption: sum(
            v.order_logs.map((orderLog: any) => orderLog.order_products_aggregate.aggregate.sum.price || 0),
          ),
          categories: v.member_categories.map(w => ({
            id: w.category.id,
            name: w.category.name,
          })),
          tags: v.member_tags.map(w => w.tag_name),
          properties: v.member_properties.reduce((accumulator, currentValue) => {
            return {
              ...accumulator,
              [currentValue.property_id]: currentValue.value,
            }
          }, {} as MemberInfoProps['properties']),
        }))

  const loadMoreMembers = () =>
    fetchMore({
      variables: {
        condition: {
          ...condition,
          created_at: { _lt: data?.member.slice(-1)[0]?.created_at },
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

  return {
    loadingMembers: loading,
    errorMembers: error,
    members,
    refetchMembers: refetch,
    loadMoreMembers: (data?.member_aggregate.aggregate?.count || 0) > 10 ? loadMoreMembers : undefined,
  }
}

export const useMemberSummaryCollection = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_MEMBER_SUMMARY_COLLECTION>(
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
          avatarUrl: member.picture_url,
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
  const { loading, error, data, refetch } = useQuery<types.GET_PROPERTY, types.GET_PROPERTYVariables>(
    gql`
      query GET_PROPERTY($type: String!) {
        property(where: { type: { _eq: $type } }, order_by: { position: asc }) {
          id
          name
          placeholder
        }
      }
    `,
    { variables: { type: 'member' } },
  )

  const properties =
    loading || error || !data
      ? []
      : data.property.map(v => ({
          id: v.id,
          name: v.name,
          placeholder: v.placeholder?.replaceAll(/[()]/g, ''),
        }))

  return {
    loadingProperties: loading,
    errorProperties: error,
    properties,
    refetchProperties: refetch,
  }
}
