import Icon, { FileAddOutlined, FileTextOutlined, MoreOutlined } from '@ant-design/icons'
import { gql, useMutation } from '@apollo/client'
import { Button, Dropdown, Menu, message, Skeleton } from 'antd'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { map } from 'ramda'
import React from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import hasura from '../../hasura'
import { dateRangeFormatter, handleError } from '../../helpers'
import { activityMessages, commonMessages } from '../../helpers/translation'
import { ReactComponent as CalendarOIcon } from '../../images/icon/calendar-alt-o.svg'
import { ReactComponent as MapOIcon } from '../../images/icon/map-o.svg'
import { ReactComponent as TicketOIcon } from '../../images/icon/ticket-o.svg'
import { ReactComponent as UserOIcon } from '../../images/icon/user-o.svg'
import { ActivityAdminProps } from '../../types/activity'
import ActivitySessionAdminModal from './ActivitySessionAdminModal'

const StyledWrapper = styled.div`
  margin-bottom: 1.25rem;
  padding: 1.5rem;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.15);
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  font-weight: bold;
  letter-spacing: 0.2px;
`
const StyledDescription = styled.div`
  color: var(--gray-darker);
  font-size: 16px;
  line-height: 1.5;
  letter-spacing: 0.2px;

  &:not(:last-child) {
    margin-bottom: 0.75rem;
  }
`
const StyledLinkText = styled.span`
  color: ${props => props.theme['@primary-color']};
`

const ActivitySessionsAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps | null
  onRefetch?: () => void
  onChangeTab?: () => void
}> = ({ activityAdmin, onRefetch, onChangeTab }) => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { insertActivitySession, updateActivitySession, archiveActivitySession } = useMutationActivitySession()

  if (!activityAdmin) {
    return <Skeleton active />
  }

  return (
    <>
      <ActivitySessionAdminModal
        renderTrigger={({ setVisible }) => (
          <Button type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)} className="mb-5">
            {formatMessage(activityMessages.ui.createSession)}
          </Button>
        )}
        icon={<FileAddOutlined />}
        onSubmit={(values, reset) =>
          insertActivitySession({
            variables: {
              activityId: activityAdmin.id,
              title: values.title || '',
              startedAt: values.startedAt,
              endedAt: values.endedAt,
              location: values.location || null,
              onlineLink: values.onlineLink || null,
              threshold: values.threshold,
            },
          }).then(reset)
        }
        onRefetch={onRefetch}
      />

      {activityAdmin.sessions.map(session => {
        const tickets = activityAdmin.tickets.filter(ticket =>
          ticket.sessions.some(ticketSession => ticketSession.id === session.id),
        )

        return (
          <StyledWrapper key={session.id}>
            <StyledTitle className="mb-3">{session.title}</StyledTitle>
            <StyledDescription>
              <Icon component={() => <CalendarOIcon />} className="mr-2" />
              <span>
                {dateRangeFormatter({
                  startedAt: session.startedAt,
                  endedAt: session.endedAt,
                  dateFormat: 'YYYY-MM-DD(dd)',
                })}
              </span>
            </StyledDescription>
            <StyledDescription>
              <Icon component={() => <MapOIcon />} className="mr-2" />
              <span>{session.location}</span>
            </StyledDescription>
            <StyledDescription>
              <Icon component={() => <TicketOIcon />} className="mr-2" />
              <span>
                {tickets.length ? (
                  tickets.map(ticket => ticket.title).join(formatMessage(commonMessages.ui.comma))
                ) : (
                  <StyledLinkText className="cursor-pointer" onClick={() => onChangeTab && onChangeTab()}>
                    {formatMessage(activityMessages.ui.addTicketPlan)}
                  </StyledLinkText>
                )}
              </span>
            </StyledDescription>
            <StyledDescription className="d-flex align-items-center justify-content-between">
              <div>
                <Icon component={() => <UserOIcon />} className="mr-2" />
                {enabledModules.activity_online && session.location && session.onlineLink ? (
                  map(
                    sessionType =>
                      !!session.maxAmount[sessionType] && (
                        <span className="mr-2">
                          {`${formatMessage(activityMessages.label[sessionType])} `}
                          {session.enrollmentsCount[sessionType]} / {session.maxAmount[sessionType]}
                        </span>
                      ),
                    ['online', 'offline'] as const,
                  )
                ) : (
                  <>
                    {!enabledModules.activity_online || session.location ? (
                      <span className="mr-2">
                        {session.enrollmentsCount['offline']} / {session.maxAmount['offline']}
                      </span>
                    ) : (
                      enabledModules.activity_online &&
                      session.onlineLink && (
                        <span className="mr-3">
                          {session.enrollmentsCount['online']} / {session.maxAmount['online']}
                        </span>
                      )
                    )}
                  </>
                )}
                {session.threshold && (
                  <span>
                    {formatMessage(activityMessages.ui.threshold)} {session.threshold}
                  </span>
                )}
              </div>
              <Dropdown
                overlay={
                  <Menu>
                    <Menu.Item>
                      <ActivitySessionAdminModal
                        renderTrigger={({ setVisible }) => (
                          <span onClick={() => setVisible(true)}>{formatMessage(commonMessages.ui.edit)}</span>
                        )}
                        icon={<FileTextOutlined />}
                        activitySession={session}
                        onSubmit={values =>
                          updateActivitySession({
                            variables: {
                              activitySessionId: session.id,
                              title: values.title || '',
                              startedAt: values.startedAt,
                              endedAt: values.endedAt,
                              location: values.location || null,
                              onlineLink: values.onlineLink || null,
                              threshold: values.threshold,
                            },
                          })
                        }
                        onRefetch={onRefetch}
                      />
                    </Menu.Item>
                    <Menu.Item
                      onClick={() => {
                        window.confirm(formatMessage(activityMessages.text.deleteActivitySessionWarning)) &&
                          archiveActivitySession({ variables: { activitySessionId: session.id } })
                            .then(() => {
                              message.success(formatMessage(commonMessages.event.successfullyDeleted))
                              onRefetch?.()
                            })
                            .catch(handleError)
                      }}
                    >
                      {formatMessage(commonMessages.ui.delete)}
                    </Menu.Item>
                  </Menu>
                }
                trigger={['click']}
              >
                <MoreOutlined />
              </Dropdown>
            </StyledDescription>
          </StyledWrapper>
        )
      })}
    </>
  )
}

