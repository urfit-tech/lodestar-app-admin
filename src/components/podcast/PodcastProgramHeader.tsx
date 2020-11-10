import { ArrowLeftOutlined } from '@ant-design/icons'
import { Button, Modal, Spin } from 'antd'
import React, { useContext, useState } from 'react'
import { useIntl } from 'react-intl'
import { useHistory } from 'react-router-dom'
import AppContext from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { handleError } from '../../helpers'
import { commonMessages, podcastMessages } from '../../helpers/translation'
import { mergePodcastProgram } from '../../pages/default/RecordingPageHelpers'
import { AdminHeader, AdminHeaderTitle } from '../admin'

const PodcastProgramHeader: React.FC<{
  podcastProgramId: string
  title?: string | null
  noPreview?: boolean
  goBackLink?: string | null
}> = ({ podcastProgramId, title, noPreview, goBackLink }) => {
  const { formatMessage } = useIntl()
  const history = useHistory()
  const { authToken, backendEndpoint } = useAuth()
  const { settings, id: appId } = useContext(AppContext)
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)

  return (
    <AdminHeader>
      <Button type="link" onClick={() => (goBackLink ? history.push(goBackLink) : history.goBack())} className="mr-3">
        <ArrowLeftOutlined />
      </Button>

      <AdminHeaderTitle>{title || podcastProgramId}</AdminHeaderTitle>

      {!noPreview && (
        <Button
          onClick={() => {
            const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
            const windowReference = isSafari ? window.open() : null
            setIsGeneratingAudio(true)
            mergePodcastProgram(authToken, backendEndpoint, appId, podcastProgramId)
              .then(() => {
                setIsGeneratingAudio(false)
                if (windowReference) {
                  ;(windowReference.location as any) = `https://${settings['host']}/podcasts/${podcastProgramId}`
                } else {
                  window.open(`https://${settings['host']}/podcasts/${podcastProgramId}`, '_blank')
                }
              })
              .catch(handleError)
          }}
        >
          {formatMessage(commonMessages.ui.preview)}
        </Button>
      )}

      <Modal visible={isGeneratingAudio} closable={false} footer={false}>
        <div className="text-center">
          <Spin size="large" className="my-5" />
          <p className="mb-5">{formatMessage(podcastMessages.text.generatingVoice)}</p>
        </div>
      </Modal>
    </AdminHeader>
  )
}

export default PodcastProgramHeader
