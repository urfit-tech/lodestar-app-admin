import { Button, Icon } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import { ReactComponent as ExclamationCircleIcon } from '../../images/default/exclamation-circle.svg'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusOrdinaryIcon } from '../../images/default/status-ordinary.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'
import { AdminPaneTitle } from '../admin'
import { ActivityAdminProps } from './ActivityAdminBlock'

const StyledWrapper = styled.div`
  padding: 2.5rem;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.06);
`
const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledDescription = styled.div`
  margin-bottom: 2rem;
  color: var(--gray-dark);
  font-size: 16px;
  letter-spacing: 0.2px;
  text-align: center;
`
const StyledMetaBox = styled.div`
  margin-bottom: 2rem;
  padding: 2rem;
  border-radius: 2px;
  background-color: var(--gray-lighter);
  text-align: left;
`
const StyledMeta = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.71;
  letter-spacing: 0.4px;
`
const StyledLinkText = styled.span`
  color: var(--gray-dark);
  font-size: 14px;
  letter-spacing: 0.4px;
  cursor: pointer;

  &:not(:last-child) {
    margin-bottom: 0.75rem;
  }
`

const ActivityPublishAdminBlock: React.FC<{
  activityAdmin: ActivityAdminProps
  onPublish?: (setLoading: React.Dispatch<React.SetStateAction<boolean>>, publishedAt: Date | null) => void
  onChangeTab?: (key: string) => void
}> = ({ activityAdmin, onPublish, onChangeTab }) => {
  const [loading, setLoading] = useState(false)

  const isTicketsEmpty = activityAdmin.activityTickets.length === 0
  const isDescriptionEmpty = !activityAdmin.description

  const activityPublishStatus = activityAdmin.publishedAt
    ? 'published'
    : isTicketsEmpty || isDescriptionEmpty
    ? 'not-complete'
    : 'not-published'

  return (
    <div className="container py-5">
      <AdminPaneTitle>發佈設定</AdminPaneTitle>

      <StyledWrapper>
        {activityPublishStatus === 'not-complete' && (
          <div className="text-center">
            <div className="mb-4">
              <StatusAlertIcon />
            </div>
            <StyledTitle className="mb-2">尚有未完成項目</StyledTitle>
            <StyledDescription>請填寫以下必填資料，填寫完畢即可由此發佈</StyledDescription>
            <StyledMetaBox>
              {isTicketsEmpty && (
                <StyledMeta>
                  <ExclamationCircleIcon className="mr-2" />
                  <span className="mr-2">尚未訂定票券方案</span>
                  <StyledLinkText onClick={() => onChangeTab && onChangeTab('tickets')}>
                    前往填寫 <Icon type="right" />
                  </StyledLinkText>
                </StyledMeta>
              )}
              {isDescriptionEmpty && (
                <StyledMeta>
                  <ExclamationCircleIcon className="mr-2" />
                  <span className="mr-2">尚未填寫活動簡介</span>
                  <StyledLinkText onClick={() => onChangeTab && onChangeTab('settings')}>
                    前往填寫 <Icon type="right" />
                  </StyledLinkText>
                </StyledMeta>
              )}
            </StyledMetaBox>
          </div>
        )}

        {activityPublishStatus === 'not-published' && (
          <div className="text-center">
            <div className="mb-4">
              <StatusOrdinaryIcon />
            </div>
            <StyledTitle className="mb-2">尚未發佈活動</StyledTitle>
            <StyledDescription>因你的活動未發佈，此活動並不會顯示在頁面上。</StyledDescription>
          </div>
        )}

        {activityPublishStatus === 'published' && (
          <div className="text-center">
            <div className="mb-4">
              <StatusSuccessIcon />
            </div>
            <StyledTitle className="mb-2">已發佈活動</StyledTitle>
            <StyledDescription>現在你的活動已經發佈，此活動會出現在頁面上。</StyledDescription>
          </div>
        )}

        <div className="text-center">
          <Button
            type={activityPublishStatus === 'not-published' ? 'primary' : 'default'}
            disabled={activityPublishStatus === 'not-complete'}
            loading={loading}
            onClick={() =>
              onPublish && onPublish(setLoading, activityPublishStatus === 'not-published' ? new Date() : null)
            }
          >
            {activityPublishStatus === 'published' ? '取消發佈' : '立即發佈'}
          </Button>
        </div>
      </StyledWrapper>
    </div>
  )
}

export default ActivityPublishAdminBlock