const useMutationActivitySession = () => {
  const [insertActivitySession] = useMutation<hasura.INSERT_ACTIVITY_SESSION, hasura.INSERT_ACTIVITY_SESSIONVariables>(
    gql`
      mutation INSERT_ACTIVITY_SESSION(
        $activityId: uuid!
        $title: String!
        $startedAt: timestamptz
        $endedAt: timestamptz
        $location: String
        $onlineLink: String
        $description: String
        $threshold: numeric
      ) {
        insert_activity_session(
          objects: {
            activity_id: $activityId
            title: $title
            started_at: $startedAt
            ended_at: $endedAt
            location: $location
            online_link: $onlineLink
            description: $description
            threshold: $threshold
          }
        ) {
          affected_rows
        }
      }
    `,
  )
  const [updateActivitySession] = useMutation<hasura.UPDATE_ACTIVITY_SESSION, hasura.UPDATE_ACTIVITY_SESSIONVariables>(
    gql`
      mutation UPDATE_ACTIVITY_SESSION(
        $activitySessionId: uuid!
        $title: String!
        $startedAt: timestamptz
        $endedAt: timestamptz
        $location: String
        $onlineLink: String
        $description: String
        $threshold: numeric
      ) {
        update_activity_session(
          where: { id: { _eq: $activitySessionId } }
          _set: {
            title: $title
            started_at: $startedAt
            ended_at: $endedAt
            location: $location
            online_link: $onlineLink
            description: $description
            threshold: $threshold
          }
        ) {
          affected_rows
        }
      }
    `,
  )
  const [archiveActivitySession] = useMutation<
    hasura.ARCHIVE_ACTIVITY_SESSION,
    hasura.ARCHIVE_ACTIVITY_SESSIONVariables
  >(gql`
    mutation ARCHIVE_ACTIVITY_SESSION($activitySessionId: uuid!) {
      delete_activity_session_ticket(where: { activity_session_id: { _eq: $activitySessionId } }) {
        affected_rows
      }
      update_activity_session(where: { id: { _eq: $activitySessionId } }, _set: { deleted_at: "now()" }) {
        affected_rows
      }
    }
  `)
  return {
    insertActivitySession,
    updateActivitySession,
    archiveActivitySession,
  }
}

export default ActivitySessionsAdminBlock
