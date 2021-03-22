import { CopyOutlined } from '@ant-design/icons'
import { Button, message, Modal } from 'antd'
import { ModalProps } from 'antd/lib/modal'
import { copyToClipboard } from 'lodestar-app-admin/src/helpers'
import { commonMessages } from 'lodestar-app-admin/src/helpers/translation'
import React, { useEffect, useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'

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
    member: {
      id: string
      name: string
    } | null
    salesMember: {
      id: string
      name: string
      email: string
    }
    onFinishCall?: (duration: number) => void
  }
> = ({ member, salesMember, onFinishCall, ...modalProps }) => {
  const { formatMessage } = useIntl()
  const [roomStatus, setRoomStatus] = useState<{
    jitsiUserId: string | null
    startedAt: Date | null
    endedAt: Date | null
  } | null>(null)

  const roomName = `${process.env.NODE_ENV === 'development' ? 'dev' : 'xuemi'}-${member?.id}`

  return (
    <Modal
      width="100vw"
      maskClosable={false}
      closeIcon={null}
      okText="結束通話"
      okButtonProps={{
        disabled: !roomStatus || !roomStatus.startedAt || !roomStatus.endedAt,
      }}
      onOk={() => {
        if (!roomStatus || !roomStatus.startedAt || !roomStatus.endedAt) {
          return
        }
        onFinishCall?.(Math.ceil((roomStatus.endedAt.getTime() - roomStatus.startedAt.getTime()) / 1000))
      }}
      onCancel={() => setRoomStatus(null)}
      {...modalProps}
    >
      <StyledWrapper>
        <JitsiMeetingBlock
          roomName={roomName}
          salesMember={salesMember}
          onReady={() => {
            setRoomStatus(null)
          }}
          onParticipantJoined={event => {
            if (!roomStatus || roomStatus.jitsiUserId === event.id) {
              setRoomStatus({
                jitsiUserId: event.id,
                startedAt: new Date(),
                endedAt: null,
              })
            }
          }}
          onParticipantLeft={event => {
            if (event.id === roomStatus?.jitsiUserId) {
              setRoomStatus(prev => (prev ? { ...prev, endedAt: new Date() } : null))
            }
          }}
          onDestroy={() => {
            setRoomStatus(null)
          }}
        />
      </StyledWrapper>

      {member && (
        <Button
          icon={<CopyOutlined />}
          className="mt-2"
          onClick={() => {
            copyToClipboard(
              `https://meet.jit.si/ROOM_NAME#config.startWithVideoMuted=true&userInfo.displayName="MEMBER_NAME"`
                .replace('ROOM_NAME', roomName)
                .replace('MEMBER_NAME', member.name),
            )
            message.success(formatMessage(commonMessages.text.copiedToClipboard))
          }}
        >
          複製邀請連結
        </Button>
      )}
    </Modal>
  )
}

const JitsiMeetingBlock: React.FC<{
  roomName: string
  salesMember: {
    id: string
    email: string
    name: string
  }
  onReady?: () => void
  onParticipantJoined?: (event: { id: string; displayName: string }) => void
  onParticipantLeft?: (event: { id: string }) => void
  onDestroy?: () => void
}> = ({ roomName, salesMember, onReady, onParticipantJoined, onParticipantLeft, onDestroy }) => {
  useEffect(() => {
    const parentNode = document.querySelector('#jitsi-meeting')
    const api = new (window as any).JitsiMeetExternalAPI('meet.jit.si', {
      roomName,
      width: '100%',
      height: '100%',
      parentNode,
      userInfo: {
        email: salesMember.email,
        displayName: salesMember.name,
      },
    })
    onReady?.()

    api.addListener('participantJoined', onParticipantJoined)
    api.addListener('participantLeft', onParticipantLeft)

    return () => {
      api.dispose()
      onDestroy?.()
    }
  }, [onDestroy, onParticipantJoined, onParticipantLeft, onReady, roomName, salesMember])

  return <JitsiWrapper id="jitsi-meeting" />
}

export default JitsiDemoModal
