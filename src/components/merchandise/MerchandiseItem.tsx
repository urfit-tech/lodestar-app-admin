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
        <div>
          <Divider />
          <div className="d-flex align-items-center">
            <CustomRatioImage
              className="mr-3"
              width="64px"
              ratio={1}
              src="https://static-dev.kolable.com/merchandise_images/xuemi/5219915e-b15e-4755-a400-c2e508f3d3be/0422af27-f0d6-4ac6-afc4-1d1ecce7e4e2"
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
