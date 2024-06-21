import { SwapOutlined } from '@ant-design/icons'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Icon,
  Select,
  Input,
  Box,
} from '@chakra-ui/react'
import { Button } from 'antd'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useTransferManagers } from '../../hooks/member'
import saleMessages from './translation'

const TransferModal: React.FC<{ onManagerIdChange: (value: string) => void }> = ({ onManagerIdChange }) => {
  const { formatMessage } = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchValue, setSearchValue] = useState('')
  const [selectedManagerId, setSelectedManagerId] = useState('')
  const { transferManagers } = useTransferManagers()

  return (
    <>
      <Button className="mr-2" onClick={onOpen} aria-label="transfer">
        <Icon as={SwapOutlined} className="mr-1" />
        <span>{formatMessage(saleMessages.TransferModal.transfer)}</span>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{formatMessage(saleMessages.TransferModal.modalTitle)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb="2">
              <Input
                placeholder={formatMessage(saleMessages.TransferModal.inputPlaceHolder)}
                onChange={value => {
                  setSearchValue(value.target.value.toLowerCase())
                }}
              />
            </Box>
            <Box>
              <Select defaultValue="" onChange={value => setSelectedManagerId(value.target.value)}>
                <option value="" disabled>
                  {formatMessage(saleMessages.TransferModal.pleaseSelectManager)}
                </option>
                {transferManagers
                  .filter(manager =>
                    searchValue !== '' && searchValue.length >= 2
                      ? manager.email.includes(searchValue) || manager.name.includes(searchValue)
                      : manager,
                  )
                  .map(manager => (
                    <option key={manager.id} value={manager.id}>{`${manager.name} , ${manager.email}`}</option>
                  ))}
              </Select>
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              className="mr-2"
              type="primary"
              onClick={() => selectedManagerId !== '' && onManagerIdChange(selectedManagerId)}
            >
              {formatMessage(saleMessages.TransferModal.confirm)}
            </Button>
            <Button
              onClick={() => {
                setSearchValue('')
                setSelectedManagerId('')
                onClose()
              }}
            >
              {formatMessage(saleMessages['*'].cancel)}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TransferModal
