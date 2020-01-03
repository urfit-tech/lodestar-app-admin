import { useQuery } from '@apollo/react-hooks'
import { Avatar, Button, Divider, Skeleton } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { Col, Container, Row } from 'react-bootstrap'
import styled from 'styled-components'
import useRouter from 'use-react-router'
import ActivityBanner from '../../components/activity/ActivityBanner'
import ActivitySessionItem from '../../components/activity/ActivitySessionItem'
import ActivityTicket from '../../components/activity/ActivityTicket'
import CheckoutProductModal from '../../components/checkout/CheckoutProductModal'
import { BREAK_POINT } from '../../components/common/Responsive'
import { BraftContent } from '../../components/common/StyledBraftEditor'
import DefaultLayout from '../../components/layout/DefaultLayout'
import { useAuth } from '../../contexts/AuthContext'
import { usePublicMember } from '../../hooks/member'
import types from '../../types'

const ActivityContent = styled(Container)`
  && {
    padding-top: 56px;
  }
`
const ActivityOrganizer = styled(Col)`
  @media (min-width: 320px) and (max-width: ${BREAK_POINT}px) {
    text-align: center;
    h3 {
      padding-top: 24px;
    }
    p {
      text-align: left;
    }
  }
`
const ActivityAvatar = styled(Avatar)`
  img {
    object-fit: cover;
  }

  @media (min-width: 320px) and (max-width: ${BREAK_POINT}px) {
    && {
      width: 96px;
      height: 96px;
    }
  }

  @media (min-width: ${BREAK_POINT}px) {
    && {
      width: 128px;
      height: 128px;
    }
  }
`

const ActivityPage = () => {
  const { history, match } = useRouter<{ activityId: string }>()
  const { activityId } = match.params
  const { currentMemberId } = useAuth()

  const { loading, error, data } = useQuery<types.GET_ACTIVITY, types.GET_ACTIVITYVariables>(GET_ACTIVITY, {
    variables: {
      activityId,
      memberId: currentMemberId || '',
    },
  })

  if (loading || !currentMemberId) {
    return (
      <DefaultLayout white>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  if (error || !data || !data.activity_by_pk) {
    return <DefaultLayout white>讀取錯誤</DefaultLayout>
  }

  return (
    <DefaultLayout white>
      <ActivityBanner
        coverImage={data.activity_by_pk.cover_url || ''}
        activityTitle={data.activity_by_pk.title}
        activityCategories={data.activity_by_pk.activity_categories}
      />
      <ActivityContent>
        <Row>
          <Col xs={12} lg={8}>
            <div className="mb-5">
              <BraftContent>{data.activity_by_pk.description}</BraftContent>
            </div>

            <h2 className="mb-0">場次資訊</h2>
            <Divider className="mt-0" />

            {data.activity_by_pk.activity_sessions.map((session: any, i: number) => (
              <div key={i} className="mb-4">
                <ActivitySessionItem activitySessionId={session.id} />
              </div>
            ))}
          </Col>

          <Col xs={12} lg={4}>
            {data.activity_by_pk.activity_tickets.map(ticket => {
              const participants = ticket.activity_ticket_enrollments_aggregate.aggregate
                ? ticket.activity_ticket_enrollments_aggregate.aggregate.count || 0
                : 0

              return (
                <div key={ticket.id} className="mb-4">
                  <ActivityTicket
                    id={ticket.id}
                    title={ticket.title}
                    description={ticket.description}
                    price={ticket.price}
                    count={ticket.count}
                    startedAt={new Date(ticket.started_at)}
                    endedAt={new Date(ticket.ended_at)}
                    isPublished={ticket.is_published}
                    activitySessionTickets={ticket.activity_session_tickets.map(sessionTicket => ({
                      id: sessionTicket.id,
                      activitySession: sessionTicket.activity_session,
                    }))}
                    participants={participants}
                    extra={
                      !data.activity_by_pk ||
                      !data.activity_by_pk.published_at ||
                      new Date(data.activity_by_pk.published_at).getTime() > Date.now() ||
                      new Date(ticket.started_at).getTime() > Date.now() ? (
                        <Button block disabled>
                          尚未發售
                        </Button>
                      ) : ticket.activity_ticket_enrollments.length > 0 ? (
                        <Button
                          block
                          onClick={() =>
                            history.push(
                              `/orders/${ticket.activity_ticket_enrollments[0].order_log_id}/products/${ticket.activity_ticket_enrollments[0].order_product_id}`,
                            )
                          }
                        >
                          查看票券
                        </Button>
                      ) : participants >= ticket.count ? (
                        <Button block disabled>
                          已售完
                        </Button>
                      ) : new Date(ticket.ended_at).getTime() < Date.now() ? (
                        <Button block disabled>
                          已截止
                        </Button>
                      ) : (
                        <CheckoutProductModal
                          renderTrigger={({ setVisible }) => (
                            <Button type="primary" block onClick={() => setVisible(true)}>
                              立即報名
                            </Button>
                          )}
                          type="perpetual"
                          productId={`ActivityTicket_${ticket.id}`}
                          requiredFields={['name', 'email', 'phone']}
                        />
                      )
                    }
                  />
                </div>
              )
            })}
          </Col>
        </Row>

        <Row className="mb-5">
          <ActivityOrganizer xs={12} lg={8}>
            <h2 className="mb-0">主辦簡介</h2>
            <Divider className="mt-0" />

            <ActivityOrganizerIntro memberId={data.activity_by_pk.organizer_id} />
          </ActivityOrganizer>
        </Row>
      </ActivityContent>
    </DefaultLayout>
  )
}

const ActivityOrganizerIntro: React.FC<{
  memberId: string
}> = ({ memberId }) => {
  const { member } = usePublicMember(memberId)
  return (
    <>
      {member && (
        <Row>
          <Col xs={12} lg={3}>
            {member.pictureUrl && <ActivityAvatar src={member.pictureUrl} />}
          </Col>
          <Col xs={12} lg={9}>
            <h3>{member.name}</h3>
            <p>{member.description}</p>
          </Col>
        </Row>
      )}
    </>
  )
}

const GET_ACTIVITY = gql`
  query GET_ACTIVITY($activityId: uuid!, $memberId: String!) {
    activity_by_pk(id: $activityId) {
      id
      organizer_id
      cover_url
      title
      description
      published_at
      activity_categories {
        id
        category {
          id
          name
        }
      }
      activity_sessions(order_by: { started_at: asc }) {
        id
      }
      activity_tickets(where: { is_published: { _eq: true } }, order_by: { started_at: asc }) {
        id
        count
        description
        started_at
        is_published
        ended_at
        price
        title
        activity_session_tickets {
          id
          activity_session {
            id
            title
          }
        }
        activity_ticket_enrollments_aggregate {
          aggregate {
            count
          }
        }
        activity_ticket_enrollments(where: { member_id: { _eq: $memberId } }) {
          order_log_id
          order_product_id
        }
      }
    }
  }
`

export default ActivityPage
