import { useMutation, useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import { array, number, object } from 'yup'
import { memberSchema } from '../schemas/general'
import types from '../types'

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
        }
      }
    `,
    { variables: { memberId } },
  )
  return {
    member: object({ memberByPk: memberSchema.nullable() })
      .camelCase()
      .cast(data).memberByPk,
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
          metadata
          description
          role
        }
      }
    `,
    { variables: { memberId } },
  )
  return {
    member:
      loading || error
        ? null
        : object({ memberPublic: array(memberSchema).default([]) })
            .camelCase()
            .cast(data).memberPublic[0],
    loadingMember: loading,
    refetchMember: refetch,
  }
}

export const useMemberPoint = (memberId: string) => {
  const { loading, data, refetch } = useQuery<types.GET_MEMBER_POINT, types.GET_MEMBER_POINTVariables>(
    gql`
      query GET_MEMBER_POINT($memberId: String!) {
        point_status(where: { member_id: { _eq: $memberId } }) {
          points
        }
      }
    `,
    { variables: { memberId } },
  )
  const castData = object({
    pointStatus: array(object({ points: number() }).default([])),
  })
    .camelCase()
    .cast(data)
  let numPoints: number
  try {
    numPoints = castData.pointStatus[0].points
  } catch {
    numPoints = 0
  }
  return {
    numPoints,
    loadingMemberPoint: loading,
    refetchMemberPoint: refetch,
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
