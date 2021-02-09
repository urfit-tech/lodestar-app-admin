import { CalendarOutlined, HeartFilled, HeartOutlined } from '@ant-design/icons'
import { useMutation, useQuery } from '@apollo/react-hooks'
import { Checkbox, Typography } from 'antd'
import { CardProps } from 'antd/lib/card'
import gql from 'graphql-tag'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import Responsive from '../../components/common/Responsive'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { dateFormatter } from '../../helpers'
import { practiceMessages } from '../../helpers/translation'
import DefaultAvatar from '../../images/default/avatar.svg'
import EmptyCover from '../../images/default/empty-cover.png'
import { ReactComponent as CommentAltLinesIcon } from '../../images/icon/comment-alt-lines-o.svg'
import types from '../../types'
import AdminCard from '../admin/AdminCard'
import { AvatarImage } from '../common/Image'
import { BREAK_POINT } from '../common/Responsive'

type PracticeCardProps = CardProps & {
  id: string
  coverUrl: string | null
  title: string
  createdAt: Date
  memberUrl: string | null
  memberName: string
  reactedMemberIds: string[]
  roles: { id: string; name: string }[]
  isReviewed: boolean
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
const StyledName = styled.div`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  line-height: 28px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
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
  coverUrl,
  title,
  createdAt,
  memberUrl,
  memberName,
  reactedMemberIds,
  roles,
  isReviewed,
  onRefetch,
  ...props
}) => {
  const { formatMessage } = useIntl()
  const { settings } = useApp()
  const [reviewed, setReviewed] = useState(isReviewed)
  const [reacted, setReacted] = useState(false)
  const { currentMemberId, currentUserRole } = useAuth()
  const [updatedPracticeStatus] = useMutation<types.UPDATE_PRACTICE_STATUS, types.UPDATE_PRACTICE_STATUSVariables>(
    UPDATE_PRACTICE_STATUS,
  )
  const [insertPracticeReaction] = useMutation<types.INSERT_PRACTICE_REACTION, types.INSERT_PRACTICE_REACTIONVariables>(
    INSERT_PRACTICE_REACTION,
  )
  const [deletePracticeReaction] = useMutation<types.DELETE_PRACTICE_REACTION, types.DELETE_PRACTICE_REACTIONVariables>(
    DELETE_PRACTICE_REACTION,
  )
  const { practiceAmount } = usePracticeIssueAmount(id)

  const practiceUrl = `https://${settings['host']}/practices/${id}`

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
    onRefetch?.()
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
      <Responsive.Default>
        <div
          style={{ cursor: 'pointer' }}
          onClick={() => {
            window.open(practiceUrl, '_blank')
          }}
        >
          <StyledCover src={coverUrl || EmptyCover} />

          <StyledTitle ellipsis={{ rows: 2 }}>{title}</StyledTitle>
          <StyledCreatedAt>
            <CalendarOutlined className="mr-2" />
            <span>{dateFormatter(createdAt, 'YYYY-MM-DD')}</span>
          </StyledCreatedAt>
        </div>

        <div className="d-flex justify-content-between algin-items-center mb-3">
          <div className="d-flex justify-content-center algin-items-center">
            {<AvatarImage className="mr-2" src={memberUrl || DefaultAvatar} size="28px" />}
            <StyledName>{memberName}</StyledName>
          </div>
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
                ? formatMessage(practiceMessages.status.reviewed)
                : formatMessage(practiceMessages.status.unreviewed)}
            </Checkbox>
          </StyledCheckboxWrapper>
        ) : null}
      </Responsive.Default>

      <Responsive.Desktop>
        <div className="d-flex col-12">
          <div
            className="d-flex col-9 p-0"
            onClick={() => {
              window.open(practiceUrl, '_blank')
            }}
            style={{ cursor: 'pointer' }}
          >
            <StyledCover src={coverUrl || EmptyCover} />
            <div className="col-5 p-0">
              <StyledDesktopTitle>{title}</StyledDesktopTitle>
              <StyledCreatedAt>
                <CalendarOutlined className="mr-2" />
                <span>{dateFormatter(createdAt, 'YYYY-MM-DD')}</span>
              </StyledCreatedAt>
            </div>

            <div className="d-flex algin-items-center col-2 m-auto p-0" title={memberName}>
              {<AvatarImage className="mr-2" src={memberUrl || DefaultAvatar} size="28px" />}
              <StyledName>{memberName}</StyledName>
            </div>
          </div>
          <div className="d-flex col-3">
            <StyledCommentIcon>
              <CommentAltLinesIcon className="mr-2" />
              <div>{practiceAmount && practiceAmount}</div>
            </StyledCommentIcon>

            <StyledHeartIcon
              reacted={reacted}
              onClick={e => {
                toggleReaction(reacted)
              }}
            >
              {reacted ? <HeartFilled className="mr-2" /> : <HeartOutlined className="mr-2" />}
              <div>{reactedMemberIds.length}</div>
            </StyledHeartIcon>

            {currentUserRole === 'app-owner' ||
            roles
              .filter(role => role?.id === currentMemberId)
              .some(role => role.name === 'instructor' || role.name === 'assistant') ? (
              <StyledCheckboxWrapper className="d-flex m-auto">
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
                    ? formatMessage(practiceMessages.status.reviewed)
                    : formatMessage(practiceMessages.status.unreviewed)}
                </Checkbox>
              </StyledCheckboxWrapper>
            ) : null}
          </div>
        </div>
      </Responsive.Desktop>
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
    types.GET_PRACTICE_ISSUE_AMOUNT,
    types.GET_PRACTICE_ISSUE_AMOUNTVariables
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
export default PracticeCard
