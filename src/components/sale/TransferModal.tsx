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
import { useTransferManagers } from '../../hooks/member'

const TransferModal: React.FC<{ onManagerIdChange: (value: string) => void }> = ({ onManagerIdChange }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchValue, setSearchValue] = useState('')
  const [selectedManagerId, setSelectedManagerId] = useState('')
  const { transferManagers } = useTransferManagers()

  return (
    <>
      <Button className="mr-2" onClick={onOpen} aria-label="transfer">
        <Icon as={SwapOutlined} className="mr-1" />
        <span>轉移</span>
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>你要轉移此名單給哪個承辦編號？</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb="2">
              <Input
                placeholder="請輸入至少兩個關鍵字"
                onChange={value => {
                  setSearchValue(value.target.value.toLowerCase())
                }}
              />
            </Box>
            <Box>
              <Select defaultValue="" onChange={value => setSelectedManagerId(value.target.value)}>
                <option value="" disabled>
                  請選擇承辦編號
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
              確認
            </Button>
            <Button
              onClick={() => {
                setSearchValue('')
                setSelectedManagerId('')
                onClose()
              }}
            >
              取消
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TransferModal
