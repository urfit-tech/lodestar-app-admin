export type ReportProps = {
  id: string
  title: string
  type: string
  options: {
    canViewSelfDataOnly: boolean
    metabase: {
      params: {
        appId: string
      }
      resource: {
        question?: string
        dashboard?: string
      }
    }
  }
  viewingPermissions?: { id: string; name: string }[]
}
