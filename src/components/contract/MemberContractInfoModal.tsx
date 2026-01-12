import { Box, Button, Flex, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure } from '@chakra-ui/react'
import dayjs from 'dayjs'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { FaAngleRight } from 'react-icons/fa'
import { useIntl } from 'react-intl'
import { useCurrency } from '../../hooks/currency'
import { ContractWithProducts } from '../../types/contract'
import ProductTypeLabel from '../common/ProductTypeLabel'
import MemberContractInfoCouponList from './MemberContractInfoCouponList'
import contractMessages from './translation'

const MemberContractInfoModal: React.FC<{ memberContract: ContractWithProducts }> = ({ memberContract }) => {
  const theme = useAppTheme()
  const { formatMessage } = useIntl()
  const { formatCurrency } = useCurrency()
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box>
      <Button p="0" variant="ghost" color={theme.colors.primary[500]} rightIcon={<FaAngleRight />} onClick={onOpen}>
        {formatMessage(contractMessages.MemberContractInfoModal.viewProduct)}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent p="1rem">
          <ModalHeader>{memberContract.title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex mb="0.5rem">
              <Box minW="85px">{formatMessage(contractMessages.MemberContractInfoModal.startedAt)}：&nbsp;</Box>
              <Box>{dayjs(memberContract.startedAt).format('YYYY-MM-DD HH:mm:ss')}</Box>
            </Flex>
            <Flex mb="0.5rem">
              <Box minW="85px">{formatMessage(contractMessages.MemberContractInfoModal.endedAt)}：&nbsp;</Box>
              <Box>{dayjs(memberContract.endedAt).format('YYYY-MM-DD HH:mm:ss')}</Box>
            </Flex>
            <Flex mb="0.5rem">
              <Box minW="85px">{formatMessage(contractMessages.MemberContractInfoModal.totalPrice)}：&nbsp;</Box>
              {formatCurrency(memberContract.values?.price || 0)}
            </Flex>

            <Flex mb="0.5rem">
              <Box minW="85px">{formatMessage(contractMessages.MemberContractInfoModal.productItems)}：&nbsp;</Box>
              <Box w="100%" h="25vh" overflowY="auto">
                {memberContract.orderProducts?.length > 0 ? (
                  <Box mb="0.5rem">
                    <Flex fontWeight="bold" mb="0.125rem">
                      <Box>【{formatMessage(contractMessages['*'].product)}】</Box>
                      <Box> x {memberContract?.orderProducts.length}</Box>
                    </Flex>
                    {memberContract?.orderProducts
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

                {memberContract.coupons?.length > 0 ? (
                  <Box mt="0.5rem" mb="0.25rem">
                    <Flex fontWeight="bold" mb="0.125rem">
                      <Box>【{formatMessage(contractMessages['*'].coupon)}】</Box>
                      <Box> x {memberContract.coupons.length}</Box>
                    </Flex>
                    <MemberContractInfoCouponList couponIds={memberContract.coupons.map(coupon => coupon.id)} />
                  </Box>
                ) : null}

                {memberContract.coinLogs?.length > 0 && memberContract.coinLogs.some(coinLog => coinLog.amount > 0) ? (
                  <Box mt="0.5rem" mb="0.25rem">
                    <Flex fontWeight="bold" mb="0.125rem">
                      <Box>【{formatMessage(contractMessages['*'].coin)}】</Box>
                      <Box> x {memberContract.coinLogs.length}</Box>
                    </Flex>
                    {memberContract.coinLogs
                      .filter(coinLog => coinLog.amount > 0)
                      .map(coinLog => {
                        const id = coinLog.id
                        const title = coinLog.title
                        const amount = coinLog.amount
                        return amount !== 0 ? (
                          <Flex key={id} ml="0.5rem">
                            <Box whiteSpace="nowrap" display="inline-block">
                              {title}
                            </Box>
                            <Box>&nbsp;/&nbsp;</Box>
                            <Box whiteSpace="nowrap" display="inline-block">
                              {coinLog.amount}
                            </Box>
                          </Flex>
                        ) : null
                      })}
                  </Box>
                ) : null}
              </Box>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default MemberContractInfoModal
