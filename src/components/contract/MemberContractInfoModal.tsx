import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Flex,
} from '@chakra-ui/react'
import { useIntl } from 'react-intl'
import { ContractWithProducts } from '../../types/contract'
import contractMessages from './translation'
import dayjs from 'dayjs'
import { FaAngleRight } from 'react-icons/fa'
import { useAppTheme } from 'lodestar-app-element/src/contexts/AppThemeContext'
import { useCurrency } from '../../hooks/currency'
import ProductTypeLabel from '../common/ProductTypeLabel'
import MemberContractInfoCouponList from './MemberContractInfoCouponList'

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
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
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
                {Boolean(memberContract.values?.orderProducts.length) ? (
                  <Box mb="0.5rem" ml="1rem">
                    <Flex>
                      <Box>【{formatMessage(contractMessages['*'].product)}】</Box>
                      <Box> x {memberContract.values?.orderProducts.length}</Box>
                    </Flex>
                    {memberContract.values?.orderProducts
                      .slice()
                      .sort((a, b) => a.product_id.localeCompare(b.product_id))
                      .map((orderProduct: { product_id: string; name: string }) => {
                        const id = orderProduct.product_id
                        const productType = id?.split('_')?.[0] || ''
                        return (
                          <Box key={id}>
                            【<ProductTypeLabel productType={productType} />】{`${orderProduct.name}`}
                          </Box>
                        )
                      })}
                  </Box>
                ) : null}

                {Boolean(memberContract.coupons.length) ? (
                  <Box mt="0.5rem" mb="0.25rem" ml="1rem">
                    <Flex>
                      <Box>【{formatMessage(contractMessages['*'].coupon)}】</Box>
                      <Box> x {memberContract.coupons.length}</Box>
                    </Flex>
                    <MemberContractInfoCouponList couponIds={memberContract.coupons.map(coupon => coupon.id)} />
                  </Box>
                ) : null}

                {Boolean(memberContract.coinLogs.length) &&
                memberContract.coinLogs.some(coinLog => coinLog.amount > 0) ? (
                  <Box mt="0.5rem" mb="0.25rem" ml="1rem">
                    <Flex>
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
                          <Box key={id}>
                            {title} / {coinLog.amount}
                          </Box>
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
