import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import { commonMessages } from '../helpers/translation'
import types from '../types'
import {
  MemberAdminProps,
  MemberInfoProps,
  MemberNoteAdminProps,
  MemberOptionProps,
  MemberProps,
  MemberPublicProps,
  UserRole,
} from '../types/member'
import { useState } from 'react'

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
          member_specialities {
            id
            tag_name
          }
          member_tags {
            id
            tag_name
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
          member_tags {
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
          member_properties {
            id
            property {
              id
              name
            }
            value
          }
          member_notes(order_by: { updated_at: desc }) {
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
          member_permission_extras {
            id
            permission {
              id
            }
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
        }
      }
    `,
    { variables: { memberId } },
  )

  const memberAdmin: MemberAdminProps | null =
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
          tags: data.member_by_pk.member_tags.map(v => v.tag_name),
          specialities: data.member_by_pk.member_specialities.map(v => v.tag_name),
          phones: data.member_by_pk.member_phones.map(v => v.phone).filter(v => v),
          properties: data.member_by_pk.member_properties.map(v => ({
            id: v.property.id,
            name: v.property.name,
            value: v.value,
          })),
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
          permissionIds: data.member_by_pk.member_permission_extras.map(v => v.permission.id),
          consumption: sum(
            data.member_by_pk.order_logs.map(orderLog => orderLog.order_products_aggregate.aggregate?.sum?.price || 0),
          ),
          coins: data.member_by_pk.coin_logs_aggregate.aggregate?.sum?.amount || 0,
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

  const [updateMemberNote] = useMutation(gql`
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

export const useMemberRoleCount = ({
  appId,
  nameSearch = null,
  emailSearch = null,
}: {
  appId: string
  nameSearch?: string | null
  emailSearch?: string | null
}) => {
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
        name: nameSearch && `%${nameSearch}%`,
        email: emailSearch && `%${emailSearch}%`,
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
        text: commonMessages.label.allMembers,
      },
      {
        role: 'app-owner',
        count: count.appOwner,
        text: commonMessages.term.appOwner,
      },
      {
        role: 'content-creator',
        count: count.contentCreator,
        text: commonMessages.term.contentCreator,
      },
      {
        role: 'general-member',
        count: count.generalMember,
        text: commonMessages.term.generalMember,
      },
    ],
    refetch,
  }
}

export const useMemberCollection = ({
  role,
  nameSearch = null,
  emailSearch = null,
}: {
  role: UserRole | null
  nameSearch?: string | null
  emailSearch?: string | null
}) => {
  const [isNoMore, setIsNoMore] = useState(false)
  const { loading, error, data, refetch, fetchMore } = useQuery<
    types.GET_PAGE_MEMBER_COLLECTION,
    types.GET_PAGE_MEMBER_COLLECTIONVariables
  >(
    gql`
      query GET_PAGE_MEMBER_COLLECTION($role: String, $name: String, $email: String, $offset: Int!, $limit: Int!) {
        member(
          where: { _and: [{ role: { _eq: $role } }, { name: { _ilike: $name } }, { email: { _ilike: $email } }] }
          order_by: { created_at: desc, id: asc }
          offset: $offset
          limit: $limit
        ) {
          id
          picture_url
          name
          username
          email
          created_at
          logined_at
          role
          member_phones {
            id
            phone
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
        role,
        name: nameSearch && `%${nameSearch}%`,
        email: emailSearch && `%${emailSearch}%`,
        offset: 0,
        limit: 10,
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
          phones: v.member_phones.map(v => v.phone),
          consumption: sum(
            v.order_logs.map((orderLog: any) => orderLog.order_products_aggregate.aggregate.sum.price || 0),
          ),
        }))

  const loadMoreMembers = () =>
    fetchMore({
      variables: {
        role,
        name: nameSearch && `%${nameSearch}%`,
        email: emailSearch && `%${emailSearch}%`,
        offset: data?.member.length || 0,
        limit: 10,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) {
          return prev
        }
        if (fetchMoreResult.member.length < 10) {
          setIsNoMore(true)
        }
        return Object.assign({}, prev, {
          member: [...prev.member, ...fetchMoreResult.member],
        })
      },
    })

  return {
    loading,
    error,
    members,
    refetch,
    loadMoreMembers: isNoMore ? undefined : loadMoreMembers,
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

export const useUpdateMemberAccount = () => {
  const [updateMemberAccount] = useMutation<types.UPDATE_MEMBER_ACCOUNT, types.UPDATE_MEMBER_ACCOUNTVariables>(
    gql`
      mutation UPDATE_MEMBER_ACCOUNT(
        $memberId: String
        $name: String
        $description: String
        $username: String
        $email: String
        $pictureUrl: String
      ) {
        update_member(
          where: { id: { _eq: $memberId } }
          _set: { name: $name, description: $description, username: $username, email: $email, picture_url: $pictureUrl }
        ) {
          affected_rows
        }
      }
    `,
  )

  return updateMemberAccount
}

export const useProperty = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROPERTY, types.GET_PROPERTYVariables>(
    gql`
      query GET_PROPERTY($type: String!) {
        property(where: { type: { _eq: $type } }, order_by: { position: asc }) {
          id
          name
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
        }))

  return {
    loadingProperties: loading,
    errorProperties: error,
    properties,
    refetchProperties: refetch,
  }
}
