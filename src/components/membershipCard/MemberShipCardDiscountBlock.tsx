import { FileAddOutlined, MoreOutlined } from '@ant-design/icons'
import { Box, Flex, Table as ChakraTable, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { Button, Dropdown, Menu } from 'antd'
import { useIntl } from 'react-intl'
import styled from 'styled-components'
import { useDeleteCardDiscount, useMembershipCardTerms } from '../../hooks/membershipCard'
import { MembershipCardTermsProductType } from '../../types/membershipCard'
import { AdminBlock, AdminPaneTitle } from '../admin'
import MemberShipCardDiscountModal from './MemberShipCardDiscountModal'
import membershipCardMessages from './translation'
import { path, ascend, sortWith, prop, defaultTo } from 'ramda'

const StyledTable = styled(ChakraTable)`
  && {
    font-size: 14px;
  }
  a {
    color: #4c5b8f;
  }
  .th-type {
    font-size: 14px;
    color: #585858;
    font-weight: bold;
  }
`

const StyledTableTh = styled(Th)`
  && {
    font-size: 14px;
    color: #585858;
    font-weight: bold;
  }
`

const MemberShipCardDiscountBlock: React.FC<{ membershipCardId: string }> = ({ membershipCardId }) => {
  const { cardTerm, refetchCardTerm } = useMembershipCardTerms(membershipCardId)
  const { deleteCardDiscount } = useDeleteCardDiscount()
  const { formatMessage } = useIntl()

  const renderProductType = (productType: MembershipCardTermsProductType) => {
    return membershipCardMessages.MembershipCardDiscount[productType]
      ? formatMessage(membershipCardMessages.MembershipCardDiscount[productType])
      : productType
  }

  const renderDiscount = (discount: { type: string; amount: number }) => {
    switch (discount.type) {
      case 'cash':
        return `${formatMessage(membershipCardMessages.MembershipCardDiscount.cashDiscount, {
          amount: `${discount.amount}`,
        })}`
      case 'percentage':
        return `${formatMessage(membershipCardMessages.MembershipCardDiscount.percentageDiscount, {
          amount: `${discount.amount}`,
        })}`
      case 'equity':
        return `${formatMessage(membershipCardMessages.MembershipCardDiscount.equityType)}`
      default:
        return `${formatMessage(membershipCardMessages.MembershipCardDiscount.generalDiscount)} ${discount.amount}`
    }
  }

  const handleDelete = async (cardDiscountId: string) => {
    await deleteCardDiscount({ variables: { cardDiscountId } })
    await refetchCardTerm()
  }

  return (
    <>
      <AdminPaneTitle>{formatMessage(membershipCardMessages.MembershipCardDiscount.discountTerms)}</AdminPaneTitle>
      <Box marginBottom="30px">
        <MemberShipCardDiscountModal
          renderTrigger={({ setVisible }) => (
            <Button type="primary" onClick={() => setVisible(true)} icon={<FileAddOutlined />}>
              {formatMessage(membershipCardMessages.MembershipCardDiscount.createDiscountTerm)}
            </Button>
          )}
          membershipCardId={membershipCardId}
          onRefetch={refetchCardTerm}
          model="create"
          cardDiscounts={cardTerm?.cardDiscounts || []}
        />
      </Box>
      <AdminBlock>
        {cardTerm?.cardDiscounts.length === 0 ? (
          <Flex justifyContent="center" marginY="150px">
            <Text fontSize="14px" color={'#9b9b9b'}>
              {formatMessage(membershipCardMessages.MembershipCardDiscount.notYetSettingDiscountTerm)}
            </Text>
          </Flex>
        ) : (
          <StyledTable variant="simple">
            <Thead>
              <Tr>
                <StyledTableTh>{formatMessage(membershipCardMessages.MembershipCardDiscount.type)}</StyledTableTh>
                <StyledTableTh>
                  {formatMessage(membershipCardMessages.MembershipCardDiscount.discountName)}
                </StyledTableTh>
                <StyledTableTh>
                  {formatMessage(membershipCardMessages.MembershipCardDiscount.discountType)}
                </StyledTableTh>
                <StyledTableTh />
              </Tr>
            </Thead>
            <Tbody>
              {sortWith(
                [
                  ascend(discount => defaultTo('', prop('type', discount))),
                  ascend(discount => defaultTo('', path(['product', 'type'], discount))),
                ],
                cardTerm?.cardDiscounts.filter(discount => !!discount.product.details) || [],
              ).map(discount => {
                const discountProductType = discount?.product?.type as MembershipCardTermsProductType
                const discountProductPlanName = discount?.product?.details?.productPlanName
                const discountProductName = discount?.product?.details?.productName
                const discountName = discountProductPlanName
                  ? `${discountProductName} - ${discountProductPlanName}`
                  : discountProductName
                return (
                  <Tr key={discount.id}>
                    <Td>{renderProductType(discountProductType)}</Td>
                    <Td>
                      <Text>{discountName}</Text>
                    </Td>
                    <Td>{renderDiscount(discount)}</Td>
                    <Td>
                      <Dropdown
                        placement="bottomRight"
                        trigger={['click']}
                        overlay={
                          <Menu>
                            {discount.type === 'equity' ? (
                              <Menu.Item>
                                <a
                                  href={`/admin/programs/${discount?.product?.details?.productTarget}?tab=plan`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  {formatMessage(membershipCardMessages.MembershipCardDiscount.editDiscountTerm)}
                                </a>
                              </Menu.Item>
                            ) : (
                              <Menu.Item>
                                <MemberShipCardDiscountModal
                                  renderTrigger={({ setVisible }) => (
                                    <>
                                      <span onClick={() => setVisible(true)}>
                                        {formatMessage(membershipCardMessages.MembershipCardDiscount.editDiscountTerm)}
                                      </span>
                                    </>
                                  )}
                                  onRefetch={refetchCardTerm}
                                  model="update"
                                  membershipCardId={membershipCardId}
                                  membershipCardDiscount={discount}
                                  cardDiscounts={cardTerm?.cardDiscounts || []}
                                />
                              </Menu.Item>
                            )}
                            {discount.type !== 'equity' && (
                              <Menu.Item onClick={() => handleDelete(discount.id)}>
                                <span>
                                  {formatMessage(membershipCardMessages.MembershipCardDiscount.deleteDiscountTerm)}
                                </span>
                              </Menu.Item>
                            )}
                          </Menu>
                        }
                      >
                        <MoreOutlined />
                      </Dropdown>
                    </Td>
                  </Tr>
                )
              })}
            </Tbody>
          </StyledTable>
        )}
      </AdminBlock>
    </>
  )
}

export default MemberShipCardDiscountBlock
