import { CopyOutlined } from '@ant-design/icons'
import { Button, message, Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import React, { useEffect, useMemo, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { copyToClipboard } from '../../helpers'
import { commonMessages } from '../../helpers/translation'
import saleMessages from './translation'

const StyledWrapper = styled.div`
  position: relative;
  padding-top: calc(900% / 16);
  background: var(--gray-lighter);
`
const JitsiWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
`

const JitsiDemoModal: React.FC<
  ModalProps & {
    member:
      | {
          id: string
          name: string
        }
      | undefined
      | null
    salesMember: {
      id: string
      name: string
      email: string
    }
    onFinishCall?: (duration: number) => void
  }
> = ({ member, salesMember, onFinishCall, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const { id: appId } = useApp()
  const [jitsiUsers, setJitsiUsers] = useState<{
    [userId: string]: { startedAt: Date; endedAt: Date | null }
  }>({})

  const roomName = `${process.env.NODE_ENV === 'development' ? 'dev' : appId}-${member?.id}`
  const jitsiMeeting = useMemo(
    () => (
      <JitsiMeetingBlock
        roomName={roomName}
        userInfo={{
          email: salesMember.email,
          displayName: salesMember.name,
        }}
        onReady={() => {
          setJitsiUsers({})
        }}
        onParticipantJoined={event => {
          setJitsiUsers(prev => ({
            ...prev,
            [event.id]: { startedAt: new Date(), endedAt: null },
          }))
        }}
        onParticipantLeft={event => {
          setJitsiUsers(prev => ({
            ...prev,
            [event.id]: {
              startedAt: prev[event.id].startedAt,
              endedAt: new Date(),
            },
          }))
        }}
        onDestroy={() => {
          setJitsiUsers({})
        }}
      />
    ),
    [roomName, salesMember],
  )

  return (
    <Modal
      width="100%"
      maskClosable={false}
      closable={false}
      centered
      destroyOnClose
      okText={formatMessage(saleMessages.JitsiDemoModal.endCall)}
      okButtonProps={{
        disabled: Object.values(jitsiUsers).length === 0 || Object.values(jitsiUsers).every(user => !user.endedAt),
      }}
      onOk={() => {
        const startedAt = Math.min(...Object.values(jitsiUsers).map(user => user.startedAt.getTime()))
        const endedAt = Math.max(...Object.values(jitsiUsers).map(user => user.endedAt?.getTime() || 0))
        const duration = Math.ceil((endedAt - startedAt) / 1000)
        if (duration) {
          onFinishCall?.(duration)
        }
      }}
      onCancel={() => setJitsiUsers({})}
      {...modalProps}
    >
      <StyledWrapper>{jitsiMeeting}</StyledWrapper>
      {member && (
        <Button
          type="primary"
          icon={<CopyOutlined />}
          className="mt-3"
          onClick={() => {
            copyToClipboard(
              'https://meet.jit.si/ROOM_NAME#config.startWithVideoMuted=true&userInfo.displayName="MEMBER_NAME"'
                .replace('ROOM_NAME', roomName)
                .replace('MEMBER_NAME', member.name),
            )
            message.success(formatMessage(commonMessages.text.copiedToClipboard))
          }}
        >
          {formatMessage(saleMessages.JitsiDemoModal.copyInviteLink)}
        </Button>
      )}
    </Modal>
  )
}

const JitsiMeetingBlock: React.FC<{
  roomName: string
  userInfo: {
    email: string
    displayName: string
  }
  onReady?: () => void
  onParticipantJoined?: (event: { id: string; displayName: string }) => void
  onParticipantLeft?: (event: { id: string }) => void
  onDestroy?: () => void
}> = ({ roomName, userInfo, onReady, onParticipantJoined, onParticipantLeft, onDestroy }) => {
  useEffect(() => {
    const parentNode = document.querySelector('#jitsi-meeting')
    const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
      roomName,
      width: '100%',
      height: '100%',
      parentNode,
      userInfo,
      configOverwrite: {
        startWithVideoMuted: true,
        defaultLanguage: 'zhTW',
      },
      interfaceConfigOverwrite: {
        LANG_DETECTION: false,
      },
    })
    onReady?.()

    api.addListener('participantJoined', onParticipantJoined)
    api.addListener('participantLeft', onParticipantLeft)

    return () => {
      api.dispose()
      onDestroy?.()
    }
  }, [onDestroy, onParticipantJoined, onParticipantLeft, onReady, roomName, userInfo])

  return <JitsiWrapper id="jitsi-meeting" />
}

export default JitsiDemoModal
