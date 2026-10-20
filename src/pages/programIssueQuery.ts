import hasura from '../hasura'

// null denotes the ADMIN list. Keep the enrollment predicate even for ADMIN:
// it excludes unrelated discussions and applies Hasura's enrollment permissions.
export const buildProgramIssueWhere = (
  appId: string,
  memberId: string | null,
  selectedProgramId: string,
  unsolved?: boolean,
): hasura.issue_bool_exp => ({
  app_id: { _eq: appId },
  issue_enrollment:
    memberId === null ? {} : { program_roles: { member_id: { _eq: memberId }, name: { _eq: 'instructor' } } },
  ...(selectedProgramId === 'all' ? {} : { thread_id: { _like: `/programs/${selectedProgramId}/contents/%` } }),
  ...(typeof unsolved === 'boolean' ? { solved_at: { _is_null: unsolved } } : {}),
})
