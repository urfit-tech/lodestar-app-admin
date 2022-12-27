import Icon, { DownOutlined, RightOutlined, WarningOutlined } from '@ant-design/icons'
import { Button, Dropdown, Menu, message, Modal } from 'antd'
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
  unpublishingTitle: { id: 'common.text.unpublishingTitle', defaultMessage: '確定要取消發佈？' },
  unpublishingWarning: {
    id: 'common.text.unpublishingWarning',
    defaultMessage: '將下架且不會出現在列表，已擁有權益的會員仍然可以看到內容。',
  },
  confirmPrivatelyPublishedTitle: {
    id: 'common.confirmPrivatelyPublishedTitle',
    defaultMessage: '確定要設為私密發佈？',
  },
  confirmPrivatelyPublishedNotation: {
    id: 'common.confirmPrivatelyPublishedNotation',
    defaultMessage: '將不會出現在列表，僅以私下提供連結的方式。',
  },
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
    isPrivate: boolean
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
  privatelyPublishText?: string
  unPublishText?: string
  isPrivateEnabled?: boolean
  unpublishingWarningText?: string
  onPublish?: (event: PublishEvent) => void
}> = ({
  type,
  title,
  description,
  checklist,
  publishText,
  privatelyPublishText,
  unPublishText,
  isPrivateEnabled,
  unpublishingWarningText,
  onPublish,
}) => {
  const { formatMessage } = useIntl()
  const [loading, setLoading] = useState(false)

  const handlePublish = (isPrivate?: boolean) => {
    if (type === 'alert') return
    setLoading(true)
    const publish = () =>
      onPublish?.({
        values: {
          publishedAt: type === 'ordinary' ? new Date() : null,
          isPrivate: Boolean(isPrivate),
        },
        onSuccess: () => message.success(formatMessage(commonMessages.event.successfullySaved)),
        onError: () => message.error(formatMessage(messages.publishingFailed)),
        onFinally: () => setLoading(false),
      })

    if (type === 'success') {
      Modal.confirm({
        title: formatMessage(messages.unpublishingTitle),
        content: unpublishingWarningText || formatMessage(messages.unpublishingWarning),
        onOk: publish,
        onCancel: () => {
          setLoading(false)
        },
      })
    } else if (isPrivate && isPrivateEnabled === true) {
      Modal.confirm({
        icon: <WarningOutlined />,
        title: formatMessage(messages.confirmPrivatelyPublishedTitle),
        content: formatMessage(messages.confirmPrivatelyPublishedNotation),
        onOk: publish,
        onCancel: () => {
          setLoading(false)
        },
      })
    } else {
      publish()
    }
  }
  const mergedPrivatePublishText = privatelyPublishText || formatMessage(commonMessages.ui.privatelyPublished)
  const nonPubliclyPublishedOverlay = (
    <Menu>
      {[mergedPrivatePublishText].map(publishText => (
        <Menu.Item key={publishText}>
          <Button type="link" onClick={() => handlePublish(publishText === mergedPrivatePublishText)}>
            {publishText}
          </Button>
        </Menu.Item>
      ))}
    </Menu>
  )

  return (
    <>
      <div className="text-center mb-4">
        {type === 'alert' && <Icon component={() => <StatusAlertIcon />} />}
        {type === 'ordinary' && <Icon component={() => <StatusOrdinaryIcon />} />}
        {type === 'success' && <Icon component={() => <StatusSuccessIcon />} />}
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
                        <RightOutlined />
                      </Button>
                    </Link>
                  )}
                </StyledMeta>
              ),
          )}
        </StyledMetaBlock>
      )}

      <div className="text-center">
        {type === 'ordinary' && isPrivateEnabled ? (
          <Dropdown.Button
            type="primary"
            icon={<DownOutlined />}
            overlay={nonPubliclyPublishedOverlay}
            onClick={() => handlePublish()}
          >
            {publishText || formatMessage(commonMessages.ui.publiclyPublished)}
          </Dropdown.Button>
        ) : (
          <Button
            type={type === 'success' ? 'default' : 'primary'}
            disabled={type === 'alert'}
            loading={loading}
            onClick={() => handlePublish()}
          >
            {type === 'success'
              ? unPublishText || formatMessage(commonMessages.ui.cancelPublishing)
              : publishText || formatMessage(commonMessages.ui.publish)}
          </Button>
        )}
      </div>
    </>
  )
}

export default AdminPublishBlock
