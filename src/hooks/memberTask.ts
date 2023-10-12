import { gql, useMutation } from '@apollo/client'
import hasura from '../hasura'

export const useMutateMemberTask = () => {
  const [insertMemberTask] = useMutation<hasura.InsertMemberTask, hasura.InsertMemberTaskVariables>(gql`
    mutation InsertMemberTask($data: member_task_insert_input!) {
      insert_member_task_one(
        object: $data
        on_conflict: {
          constraint: member_task_pkey
          update_columns: [
            title
            category_id
            member_id
            executor_id
            priority
            status
            due_at
            description
            has_meeting
            meet_id
            meeting_hours
            meeting_gateway
          ]
        }
      ) {
          id
      }
    }
  `)
  const [updateMemberTask] = useMutation<hasura.UpdateMemberTask, hasura.UpdateMemberTaskVariables>(gql`
    mutation UpdateMemberTask($memberTaskId: String!, $data: member_task_set_input) {
      update_member_task_by_pk(pk_columns: { id: $memberTaskId }, _set: $data) {
        id
      }
    }
  `)
  const [deleteMemberTask] = useMutation<hasura.DeleteMemberTask, hasura.DeleteMemberTaskVariables>(gql`
    mutation DeleteMemberTask($memberTaskId: String!) {
      delete_member_task(where: { id: { _eq: $memberTaskId } }) {
        affected_rows
      }
    }
  `)

  return {
    insertMemberTask,
    updateMemberTask,
    deleteMemberTask,
  }
}
