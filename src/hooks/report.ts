import { gql, useMutation, useQuery } from '@apollo/client'
import hasura from '../hasura'
import { ReportProps } from '../types/report'

export const useReport = (reportId: string) => {
  const { loading, error, data, refetch } = useQuery<hasura.GetReport, hasura.GetReportVariables>(
    gql`
      query GetReport($id: uuid!) {
        report_by_pk(id: $id) {
          id
          title
          type
          options
          report_permission_groups {
            permission_group {
              id
              name
            }
          }
        }
      }
    `,
    {
      variables: {
        id: reportId,
      },
    },
  )

  const report: ReportProps = {
    id: data?.report_by_pk?.id,
    title: data?.report_by_pk?.title || '',
    type: data?.report_by_pk?.type || '',
    options: data?.report_by_pk?.options || {},
    viewingPermissions:
      data?.report_by_pk?.report_permission_groups?.map(v => ({
        id: v.permission_group?.id || '',
        name: v.permission_group?.name || '',
      })) || [],
  }

  return {
    report,
    loadingReport: loading,
    errorReport: error,
    refetchReport: refetch,
  }
}

export const useReportCollection = () => {
  const { loading, error, data, refetch } = useQuery<hasura.GetReportCollection, hasura.GetReportCollectionVariables>(
    gql`
      query GetReportCollection {
        report(order_by: { created_at: desc }) {
          id
          title
          type
          options
          report_permission_groups {
            id
            permission_group {
              id
              name
            }
          }
        }
      }
    `,
  )

  const reports: ReportProps[] =
    data?.report.map(v => {
      return {
        id: v.id,
        title: v.title,
        type: v.type || '',
        options: v.options,
        viewingPermissions:
          v.report_permission_groups?.map(v => ({
            id: v.permission_group?.id || '',
            name: v.permission_group?.name || '',
          })) || [],
      }
    }) || []

  return {
    reports,
    loadingReports: loading,
    errorReports: error,
    refetchReports: refetch,
  }
}

export const useMutateReport = () => {
  const [insertReport] = useMutation<hasura.InsertReport, hasura.InsertReportVariables>(gql`
    mutation InsertReport($data: [report_insert_input!]!) {
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
  const [deleteReport] = useMutation<hasura.DeleteReport, hasura.DeleteReportVariables>(gql`
    mutation DeleteReport($id: uuid!) {
      delete_report(where: { id: { _eq: $id } }) {
        affected_rows
      }
    }
  `)

  return {
    insertReport,
    deleteReport,
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

  const [deleteReportPermissionGroupByReportId] = useMutation<
    hasura.DeleteReportPermissionGroupByReportId,
    hasura.DeleteReportPermissionGroupByReportIdVariables
  >(gql`
    mutation DeleteReportPermissionGroupByReportId($reportId: uuid!) {
      delete_report_permission_group(where: { report_id: { _eq: $reportId } }) {
        affected_rows
      }
    }
  `)

  return {
    insertReportPermissionGroup,
    deleteReportPermissionGroupByReportId,
  }
}
