import { SwapOutlined } from '@ant-design/icons'
import {
  Box,
  Icon,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
} from '@chakra-ui/react'
import { Button } from 'antd'
import { useState } from 'react'
import { useIntl } from 'react-intl'
import { useTransferManagers } from '../../hooks/member'
import { useLeadStatusCategory } from '../../hooks/sales'
import { SalesLeadMember } from '../../types/sales'
import saleMessages from './translation'

const TransferModal: React.FC<{
  selectedRowLeads: SalesLeadMember[]
  selectedLeadStatusCategoryId?: string
  listStatus: string
  onRefetch: () => Promise<void>
  onTransferFinish: () => void
}> = ({ selectedRowLeads, listStatus, onRefetch, onTransferFinish, selectedLeadStatusCategoryId }) => {
  const { formatMessage } = useIntl()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [searchValue, setSearchValue] = useState('')
  const [selectedManagerId, setSelectedManagerId] = useState('')
  const { transferManagers, transferLeads } = useTransferManagers()
  const { leadStatusCategories, addLeadStatusCategory } = useLeadStatusCategory(
    selectedManagerId,
    selectedLeadStatusCategoryId,
  )

  const handleTransfer = async (managerId: string) => {
    if (managerId === '') return

    if (selectedRowLeads.length > 0) {
      try {
        let leadStatusCategoryId = selectedLeadStatusCategoryId ? leadStatusCategories[0]?.id : null

        if (!!selectedLeadStatusCategoryId && !leadStatusCategoryId) {
          const { data: insertLeadStatusCategoryData } = await addLeadStatusCategory({
            variables: {
              memberId: managerId,
              categoryId: selectedLeadStatusCategoryId,
              status: listStatus,
            },
          })
          leadStatusCategoryId = insertLeadStatusCategoryData?.insert_lead_status_category_one?.id
        }

        const { data } = await transferLeads({
          variables: {
            memberIds: selectedRowLeads.map(member => member.id),
            leadStatusCategoryId,
            managerId,
          },
        })

        if (data?.update_member?.affected_rows) {
          window.alert(formatMessage(saleMessages.TransferModal.transferSuccess))
          onRefetch()
        }
      } catch (error: any) {
        if (error.graphQLErrors) {
          const graphqlErrors = error.graphQLErrors.map((graphqlError: any) => graphqlError.message)
          window.alert(`${formatMessage(saleMessages.TransferModal.transferFailGraphql)}${graphqlErrors.join(', ')}`)
        } else {
          window.alert(`${formatMessage(saleMessages.TransferModal.transferFail)}${error.message}`)
        }
      } finally {
        onTransferFinish()
      }
    }
  }

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
                      ? manager.email.toLowerCase().includes(searchValue) ||
                        manager.name.toLowerCase().includes(searchValue)
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
              onClick={() => {
                setSearchValue('')
                setSelectedManagerId('')
                onClose()
              }}
            >
              {formatMessage(saleMessages['*'].cancel)}
            </Button>
            <Button type="primary" onClick={() => handleTransfer(selectedManagerId)}>
              {formatMessage(saleMessages.TransferModal.confirm)}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default TransferModal
