import { StringParam, useQueryParam } from 'use-query-params'
import { useMemberTask } from '../../hooks/task'
import MemberTaskAdminBlock from './MemberTaskAdminBlock'

const MemberTaskCollectionBlock: React.FC<{ memberId?: string }> = ({ memberId }) => {
  const [activeMemberTaskId] = useQueryParam('id', StringParam)
  const { memberTask } = useMemberTask(activeMemberTaskId || '')
  return <MemberTaskAdminBlock memberId={memberId} activeMemberTask={memberTask} />
}

export default MemberTaskCollectionBlock
