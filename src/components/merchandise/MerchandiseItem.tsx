import { Divider, Spin } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useMerchandise } from '../../hooks/merchandise'
import EmptyCover from '../../images/default/empty-cover.png'
import { CustomRatioImage } from '../common/Image'

const StyledQuantity = styled.div`
  color: var(--gray-darker);
  font-size: 14px;
  line-height: 1.71;
  letter-spacing: 0.4px;
`

const MerchandiseItem: React.FC<{
  merchandiseId: string
  quantity: number
}> = ({ merchandiseId, quantity }) => {
  const { loadingMerchandise, merchandise } = useMerchandise(merchandiseId)

  if (loadingMerchandise || !merchandise) {
    return <Spin />
  }

  return (
    <div>
      <Divider />

      <div className="d-flex align-items-center">
        <CustomRatioImage
          className="mr-3 flex-shrink-0"
          width="64px"
          ratio={1}
          src={merchandise.images.find(image => image.isCover)?.url || EmptyCover}
          shape="rounded"
        />
        <div className="flex-grow-1">{merchandise.title}</div>
        <StyledQuantity className="px-4">x{quantity}</StyledQuantity>
      </div>
    </div>
  )
}

export default MerchandiseItem
