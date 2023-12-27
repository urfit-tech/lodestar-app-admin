export type ReportProps = {
  id: string
  title: string
  type: string
  options: any
  viewingPermissions?: { id: string; name: string }[]
}
