import { CalendarOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons'
import { gql, useMutation, useQuery } from '@apollo/client'
import { Checkbox, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import React, { forwardRef, useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import Responsive from '../../components/common/Responsive'
import hasura from '../../hasura'
import { dateFormatter } from '../../helpers'
import { programMessages } from '../../helpers/translation'
import EmptyCover from '../../images/default/empty-cover.png'
import { ReactComponent as CommentAltLinesIcon } from '../../images/icon/comment-alt-lines-o.svg'
import AdminCard from '../admin/AdminCard'
import MemberAvatar from '../common/MemberAvatar'
import { BREAK_POINT } from '../common/Responsive'

type PracticeCardProps = CardProps & {
  id: string
  isCoverRequired: boolean
  coverUrl: string | null
  title: string
  createdAt: Date
  memberId: string
  reactedMemberIds: string[]
  roles: { id: string; name: string; memberId: string }[]
  isReviewed: boolean
  practiceCardRef?: React.Ref<HTMLDivElement>
  onRefetch?: () => void
  desktop?: boolean
}

const StyledAdminCard = styled(AdminCard)`
  user-select: none;
  .ant-card-body {
    padding: 12px;
  }
`

const StyledCover = styled.div<{ src: string }>`
  padding-top: ${900 / 16}%;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  border-radius: 2px;
  @media (min-width: ${BREAK_POINT}px) {
    padding-top: 0px;
    width: 115px;
    height: 65px;
    margin-right: 20px;
  }
`
const StyledTitle = styled(Typography.Title)`
  && {
    font-size: 16px;
    color: var(--gray-darker);
    font-weight: 500;
    margin-top: 12px;
    letter-spacing: 0.2px;
  }
`
const StyledTitleBlock = styled.div`
  overflow: hidden;
`
const StyledDesktopTitle = styled.div`
  font-size: 16px;
  color: var(--gray-darker);
  font-weight: 500;
  letter-spacing: 0.2px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  margin-top: 8px;
`
const StyledCreatedAt = styled.div`
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.4px;
  color: var(--gray-dark);
  margin-bottom: 12px;
  span:last-child {
    font-size: 14px;
  }
  @media (min-width: ${BREAK_POINT}px) {
    margin-top: 4px;
    margin-bottom: 0px;
  }
`
const StyledCommentIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  color: var(--gray-dark);
`
const StyledHeartIcon = styled.div<{ reacted?: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${props => (props.reacted ? props.theme['@primary-color'] : 'var(--gray-dark)')};
  cursor: pointer;
`
const StyledCheckboxWrapper = styled.div`
  text-align: right;
`
const PracticeCard: React.FC<PracticeCardProps & CardProps> = ({
  id,
  isCoverRequired,
  coverUrl,
  title,
  createdAt,
  memberId,
  reactedMemberIds,
  roles,
  isReviewed,
  practiceCardRef,
  onRefetch,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const { host } = useApp()
  const [reviewed, setReviewed] = useState(isReviewed)
  const [reacted, setReacted] = useState(false)
  const { currentMemberId, currentUserRole } = useAuth()
  const [updatedPracticeStatus] = useMutation<hasura.UPDATE_PRACTICE_STATUS, hasura.UPDATE_PRACTICE_STATUSVariables>(
    UPDATE_PRACTICE_STATUS,
  )
  const [insertPracticeReaction] = useMutation<
    hasura.INSERT_PRACTICE_REACTION,
    hasura.INSERT_PRACTICE_REACTIONVariables
  >(INSERT_PRACTICE_REACTION)
  const [deletePracticeReaction] = useMutation<
    hasura.DELETE_PRACTICE_REACTION,
    hasura.DELETE_PRACTICE_REACTIONVariables
  >(DELETE_PRACTICE_REACTION)
  const { practiceAmount } = usePracticeIssueAmount(id)

  const practiceUrl = `https://${host}/practices/${id}`

  const toggleReaction = async (reacted: boolean) => {
    reacted
      ? await deletePracticeReaction({
          variables: {
            practiceId: id,
            memberId: currentMemberId || '',
          },
        })
      : await insertPracticeReaction({
          variables: {
            practiceId: id,
            memberId: currentMemberId || '',
          },
        })
  }

  useEffect(() => {
    if (currentMemberId && reactedMemberIds.includes(currentMemberId)) {
      setReacted(true)
    } else {
      setReacted(false)
    }
  }, [currentMemberId, reactedMemberIds])

  return (
    <StyledAdminCard className="mb-3" {...props}>
      <div ref={practiceCardRef}>
        <Responsive.Default>
          <div className="cursor-pointer" onClick={() => window.open(practiceUrl, '_blank')}>
            {isCoverRequired && <StyledCover src={coverUrl || EmptyCover} />}

            <StyledTitle ellipsis={{ rows: 2 }}>{title}</StyledTitle>
            <StyledCreatedAt>
              <CalendarOutlined className="mr-2" />
              <span>{dateFormatter(createdAt, 'YYYY-MM-DD HH:mm:ss')}</span>
            </StyledCreatedAt>
          </div>

          <div className="d-flex justify-content-between algin-items-center mb-3">
            <MemberAvatar size="28px" withName memberId={memberId} />
            <div className="d-flex justify-content-center algin-items-center">
              <StyledCommentIcon>
                <CommentAltLinesIcon className="mr-2" />
                <div>{practiceAmount && practiceAmount}</div>
              </StyledCommentIcon>
              <StyledHeartIcon
                reacted={reacted}
                onClick={() => {
                  toggleReaction(reacted)
                }}
              >
                {reacted ? <HeartFilled className="mr-2" /> : <HeartOutlined className="mr-2" />}
                <div>{reactedMemberIds.length}</div>
              </StyledHeartIcon>
            </div>
          </div>

          {currentUserRole === 'app-owner' ||
          roles
            .filter(role => role?.id === currentMemberId)
            .some(role => role.name === 'instructor' || role.name === 'assistant') ? (
            <StyledCheckboxWrapper>
              <Checkbox
                checked={reviewed}
                onChange={e => {
                  const updatedReviewed = e.target.checked
                  updatedPracticeStatus({
                    variables: {
                      practiceId: id,
                      reviewedAt: updatedReviewed ? new Date() : null,
                    },
                  }).then(() => {
                    setReviewed(updatedReviewed)
                    onRefetch?.()
                  })
                }}
              >
                {isReviewed
                  ? formatMessage(programMessages.status.reviewed)
                  : formatMessage(programMessages.status.unreviewed)}
              </Checkbox>
            </StyledCheckboxWrapper>
          ) : null}
        </Responsive.Default>

        <Responsive.Desktop>
          <div className="row">
            <div
              className="col-6 d-flex align-items-center cursor-pointer"
              onClick={() => window.open(practiceUrl, '_blank')}
            >
              {isCoverRequired && <StyledCover src={coverUrl || EmptyCover} />}
              <StyledTitleBlock>
                <StyledDesktopTitle>{title}</StyledDesktopTitle>
                <StyledCreatedAt>
                  <CalendarOutlined className="mr-2" />
                  <span>{dateFormatter(createdAt, 'YYYY-MM-DD HH:mm:ss')}</span>
                </StyledCreatedAt>
              </StyledTitleBlock>
            </div>

            <div className="col-3 d-flex align-items-center">
              <MemberAvatar size="28px" withName memberId={memberId} />
            </div>

            <div className="col-3 d-flex align-items-center">
              <StyledCommentIcon className="mr-3">
                <CommentAltLinesIcon className="mr-2" />
                <div>{practiceAmount}</div>
              </StyledCommentIcon>

              <StyledHeartIcon className="mr-3" reacted={reacted} onClick={e => toggleReaction(reacted)}>
                {reacted ? <HeartFilled className="mr-2" /> : <HeartOutlined className="mr-2" />}
                <div>{reactedMemberIds.length}</div>
              </StyledHeartIcon>

              {currentUserRole === 'app-owner' ||
              roles
                .filter(role => role?.memberId === currentMemberId)
                .some(role => role.name === 'instructor' || role.name === 'assistant') ? (
                <Checkbox
                  className="flex-grow-1 text-right"
                  checked={reviewed}
                  onChange={e => {
                    const updatedReviewed = e.target.checked
                    updatedPracticeStatus({
                      variables: {
                        practiceId: id,
                        reviewedAt: updatedReviewed ? new Date() : null,
                      },
                    }).then(() => {
                      setReviewed(updatedReviewed)
                      onRefetch?.()
                    })
                  }}
                >
                  {isReviewed
                    ? formatMessage(programMessages.status.reviewed)
                    : formatMessage(programMessages.status.unreviewed)}
                </Checkbox>
              ) : null}
            </div>
          </div>
        </Responsive.Desktop>
      </div>
    </StyledAdminCard>
  )
}

const UPDATE_PRACTICE_STATUS = gql`
  mutation UPDATE_PRACTICE_STATUS($practiceId: uuid!, $reviewedAt: timestamptz) {
    update_practice(where: { id: { _eq: $practiceId } }, _set: { reviewed_at: $reviewedAt }) {
      affected_rows
    }
  }
`
const INSERT_PRACTICE_REACTION = gql`
  mutation INSERT_PRACTICE_REACTION($memberId: String!, $practiceId: uuid!) {
    insert_practice_reaction(objects: { member_id: $memberId, practice_id: $practiceId }) {
      affected_rows
    }
  }
`
const DELETE_PRACTICE_REACTION = gql`
  mutation DELETE_PRACTICE_REACTION($memberId: String!, $practiceId: uuid!) {
    delete_practice_reaction(where: { member_id: { _eq: $memberId }, practice_id: { _eq: $practiceId } }) {
      affected_rows
    }
  }
`
const usePracticeIssueAmount = (practiceId: string) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_PRACTICE_ISSUE_AMOUNT,
    hasura.GET_PRACTICE_ISSUE_AMOUNTVariables
  >(GET_PRACTICE_ISSUE_AMOUNT, { variables: { threadIdLike: `/practices/${practiceId}` } })
  return {
    loading,
    error,
    practiceAmount: data?.issue_aggregate.aggregate?.count || 0,
    refetch,
  }
}
const GET_PRACTICE_ISSUE_AMOUNT = gql`
  query GET_PRACTICE_ISSUE_AMOUNT($threadIdLike: String) {
    issue_aggregate(where: { thread_id: { _like: $threadIdLike } }) {
      aggregate {
        count
      }
    }
  }
`

export default forwardRef((props: PracticeCardProps & CardProps, ref?: React.Ref<HTMLDivElement>) => (
  <PracticeCard {...props} practiceCardRef={ref} />
))
