import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { sum } from 'ramda'
import { MemberInfoProps } from '../components/common/MemberAdminModal'
import { commonMessages } from '../helpers/translation'
import types from '../types'
import { MemberOptionProps, MemberProps, MemberPublicProps, UserRole } from '../types/general'

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
    loading || error || !data
      ? null
      : {
          id: data?.member_by_pk?.id || '',
          name: data?.member_by_pk?.name || '',
          email: data?.member_by_pk?.email || '',
          username: data?.member_by_pk?.username || '',
          pictureUrl: data?.member_by_pk?.picture_url || '',
          description: data?.member_by_pk?.description || '',
          abstract: data?.member_by_pk?.abstract || '',
          title: data?.member_by_pk?.title || '',
          memberTags: data?.member_by_pk?.member_tags.map(tag => ({
            id: tag.id || '',
            tagName: tag.tag_name || '',
          })),
          role: data?.member_by_pk?.role || '',
        }

  return {
    member,
    errorMember: error,
    loadingMember: loading,
    refetchMember: refetch,
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
  offset = 0,
  limit = null,
  nameSearch = null,
  emailSearch = null,
}: {
  role: UserRole | null
  offset?: number
  limit?: number | null
  nameSearch?: string | null
  emailSearch?: string | null
}) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_PAGE_MEMBER_COLLECTION,
    types.GET_PAGE_MEMBER_COLLECTIONVariables
  >(
    gql`
      query GET_PAGE_MEMBER_COLLECTION($offset: Int!, $limit: Int, $role: String, $email: String, $name: String) {
        member(
          limit: $limit
          offset: $offset
          where: { _and: [{ role: { _eq: $role } }, { name: { _like: $name } }, { email: { _like: $email } }] }
        ) {
          id
          picture_url
          name
          username
          email
          logined_at
          role
          point_status {
            points
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
        offset,
        limit,
        name: nameSearch && `%${nameSearch}%`,
        email: emailSearch && `%${emailSearch}%`,
      },
    },
  )

  const dataSource: MemberInfoProps[] =
    loading || error || !data
      ? []
      : data.member
          .map(member => ({
            id: member.id,
            avatarUrl: member.picture_url,
            name: member.name || member.username,
            email: member.email,
            loginedAt: member.logined_at ? new Date(member.logined_at) : null,
            role: member.role as UserRole,
            points: member.point_status ? member.point_status.points : 0,
            consumption: sum(
              member.order_logs.map((orderLog: any) => orderLog.order_products_aggregate.aggregate.sum.price || 0),
            ),
          }))
          .sort((a, b) => (b.loginedAt ? b.loginedAt.getTime() : 0) - (a.loginedAt ? a.loginedAt.getTime() : 0))

  return {
    loading,
    error,
    dataSource,
    refetch,
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

export const useUpdateMemberBasic = () => {
  const [updateMemberBasic] = useMutation<types.UPDATE_MEMBER_BASIC, types.UPDATE_MEMBER_BASICVariables>(
    gql`
      mutation UPDATE_MEMBER_BASIC(
        $memberId: String
        $name: String
        $description: String
        $username: String
        $email: String
        $pictureUrl: String
        $title: String
        $abstract: String
        $tags: [tag_insert_input!]!
        $memberTags: [member_tag_insert_input!]!
      ) {
        update_member(
          where: { id: { _eq: $memberId } }
          _set: {
            name: $name
            description: $description
            username: $username
            email: $email
            picture_url: $pictureUrl
            title: $title
            abstract: $abstract
          }
        ) {
          affected_rows
        }
        delete_member_tag(where: { member_id: { _eq: $memberId } }) {
          affected_rows
        }
        insert_tag(objects: $tags, on_conflict: { constraint: tag_pkey, update_columns: [updated_at] }) {
          affected_rows
        }
        insert_member_tag(objects: $memberTags) {
          affected_rows
        }
      }
    `,
  )

  return updateMemberBasic
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
