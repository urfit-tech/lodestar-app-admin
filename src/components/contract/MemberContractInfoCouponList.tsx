import { Box, Flex, SkeletonText } from '@chakra-ui/react'
import { useCouponListInfo } from '../../hooks/coupon'

const MemberContractInfoCouponList: React.FC<{ couponIds: string[] }> = ({ couponIds }) => {
  const { loading, coupons, error } = useCouponListInfo(couponIds)

  if (loading) {
    return (
      <Box>
        <SkeletonText noOfLines={3} spacing="2" />
      </Box>
    )
  }

  if (error) {
    console.error(`get coupons failed`, error)
    return <Box>get coupons failed</Box>
  }

  return (
    <Box ml="0.5rem">
      {coupons.map(coupon => {
        return (
          <Flex key={coupon.id}>
            <Box whiteSpace="nowrap" display="inline-block">
              {coupon.planTitle}
            </Box>
            <Box>&nbsp;/&nbsp;</Box>
            <Box whiteSpace="nowrap" display="inline-block">
              {coupon.code}
            </Box>
          </Flex>
        )
      })}
    </Box>
  )
}

export default MemberContractInfoCouponList
