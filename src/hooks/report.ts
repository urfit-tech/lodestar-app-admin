import { gql, useMutation } from '@apollo/client'
import hasura from '../hasura'

export const useMutateReport = () => {
  const [insertReport] = useMutation<hasura.INSERT_REPORT, hasura.INSERT_REPORTVariables>(gql`
    mutation INSERT_REPORT($data: [report_insert_input!]!) {
      insert_report(
        objects: $data
        on_conflict: { constraint: report_pkey, update_columns: [title, options, app_id, type] }
      ) {
        returning {
          id
        }
      }
    }
  `)
  return {
    insertReport,
  }
}

export const useMutateReportPermissionGroup = () => {
  const [insertReportPermissionGroup] = useMutation<
    hasura.InsertReportPermissionGroup,
    hasura.InsertReportPermissionGroupVariables
  >(gql`
    mutation InsertReportPermissionGroup($data: [report_permission_group_insert_input!]!) {
      insert_report_permission_group(objects: $data) {
        affected_rows
      }
    }
  `)

  const [deleteReportPermissionGroup] = useMutation<
    hasura.DeleteReportPermissionGroup,
    hasura.DeleteReportPermissionGroupVariables
  >(gql`
    mutation DeleteReportPermissionGroup($ids: [uuid!]!) {
      delete_report_permission_group(where: { id: { _in: $ids } }) {
        affected_rows
      }
    }
  `)

  return {
    insertReportPermissionGroup,
    deleteReportPermissionGroup,
  }
}
