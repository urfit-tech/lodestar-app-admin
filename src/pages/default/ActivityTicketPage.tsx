import { Button, Skeleton } from 'antd'
import React from 'react'
import { Redirect } from 'react-router'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import ActivityBanner from '../../components/activity/ActivityBanner'
import ActivitySessionItem from '../../components/activity/ActivitySessionItem'
import { useAuth } from '../../components/auth/AuthContext'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { useActivityTicket } from '../../hooks/activity'

const StyledContainer = styled.div`
  padding: 5rem 15px;
`
const StyledLink = styled(Link)`
  display: block;
  width: 100%;
  max-width: 15rem;
  margin: 0 auto;
`

type ActivityTicketPageProps = {
  activityTicketId: string
}
const ActivityTicketPage: React.FC<ActivityTicketPageProps> = ({ activityTicketId }) => {
  const { currentMemberId } = useAuth()
  const { loadingTicket, errorTicket, ticket } = useActivityTicket(activityTicketId)

  if (loadingTicket) {
    return (
      <DefaultLayout noFooter white>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (errorTicket || !ticket) {
    return <Redirect to={`/members/${currentMemberId}`} />
  }

  return (
    <DefaultLayout noFooter white>
      <ActivityBanner
        activityCategories={ticket.activity.categories}
        activityTitle={ticket.activity.title}
        coverImage={ticket.activity.coverUrl || ''}
      >
        <img src={`https://files.kolable.com/images/${localStorage.getItem('kolable.app.id')}/qr-code-home.png`} alt="qr-code" />
      </ActivityBanner>
      <StyledContainer className="container">
        <div className="row">
          <div className="col-12 col-lg-8 offset-lg-2">
            <div className="mb-5">
              {ticket.sessionTickets.map(sessionTicket => (
                <div key={sessionTicket.session.id} className="mb-3">
                  <ActivitySessionItem activitySessionId={sessionTicket.session.id} />
                </div>
              ))}
            </div>

            <StyledLink to={`/activities/${ticket.activity.id}`} target="_blank">
              <Button type="primary" block>
                更多詳情
              </Button>
            </StyledLink>
          </div>
        </div>
      </StyledContainer>
    </DefaultLayout>
  )
}

export default ActivityTicketPage
