import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import moment from 'moment'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { useCurrency } from '../../hooks/currency'
import { ContractWithProducts } from '../../types/contract'
import ProductTypeLabel from '../common/ProductTypeLabel'
import MemberContractInfoCouponList from './MemberContractInfoCouponList'
import contractMessages from './translation'

type Snapshot = {
  values: any
  snapshotAt: string
  changedBy?: {
    memberId: string
    name?: string
    email?: string
    username?: string
  }
}

const MemberContractHistoryModal: React.FC<{
  contract: ContractWithProducts
  isOpen: boolean
  onClose: () => void
}> = ({ contract, isOpen, onClose }) => {
  const { formatMessage } = useIntl()
  const { formatCurrency } = useCurrency()
  const { id: appId } = useApp()
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set())

  const HIDE_COUPON_SITES = ['sixdigital', 'nschool', 'kkschool', 'xlab']
  const contractListHideCoupon = HIDE_COUPON_SITES.includes(appId)

  const toggleRow = (index: number) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRows(newExpanded)
  }

  const options = (contract.options as any) || {}
  let snapshots: Snapshot[] = []

  if (Array.isArray(options.snapshots)) {
    // 如果有 snapshots 数组，直接使用
    snapshots = options.snapshots
  } else if (options.previousValues) {
    // 如果没有 snapshots 数组但有 previousValues，转换为 snapshot 格式
    snapshots = [
      {
        values: options.previousValues,
        snapshotAt: options.snapshotAt || contract.createdAt.toISOString(),
        changedBy: options.changedBy,
      },
    ]
  }

  // 按時間倒序排列
  const sortedSnapshots = [...snapshots].sort(
    (a, b) => new Date(b.snapshotAt).valueOf() - new Date(a.snapshotAt).valueOf(),
  )

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size="xl">
      <ModalOverlay />
      <ModalContent p="1rem">
        <ModalHeader>{formatMessage(contractMessages.MemberContractHistoryModal.history)}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {sortedSnapshots.length === 0 ? (
            <Box textAlign="center" py="2rem" color="gray.500">
              {formatMessage(contractMessages.MemberContractHistoryModal.noHistory)}
            </Box>
          ) : (
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>{formatMessage(contractMessages.MemberContractHistoryModal.snapshotAt)}</Th>
                  <Th>{formatMessage(contractMessages.MemberContractHistoryModal.changedBy)}</Th>
                  <Th>{formatMessage(contractMessages.MemberContractHistoryModal.startedAt)}</Th>
                  <Th>{formatMessage(contractMessages.MemberContractHistoryModal.endedAt)}</Th>
                </Tr>
              </Thead>
              <Tbody>
                {sortedSnapshots.map((snapshot, index) => {
                  const changedByName =
                    snapshot.changedBy?.name || snapshot.changedBy?.username || snapshot.changedBy?.email || '-'
                  const startedAt = snapshot.values?.startedAt
                  const endedAt = snapshot.values?.endedAt
                  const isExpanded = expandedRows.has(index)

                  // 處理快照中的產品、優惠券、代幣
                  const orderProducts =
                    snapshot.values?.orderProducts?.map((orderProduct: any) => ({
                      productId: orderProduct.product_id,
                      name: orderProduct.name,
                    })) || []

                  const coupons =
                    snapshot.values?.coupons?.map((coupon: any) => ({
                      id: coupon.id,
                      code: coupon.coupon_code?.data?.code,
                    })) || []

                  const coinLogs =
                    snapshot.values?.coinLogs
                      ?.filter((coinLog: any) => coinLog.amount !== 0)
                      ?.map((coinLog: any) => ({
                        id: coinLog.id,
                        title: coinLog.title,
                        amount: coinLog.amount,
                      })) || []

                  const price = snapshot.values?.price || 0

                  return (
                    <React.Fragment key={index}>
                      <Tr cursor="pointer" onClick={() => toggleRow(index)} _hover={{ bg: 'gray.50' }}>
                        <Td>{moment(snapshot.snapshotAt).format('YYYY-MM-DD HH:mm:ss')}</Td>
                        <Td>{changedByName}</Td>
                        <Td>{startedAt ? moment(startedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Td>
                        <Td>{endedAt ? moment(endedAt).format('YYYY-MM-DD HH:mm:ss') : '-'}</Td>
                      </Tr>
                      {isExpanded && (
                        <Tr>
                          <Td colSpan={4} p={0}>
                            <Box p="1rem" bg="gray.50">
                              <Flex mb="0.5rem">
                                <Box minW="85px" fontWeight="bold">
                                  {formatMessage(contractMessages.MemberContractInfoModal.totalPrice)}：
                                </Box>
                                <Box>{formatCurrency(price)}</Box>
                              </Flex>

                              <Flex mb="0.5rem">
                                <Box minW="85px" fontWeight="bold">
                                  {formatMessage(contractMessages.MemberContractInfoModal.productItems)}：
                                </Box>
                                <Box w="100%" maxH="25vh" overflowY="auto">
                                  {orderProducts.length > 0 ? (
                                    <Box mb="0.5rem">
                                      <Flex fontWeight="bold" mb="0.125rem">
                                        <Box>【{formatMessage(contractMessages['*'].product)}】</Box>
                                        <Box> x {orderProducts.length}</Box>
                                      </Flex>
                                      {orderProducts
                                        .slice()
                                        .sort((a, b) => a.productId.localeCompare(b.productId))
                                        .map((orderProduct: { productId: string; name: string }) => {
                                          const id = orderProduct.productId
                                          const productType = id?.split('_')?.[0] || ''
                                          return (
                                            <Flex key={id}>
                                              <Box whiteSpace="nowrap" display="inline-block">
                                                【<ProductTypeLabel productType={productType} />】
                                              </Box>
                                              <Box whiteSpace="nowrap" display="inline-block">
                                                {orderProduct.name}
                                              </Box>
                                            </Flex>
                                          )
                                        })}
                                    </Box>
                                  ) : null}

                                  {!contractListHideCoupon && coupons.length > 0 ? (
                                    <Box mt="0.5rem" mb="0.25rem">
                                      <Flex fontWeight="bold" mb="0.125rem">
                                        <Box>【{formatMessage(contractMessages['*'].coupon)}】</Box>
                                        <Box> x {coupons.length}</Box>
                                      </Flex>
                                      <MemberContractInfoCouponList
                                        couponIds={coupons.map(coupon => coupon.id).filter(Boolean)}
                                      />
                                    </Box>
                                  ) : null}

                                  {!contractListHideCoupon && coinLogs.length > 0 ? (
                                    <Box mt="0.5rem" mb="0.25rem">
                                      <Flex fontWeight="bold" mb="0.125rem">
                                        <Box>【{formatMessage(contractMessages['*'].coin)}】</Box>
                                        <Box> x {coinLogs.length}</Box>
                                      </Flex>
                                      {coinLogs.map(coinLog => {
                                        return (
                                          <Flex key={coinLog.id} ml="0.5rem">
                                            <Box whiteSpace="nowrap" display="inline-block">
                                              {coinLog.title}
                                            </Box>
                                            <Box>&nbsp;/&nbsp;</Box>
                                            <Box whiteSpace="nowrap" display="inline-block">
                                              {coinLog.amount}
                                            </Box>
                                          </Flex>
                                        )
                                      })}
                                    </Box>
                                  ) : null}
                                </Box>
                              </Flex>
                            </Box>
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  )
                })}
              </Tbody>
            </Table>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default MemberContractHistoryModal
