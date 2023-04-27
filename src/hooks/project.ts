import { useLazyQuery, useMutation } from '@apollo/client'
import { gql } from '@apollo/client'
import hasura from '../hasura'

export const useProject = () => {
  const [insertProject] = useMutation<hasura.INSERT_PROJECT, hasura.INSERT_PROJECTVariables>(gql`
    mutation INSERT_PROJECT(
      $appId: String!
      $title: String!
      $memberId: String!
      $type: String!
      $projectCategories: [project_category_insert_input!]!
    ) {
      insert_project(
        objects: {
          app_id: $appId
          title: $title
          creator_id: $memberId
          type: $type
          project_categories: { data: $projectCategories }
        }
      ) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  const [insertProjectRole] = useMutation<hasura.INSERT_PROJECT_ROLE, hasura.INSERT_PROJECT_ROLEVariables>(gql`
    mutation INSERT_PROJECT_ROLE(
      $projectId: uuid!
      $memberId: String!
      $identityId: uuid!
      $hasSendedMarkedNotification: Boolean
    ) {
      insert_project_role(
        objects: {
          project_id: $projectId
          member_id: $memberId
          identity_id: $identityId
          agreed_at: "now()"
          has_sended_marked_notification: $hasSendedMarkedNotification
        }
      ) {
        affected_rows
        returning {
          id
        }
      }
    }
  `)

  const [updateProjectRole] = useMutation<hasura.UPDATE_PROJECT_ROLE, hasura.UPDATE_PROJECT_ROLEVariables>(gql`
    mutation UPDATE_PROJECT_ROLE(
      $id: uuid!
      $memberId: String!
      $identityId: uuid!
      $hasSendedMarkedNotification: Boolean!
    ) {
      update_project_role_by_pk(
        pk_columns: { id: $id }
        _set: {
          member_id: $memberId
          identity_id: $identityId
          has_sended_marked_notification: $hasSendedMarkedNotification
        }
      ) {
        member_id
        identity_id
      }
    }
  `)

  const [updateHasSendNotification] = useMutation<
    hasura.UPDATE_HAS_SENDED_NOTIFICATION,
    hasura.UPDATE_HAS_SENDED_NOTIFICATIONVariables
  >(gql`
    mutation UPDATE_HAS_SENDED_NOTIFICATION($projectId: uuid!) {
      update_project_role(where: { project_id: { _eq: $projectId } }, _set: { has_sended_marked_notification: true }) {
        affected_rows
      }
    }
  `)

  const [deleteProjectRole] = useMutation<hasura.DELETE_PROJECT_ROLE, hasura.DELETE_PROJECT_ROLEVariables>(gql`
    mutation DELETE_PROJECT_ROLE($projectRoleId: uuid!) {
      delete_project_role(where: { id: { _eq: $projectRoleId } }) {
        affected_rows
      }
    }
  `)

  const [agreeProjectRole] = useMutation<hasura.AGREE_PROJECT_ROLE, hasura.AGREE_PROJECT_ROLEVariables>(gql`
    mutation AGREE_PROJECT_ROLE($projectRoleId: uuid!) {
      update_project_role_by_pk(
        pk_columns: { id: $projectRoleId }
        _set: { agreed_at: "now()", has_sended_marked_notification: true }
      ) {
        id
      }
    }
  `)

  const [rejectProjectRole] = useMutation<hasura.REJECT_PROJECT_ROLE, hasura.REJECT_PROJECT_ROLEVariables>(gql`
    mutation REJECT_PROJECT_ROLE($projectRoleId: uuid!, $rejectedReason: String) {
      update_project_role_by_pk(
        pk_columns: { id: $projectRoleId }
        _set: { rejected_reason: $rejectedReason, rejected_at: "now()" }
      ) {
        id
      }
    }
  `)

  const [loadProjectParticipant, { called, loading, data: getProjectParticipantData, refetch }] = useLazyQuery<
    hasura.GET_PROJECT_PARTICIPANT,
    hasura.GET_PROJECT_PARTICIPANTVariables
  >(gql`
    query GET_PROJECT_PARTICIPANT($projectId: uuid!) {
      project_role(
        where: {
          project_id: { _eq: $projectId }
          identity: { name: { _neq: "author" } }
          rejected_at: { _is_null: true }
        }
        order_by: { identity: { position: asc } }
      ) {
        id
        created_at
        agreed_at
        member {
          id
          name
          email
          picture_url
          created_at
          status
        }
        identity {
          id
          name
        }
      }
    }
  `)

  return {
    getProjectParticipantData: (projectId: string) => {
      if (!called) {
        loadProjectParticipant({ variables: { projectId: projectId } })
      }

      const participantList = getProjectParticipantData?.project_role.map(projectRole => ({
        projectRoleId: projectRole.id,
        member: {
          id: projectRole.member?.id || '',
          email: projectRole.member?.email || '',
          name: projectRole.member?.name || '',
          pictureUrl: projectRole.member?.picture_url || '',
          status: projectRole.member?.status || 'invited',
        },
        identity: { id: projectRole.identity.id, name: projectRole.identity.name },
        agreedAt: projectRole.agreed_at,
        createdAt: projectRole.created_at,
      }))

      return {
        participantList: participantList,
        participantListLoading: loading,
        participantListRefetch: refetch,
      }
    },
    insertProject,
    insertProjectRole,
    updateProjectRole,
    deleteProjectRole,
    agreeProjectRole,
    rejectProjectRole,
    updateHasSendNotification,
  }
}
