import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import types from '../types'
import { Member, MemberPublic } from '../types/general'

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

  const member: Member =
    loading || error || !data
      ? {
          id: '',
          name: '',
          email: '',
          username: '',
          pictureUrl: '',
          description: '',
          abstract: '',
          title: '',
          memberTags: [],
          role: '',
        }
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

  const member: MemberPublic = loading || error || !data
  ? {
    id: '',
    name: '',
    username: '',
    pictureUrl: '',
    description: '',
    role: ''
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
