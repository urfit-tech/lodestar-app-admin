import { Button, Icon, message } from 'antd'
import React, { useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { commonMessages } from '../../helpers/translation'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusOrdinaryIcon } from '../../images/default/status-ordinary.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'
import { ReactComponent as ExclamationCircleIcon } from '../../images/icon/exclamation-circle.svg'

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
  margin-bottom: 2rem;
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

const messages = defineMessages({
  goTo: { id: 'common.ui.goTo', defaultMessage: '前往填寫' },
  publishedSuccessfully: { id: 'common.event.publishedSuccessfully', defaultMessage: '發佈成功' },
  publishingFailed: { id: 'common.event.publishingFailed', defaultMessage: '發佈失敗' },
})

export type PublishStatus = 'alert' | 'ordinary' | 'success'
export type ChecklistItemProps = {
  id: string
  text: string
  tab?: string
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
  checklist?: ChecklistItemProps[]
  publishText?: string
  unPublishText?: string
  onPublish?: (event: PublishEvent) => void
}> = ({ type, title, description, checklist, publishText, unPublishText, onPublish }) => {
  const { formatMessage } = useIntl()
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

                  {checkItem.tab && (
                    <Link
                      to={{
                        search: `tab=${checkItem.tab}`,
                      }}
                    >
                      <Button type="link" size="small">
                        <span>{formatMessage(messages.goTo)}</span>
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
            if (!onPublish) {
              return
            }
            setLoading(true)
            onPublish({
              values: {
                publishedAt: type === 'ordinary' ? new Date() : null,
              },
              onSuccess: () => message.success(formatMessage(commonMessages.event.successfullySaved)),
              onError: () => message.error(formatMessage(messages.publishingFailed)),
              onFinally: () => setLoading(false),
            })
          }}
        >
          {type === 'success'
            ? unPublishText || formatMessage(commonMessages.ui.cancelPublishing)
            : publishText || formatMessage(commonMessages.ui.publish)}
        </Button>
      </div>
    </>
  )
}

export default AdminPublishBlock
