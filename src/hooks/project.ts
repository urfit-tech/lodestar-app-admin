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
      $markedNotificationStatus: String!
    ) {
      insert_project_role(
        objects: {
          project_id: $projectId
          member_id: $memberId
          identity_id: $identityId
          agreed_at: "now()"
          marked_notification_status: $markedNotificationStatus
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
      $markedNotificationStatus: String!
    ) {
      update_project_role_by_pk(
        pk_columns: { id: $id }
        _set: { member_id: $memberId, identity_id: $identityId, marked_notification_status: $markedNotificationStatus }
      ) {
        member_id
        identity_id
      }
    }
  `)

  const [updateMarkedNotificationStatus] = useMutation<
    hasura.updateMarkedNotificationStatus,
    hasura.updateMarkedNotificationStatusVariables
  >(gql`
    mutation updateMarkedNotificationStatus($projectId: uuid!, $oldStatus: String!, $newStatus: String!) {
      update_project_role(
        where: {
          project_id: { _eq: $projectId }
          agreed_at: { _is_null: false }
          marked_notification_status: { _eq: $oldStatus }
        }
        _set: { marked_notification_status: $newStatus }
      ) {
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
    mutation AGREE_PROJECT_ROLE($projectRoleId: uuid!, $markedNotificationStatus: String!) {
      update_project_role_by_pk(
        pk_columns: { id: $projectRoleId }
        _set: { agreed_at: "now()", marked_notification_status: $markedNotificationStatus }
      ) {
        id
      }
    }
  `)

  const [rejectProjectRole] = useMutation<hasura.REJECT_PROJECT_ROLE, hasura.REJECT_PROJECT_ROLEVariables>(gql`
    mutation REJECT_PROJECT_ROLE($projectRoleId: uuid!, $rejectedReason: String, $markedNotificationStatus: String) {
      update_project_role_by_pk(
        pk_columns: { id: $projectRoleId }
        _set: {
          rejected_reason: $rejectedReason
          rejected_at: "now()"
          marked_notification_status: $markedNotificationStatus
        }
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
    updateMarkedNotificationStatus,
  }
}
