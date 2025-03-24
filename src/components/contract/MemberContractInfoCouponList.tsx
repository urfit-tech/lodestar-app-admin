import { Box, SkeletonText } from '@chakra-ui/react'
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
    <Box>
      {coupons.map(coupon => {
        return (
          <Box key={coupon.id}>
            {coupon.planTitle} / {coupon.code}
          </Box>
        )
      })}
    </Box>
  )
}

export default MemberContractInfoCouponList
