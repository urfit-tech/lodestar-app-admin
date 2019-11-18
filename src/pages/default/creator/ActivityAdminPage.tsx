import React from 'react'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import ActivityAdminBlock from '../../../containers/activity/ActivityAdminBlock'

const StyledWrapper = styled.div`
  background: #f7f8f8;
`
export const StyledAdminBlock = styled.div`
  margin-bottom: 1.25rem;
  padding: 2.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
export const StyledAdminPaneTitle = styled.h1`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
export const StyledAdminBlockTitle = styled.h2`
  margin-bottom: 2.5rem;
  color: var(--gray-darker);
  font-size: 18px;
  font-weight: bold;
  letter-spacing: 0.8px;
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
