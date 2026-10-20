// Presentation only: Hasura remains responsible for row and tenant authorization.
export const canReadExerciseReport = ({
  role,
  currentMemberId,
  memberId,
  exerciseAdmin,
  programRoleMemberIds,
}: {
  role: string
  currentMemberId: string | null
  memberId?: string | null
  exerciseAdmin: boolean
  programRoleMemberIds: string[]
}): boolean => {
  if (!currentMemberId) return false
  if (role === 'app-owner') return true
  if (role !== 'general-member' && role !== 'content-creator') return false
  return (
    exerciseAdmin ||
    memberId === currentMemberId ||
    (role === 'content-creator' && programRoleMemberIds.includes(currentMemberId))
  )
}
