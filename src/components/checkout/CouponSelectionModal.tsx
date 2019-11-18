import { Button, Divider, Input, message, Modal, Spin } from 'antd'
import React, { useState } from 'react'
import { InferType } from 'yup'
import { useCouponCollection } from '../../hooks/data'
import { couponSchema } from '../../schemas/coupon'
import CouponCard from './CouponCard'
import { insertCouponCode } from './CouponInsertionCard'

type CouponSelectionModalProps = {
  memberId: string
  onSelect?: (coupon: InferType<typeof couponSchema>) => void
  price: number
  render?: React.FC<{
    setVisible: React.Dispatch<React.SetStateAction<boolean>>
    selectedCoupon: InferType<typeof couponSchema>
  }>
}
const CouponSelectionModal: React.FC<CouponSelectionModalProps> = ({ memberId, onSelect, render, price }) => {
  const [code, setCode] = useState()
  const [visible, setVisible] = useState()
  const { coupons, loadingCoupons, refetchCoupons } = useCouponCollection(memberId)
  const [inserting, setInserting] = useState()
  const [selectedCoupon, setSelectedCoupon] = useState()

  const handleCouponInsert = () => {
    setInserting(true)
    insertCouponCode(memberId, code)
      .then(() => {
        refetchCoupons()
        setCode('')
      })
      .catch(error => message.error(`無法加入折價券`))
      .finally(() => setInserting(false))
  }

  return (
    <>
      {render && render({ setVisible, selectedCoupon })}

      <Modal title="選擇折價券" footer={null} onCancel={() => setVisible(false)} visible={visible}>
        {loadingCoupons ? (
          <Spin />
        ) : (
          coupons
            .filter(coupon => !coupon.status.outdated && !coupon.status.used)
            .map(coupon =>
              coupon.couponCode.couponPlan.constraint <= price ? (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onClick={() => {
                    onSelect && onSelect(coupon)
                    setSelectedCoupon(coupon)
                    setVisible(false)
                  }}
                  style={{ cursor: 'pointer', marginBottom: '12px' }}
                />
              ) : (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  style={{ userSelect: 'none', cursor: 'not-allowed', marginBottom: '12px', color: '#9b9b9b' }}
                />
              ),
            )
        )}
        <Divider>或</Divider>
        <div className="d-flex">
          <div className="flex-grow-1">
            <Input
              style={{ borderRadius: '4px 0px 0px 4px' }}
              placeholder="輸入折扣碼"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
          <Button
            block
            type="primary"
            style={{ width: '72px', borderRadius: '0px 4px 4px 0px' }}
            loading={inserting}
            onClick={handleCouponInsert}
          >
            新增
          </Button>
        </div>
      </Modal>
    </>
  )
}

export default CouponSelectionModal
