import { Button, Icon } from 'antd'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'
import { PodcastProgramAdminContext } from '../../containers/podcast/PodcastProgramAdminBlock'
import { ReactComponent as ExclamationCircleIcon } from '../../images/default/exclamation-circle.svg'
import { ReactComponent as StatusAlertIcon } from '../../images/default/status-alert.svg'
import { ReactComponent as StatusOrdinaryIcon } from '../../images/default/status-ordinary.svg'
import { ReactComponent as StatusSuccessIcon } from '../../images/default/status-success.svg'
import { AdminBlock, AdminPaneTitle } from '../admin'

const StyledTitle = styled.div`
  color: var(--gray-darker);
  font-size: 20px;
  font-weight: bold;
  line-height: 1.3;
  letter-spacing: 0.77px;
`
const StyledSubTitle = styled.div`
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
  :not(:last-child) {
    margin-bottom: 0.75rem;
  }

  > .ant-btn {
    color: var(--gray-dark);
    font-size: 14px;
    line-height: normal;
  }
`

const PodcastProgramPublishAdminBlock: React.FC<{
  onChangeTab: (key: string) => void
}> = ({ onChangeTab }) => {
  const { podcastProgramAdmin, updatePodcastProgram } = useContext(PodcastProgramAdminContext)
  const [loading, setLoading] = useState(false)

  const checkedErrors: {
    [key: string]: {
      text: string
      tab: string
      value: boolean
    }
  } = {
    NO_AUDIO: {
      text: '尚未上傳音頻檔案',
      tab: 'content',
      value: typeof podcastProgramAdmin.audioUrl !== 'string',
    },
    NO_COVER: {
      text: '尚未上傳封面',
      tab: 'settings',
      value: typeof podcastProgramAdmin.coverUrl !== 'string',
    },
    NO_PRICE: {
      text: '尚未訂定價格',
      tab: 'plan',
      value: podcastProgramAdmin.listPrice <= 0,
    },
    NO_INSTRUCTOR: {
      text: '尚未指定講師',
      tab: 'role',
      value: podcastProgramAdmin.instructors.length === 0,
    },
  }

  const handlePublish = () => {
    setLoading(true)

    updatePodcastProgram({
      onFinally: () => setLoading(false),
      data: {
        publishedAt: podcastProgramAdmin.publishedAt ? null : new Date(),
      },
    })
  }

  return (
    <div className="container py-5">
      <AdminPaneTitle>發佈設定</AdminPaneTitle>

      <AdminBlock>
        {Object.values(checkedErrors).some(checkedError => checkedError.value) ? (
          <>
            <div className="text-center mb-5">
              <StatusAlertIcon className="mb-4" />
              <StyledTitle className="mb-2">尚有未完成項目</StyledTitle>
              <StyledSubTitle>請填寫以下必填資料，填寫完畢即可由此發佈</StyledSubTitle>
            </div>

            <StyledMetaBlock>
              {Object.keys(checkedErrors).map(key => (
                <StyledMeta key={key} className="d-flex align-items-center justify-content-start">
                  <ExclamationCircleIcon className="mr-2" />
                  <span className="mr-2">{checkedErrors[key].text}</span>
                  <Button type="link" size="small" onClick={() => onChangeTab(checkedErrors[key].tab)}>
                    <span>前往填寫</span>
                    <Icon type="right" />
                  </Button>
                </StyledMeta>
              ))}
            </StyledMetaBlock>
          </>
        ) : !podcastProgramAdmin.publishedAt ? (
          <>
            <div className="text-center mb-5">
              <StatusOrdinaryIcon className="mb-4" />
              <StyledTitle className="mb-2">尚未發佈</StyledTitle>
              <StyledSubTitle>因你的廣播未發佈，此廣播並不會顯示在頁面上，學生也不能購買此廣播。</StyledSubTitle>
            </div>

            <div className="text-center">
              <Button type="primary" loading={loading} onClick={() => handlePublish()}>
                立即發佈
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="text-center mb-5">
              <StatusSuccessIcon className="mb-4" />
              <StyledTitle className="mb-2">已發佈</StyledTitle>
              <StyledSubTitle>現在你的廣播已經發佈，此廣播並會出現在頁面上，學生將能購買此廣播。</StyledSubTitle>
            </div>

            <div className="text-center">
              <Button loading={loading} onClick={() => handlePublish()}>
                取消發佈
              </Button>
            </div>
          </>
        )}
      </AdminBlock>
    </div>
  )
}

export default PodcastProgramPublishAdminBlock
