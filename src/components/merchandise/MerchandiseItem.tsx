import { Divider, Spin } from 'antd'
import React from 'react'
import { useMerchandise } from '../../hooks/merchandise'
import { CustomRatioImage } from '../common/Image'

const MerchandiseItem: React.FC<{ merchandiseId: string }> = ({ merchandiseId }) => {
  const { loadingMerchandise, merchandise } = useMerchandise(merchandiseId)

  return (
    <>
      {loadingMerchandise ? (
        <Spin />
      ) : (
        <div className="mb-4">
          <Divider />
          <div className="d-flex align-items-center">
            <CustomRatioImage
              className="mr-3"
              width="64px"
              ratio={1}
              src={merchandise?.images.filter(image => image.isCover === true)[0].url || ''}
              shape="rounded"
            />
            <div>{merchandise?.title || ''}</div>
          </div>
        </div>
      )}
    </>
  )
}

export default MerchandiseItem
