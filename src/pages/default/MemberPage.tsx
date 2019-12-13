import { List, Skeleton, Tabs, Typography } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { StringParam, useQueryParam } from 'use-query-params'
import useRouter from 'use-react-router'
import ActivityTicketItem from '../../components/activity/ActivityTicketItem'
import { useAuth } from '../../components/auth/AuthContext'
import MemberAvatar from '../../components/common/MemberAvatar'
import DefaultLayout from '../../components/layout/DefaultLayout'
import ProgramCard from '../../components/program/ProgramCard'
import ProgramPackageCollectionBlock from '../../containers/package/ProgramPackageCollectionBlock'
import EnrolledProgramCollectionBlock from '../../containers/program/EnrolledProgramCollectionBlock'
import ProjectPlanCollectionBlock from '../../containers/project/ProjectPlanCollectionBlock'
import { useEnrolledActivityTickets } from '../../hooks/activity'
import { useEnrolledProgramPackagePlanIds } from '../../hooks/data'
import { usePublicMember } from '../../hooks/member'
import { useEditablePrograms } from '../../hooks/program'
import { useEnrolledProjectPlanIds } from '../../hooks/Project'
import ReservationCard from '../../components/reservation/ReservationCard'

const MemberPage = () => {
  const { match } = useRouter<{ memberId: string }>()
  const memberId = match.params.memberId

  const { currentMemberId } = useAuth()
  const { member } = usePublicMember(memberId)
  const { enrolledProgramPackagePlanIds } = useEnrolledProgramPackagePlanIds(memberId)
  const { enrolledProjectPlanIds } = useEnrolledProjectPlanIds(memberId)
  const { enrolledActivityTickets } = useEnrolledActivityTickets(memberId)
  const enrolledReservationServicePlans = []

  const [defaultActiveKey, setDefaultActiveKey] = useQueryParam('tabkey', StringParam)
  const [activeKey, setActiveKey] = useState(defaultActiveKey || 'enrolled')

  const handleTabChange = (activeKey: string) => {
    setDefaultActiveKey(activeKey)
    setActiveKey(activeKey)
  }

  if (!currentMemberId || !member) {
    return (
      <DefaultLayout>
        <Skeleton active />
      </DefaultLayout>
    )
  }

  return (
    <DefaultLayout>
      <div className=" py-4 py-sm-5" style={{ background: 'white' }}>
        <div className="container d-flex flex-column flex-sm-row align-items-center">
          <MemberAvatar memberId={memberId || ''} withName={false} size={128} />
          <div className="d-flex flex-column align-items-center align-items-sm-start flex-sm-grow-1 ml-sm-4">
            <Typography.Title level={4}>{member && member.name}</Typography.Title>
            <Typography.Paragraph style={{ whiteSpace: 'pre-wrap' }}>
              {member && member.description}
            </Typography.Paragraph>
          </div>
        </div>
      </div>

      <Tabs
        activeKey={activeKey}
        onChange={handleTabChange}
        renderTabBar={(tabsProps, DefaultTabBar) => {
          return (
            <div style={{ background: 'white' }}>
              <div className="container">
                <DefaultTabBar {...tabsProps} />
              </div>
            </div>
          )
        }}
      >
        {currentMemberId === memberId && (
          <Tabs.TabPane key="enrolled" tab="參與課程">
            <EnrolledProgramCollectionBlock memberId={memberId} />
            {enrolledProgramPackagePlanIds.length > 0 && <ProgramPackageCollectionBlock memberId={memberId} />}
          </Tabs.TabPane>
        )}

        {member.roles.includes('content-creator') && (
          <Tabs.TabPane key="instructed" tab="開設課程">
            <InstructedProgramCollectionBlock memberId={memberId} />
          </Tabs.TabPane>
        )}

        {currentMemberId === memberId && enrolledProjectPlanIds.length > 0 && (
          <Tabs.TabPane key="project-plan" tab="專案項目">
            <ProjectPlanCollectionBlock memberId={memberId} />
          </Tabs.TabPane>
        )}
        {currentMemberId === memberId && enrolledActivityTickets.length > 0 && (
          <Tabs.TabPane key="activity-ticket" tab="我的票券">
            <ActivityTicketCollectionBlock memberId={memberId} />
          </Tabs.TabPane>
        )}
        {currentMemberId === memberId && enrolledReservationServicePlans.length > 0 && (
          <Tabs.TabPane key="reservation-service-plan" tab="預約時段">
            <ReservationServicePlanCollectionBlock memberId={memberId} />
          </Tabs.TabPane>
        )}
      </Tabs>
    </DefaultLayout>
  )
}

const InstructedProgramCollectionBlock: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { programs, loadingPrograms, error } = useEditablePrograms(memberId)

  return (
    <div className="container py-3">
      {loadingPrograms ? (
        <div>
          <Skeleton active avatar />
        </div>
      ) : error ? (
        '無法載入'
      ) : programs.length === 0 ? (
        <div>沒有開設任何課程</div>
      ) : (
              <div className="row">
                {programs.map(program => (
                  <div key={program.id} className="col-12 mb-4 col-md-6 col-lg-4">
                    <ProgramCard memberId={memberId} programId={program.id} />
                  </div>
                ))}
              </div>
            )}
    </div>
  )
}

const ActivityTicketCollectionBlock: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { loadingTickets, errorTickets, enrolledActivityTickets } = useEnrolledActivityTickets(memberId)

  return (
    <div className="container py-3">
      {loadingTickets ? (
        <Skeleton active />
      ) : errorTickets ? (
        '無法載入'
      ) : (
            <List>
              {enrolledActivityTickets.map(ticket => (
                <Link to={`/orders/${ticket.orderLogId}/products/${ticket.orderProductId}`} key={ticket.orderProductId}>
                  <div className="mb-4">
                    <ActivityTicketItem ticketId={ticket.activityTicketId} />
                  </div>
                </Link>
              ))}
            </List>
          )}
    </div>
  )
}

const ReservationServicePlanCollectionBlock: React.FC<{ memberId: string }> = ({ memberId }) => {
  let startedAt = new Date();
  let endedAt = new Date();
  endedAt.setTime(startedAt.getTime() + (30 * 60 * 1000));
  const reservationServicePlans = [
    {
      avatarUrl: "",
      title: "title1",
      startedAt: startedAt,
      endedAt
    },
    {
      avatarUrl: "",
      title: "title2",
      startedAt: startedAt,
      endedAt: startedAt
    }
  ]
  return (
    <div className="container py-3">
      <List>
        {reservationServicePlans.map(reservationServerPlan => <div className="mb-4">
          <ReservationCard
            avatarUrl={reservationServerPlan.avatarUrl}
            title={reservationServerPlan.title}
            startedAt={reservationServerPlan.startedAt}
            endedAt={reservationServerPlan.endedAt}
          />
        </div>)}
      </List>
    </div>
  )
}

export default MemberPage
