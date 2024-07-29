import { Text } from '@chakra-ui/layout'
import {
  Button,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from '@chakra-ui/react'
import { Space } from 'antd'
import axios from 'axios'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { ReactComponent as Note } from '../../images/icon/memberNote-note.svg'
import memberMessages from './translation'

const StyledStatus = styled.span<{ cursor?: 'pointer' | 'not-allowed' }>`
  display: flex;
  align-items: center;
  cursor: ${props => props.cursor || 'auto'};
`

const MemberNoteTranscriptModal: React.FC<{ attachmentId: string; transcript: string | null; onRefetch?: () => void }> =
  ({ attachmentId, transcript, onRefetch }) => {
    const toast = useToast()
    const theme = useAppTheme()
    const { authToken } = useAuth()
    const { formatMessage } = useIntl()
    const { isOpen, onOpen, onClose } = useDisclosure()
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (attachmentId: string) => {
      setLoading(true)
      try {
        await axios.post(
          `${process.env.REACT_APP_KOLABLE_SERVER_ENDPOINT}/kolable/attachment/transcribe/${attachmentId}`,
          {},
          {
            headers: {
              authorization: `Bearer ${authToken}`,
            },
          },
        )
      } catch (error) {
        toast({
          title: formatMessage(memberMessages.MemberNoteTranscriptModal.transcriptError),
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      } finally {
        setLoading(false)
      }
      onRefetch?.()
      onClose()
    }

    return (
      <>
        {transcript ? (
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>{formatMessage(memberMessages.MemberNoteTranscriptModal.transcript)}</ModalHeader>
              <ModalCloseButton />

              <ModalBody whiteSpace="pre-line">{transcript}</ModalBody>
            </ModalContent>
          </Modal>
        ) : (
          <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
              <ModalHeader>{formatMessage(memberMessages.MemberNoteTranscriptModal.transcript)}</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>{formatMessage(memberMessages.MemberNoteTranscriptModal.transcriptText1)}</Text>
                <Text>{formatMessage(memberMessages.MemberNoteTranscriptModal.transcriptText2)}</Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose} isLoading={loading}>
                  {formatMessage(memberMessages['*'].cancel)}
                </Button>
                <Button
                  variant="primary"
                  bg={theme.colors.primary[500]}
                  color="#fff"
                  onClick={() => handleSubmit(attachmentId)}
                  isLoading={loading}
                >
                  {formatMessage(memberMessages['*'].confirm)}
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        )}
        <StyledStatus cursor={'pointer'} onClick={onOpen}>
          <Space>
            <Icon as={Note} />
            {transcript
              ? formatMessage(memberMessages.MemberNoteTranscriptModal.transcript)
              : formatMessage(memberMessages.MemberNoteTranscriptModal.transformTranscript)}
          </Space>
        </StyledStatus>
      </>
    )
  }

export default MemberNoteTranscriptModal
