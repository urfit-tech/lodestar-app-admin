import { SwapOutlined } from '@ant-design/icons'
import {
  Box,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react'
import { Button, Select } from 'antd'
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
        <ModalOverlay zIndex="0" />
        <ModalContent containerProps={{ zIndex: '0' }}>
          <ModalHeader>{formatMessage(saleMessages.TransferModal.modalTitle)}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box mb="2"></Box>
            <Box>
              <Select
                allowClear
                showSearch
                placeholder="請輸入承辦編號"
                options={transferManagers.map(manager => ({
                  value: manager.id,
                  label: `${manager.name}, ${manager.email}`,
                }))}
                filterOption={(input, option) =>
                  ((option?.label as string).toLowerCase() ?? '').includes(input.toLowerCase())
                }
                onSelect={(value: string) => setSelectedManagerId(value)}
                style={{ minWidth: '14em' }}
              />
            </Box>
          </ModalBody>

          <ModalFooter>
            <Button
              className="mr-2"
              onClick={() => {
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
