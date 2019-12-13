import React from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import ActivityAdminBlock from '../../../containers/activity/ActivityAdminBlock'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`
const ActivityAdminPage = () => {
  const { match } = useRouter<{ activityId: string }>()
  const activityId = match.params.activityId

  return (
    <StyledWrapper>
      <ActivityAdminBlock activityId={activityId} />
    </StyledWrapper>
  )
}
export default ActivityAdminPage
