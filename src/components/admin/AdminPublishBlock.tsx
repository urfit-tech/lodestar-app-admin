import { Button, Icon, message } from 'antd'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ReactComponent as ExclamationCircleIcon } from '../../images/default/exclamation-circle.svg'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusOrdinaryIcon } from '../../images/default/status-ordinary.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'

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
  letter-spacing: 0.2px;
`
const StyledMetaBlock = styled.div`
  padding: 2rem 2.5rem;
  background-color: var(--gray-lighter);
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.71;
  letter-spacing: 0.4px;
  border-radius: 2px;
`
const StyledMeta = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  :not(:last-child) {
    margin-bottom: 0.75rem;
  }

  .ant-btn.ant-btn-link {
    color: var(--gray-dark);
    line-height: normal;
  }
`

export type PublishStatus = 'alert' | 'ordinary' | 'success'
export type ChecklistItemProps = {
  id: string
  text: string
  tabkey?: string
}
export type PublishEvent = {
  values: {
    publishedAt: Date | null
  }
  onSuccess?: () => void
  onError?: (error: Error) => void
  onFinally?: () => void
}

const AdminPublishBlock: React.FC<{
  type: PublishStatus
  title?: string
  description?: string
  checklist?: (ChecklistItemProps | null)[]
  onPublish?: (event: PublishEvent) => void
}> = ({ type, title, description, checklist, onPublish }) => {
  const [loading, setLoading] = useState(false)

  return (
    <>
      <div className="text-center mb-4">
        {type === 'alert' && <StatusAlertIcon />}
        {type === 'ordinary' && <StatusOrdinaryIcon />}
        {type === 'success' && <StatusSuccessIcon />}
      </div>

      <StyledTitle className="text-center mb-2">{title}</StyledTitle>
      <StyledDescription className="text-center">{description}</StyledDescription>

      {checklist && checklist.length > 0 && (
        <StyledMetaBlock>
          {checklist.map(
            checkItem =>
              checkItem && (
                <StyledMeta key={checkItem.id}>
                  <ExclamationCircleIcon className="mr-2" />
                  <span className="mr-2">{checkItem.text}</span>

                  {checkItem.tabkey && (
                    <Link
                      to={{
                        search: `tabkey=${checkItem.tabkey}`,
                      }}
                    >
                      <Button type="link" size="small">
                        <span>前往填寫</span>
                        <Icon type="right" />
                      </Button>
                    </Link>
                  )}
                </StyledMeta>
              ),
          )}
        </StyledMetaBlock>
      )}

      <div className="text-center">
        <Button
          type={type === 'success' ? 'default' : 'primary'}
          disabled={type === 'alert'}
          loading={loading}
          onClick={() => {
            setLoading(true)

            onPublish &&
              onPublish({
                values: {
                  publishedAt: type === 'ordinary' ? new Date() : null,
                },
                onSuccess: () => message.success('發佈成功'),
                onError: () => message.error('發佈失敗'),
                onFinally: () => setLoading(false),
              })
          }}
        >
          {type === 'success' ? '取消發佈' : '立即發佈'}
        </Button>
      </div>
    </>
  )
}

export default AdminPublishBlock
