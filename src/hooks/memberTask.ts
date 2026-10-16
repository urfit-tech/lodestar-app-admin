import { gql, useMutation } from '@apollo/client'
import hasura from '../hasura'

export const useMutateMemberTask = () => {
  // One transaction: retire the previous meet and buyer membership, insert the new meet and buyer membership, upsert
  // the task (on_conflict.where is a CAS on the task's raw meet_id) and assert the final state as the last root field.
  // Empty arrays / `_in: []` make the meeting roots no-ops.
  const [saveMemberTask] = useMutation<hasura.SaveMemberTask, hasura.SaveMemberTaskVariables>(gql`
    mutation SaveMemberTask(
      $retiredMeetIds: [uuid!]!
      $retiredMemberIds: [String!]!
      $meets: [meet_insert_input!]!
      $meetMembers: [meet_member_insert_input!]!
      $data: member_task_insert_input!
      $expectedState: member_task_bool_exp!
      $memberTaskId: String!
      $newMeetId: uuid
      $retiredMeetId: uuid
      $retiredMemberId: String
    ) {
      update_meet(where: { id: { _in: $retiredMeetIds } }, _set: { deleted_at: "now()" }) {
        affected_rows
      }
      update_meet_member(
        where: { meet_id: { _in: $retiredMeetIds }, member_id: { _in: $retiredMemberIds } }
        _set: { deleted_at: "now()" }
      ) {
        affected_rows
      }
      insert_meet(objects: $meets) {
        affected_rows
      }
      insert_meet_member(objects: $meetMembers) {
        affected_rows
      }
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
          where: $expectedState
        }
      ) {
        id
      }
      assert_member_task_saved(
        args: {
          task_id: $memberTaskId
          new_meet_id: $newMeetId
          retired_meet_id: $retiredMeetId
          retired_member_id: $retiredMemberId
        }
      ) {
        ok
      }
    }
  `)
  const [deleteMemberTask] = useMutation<hasura.DeleteMemberTask, hasura.DeleteMemberTaskVariables>(gql`
    mutation DeleteMemberTask($memberTaskId: String!) {
      update_member_task(where: { id: { _eq: $memberTaskId } }, _set: { deleted_at: "now()" }) {
        affected_rows
      }
    }
  `)

  return {
    saveMemberTask,
    deleteMemberTask,
  }
}
