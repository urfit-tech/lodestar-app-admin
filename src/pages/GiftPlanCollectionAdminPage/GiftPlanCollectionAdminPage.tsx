import Icon, { FileAddOutlined } from '@ant-design/icons'
import { useQuery } from '@apollo/react-hooks'
import { Button, Skeleton } from 'antd'
import gql from 'graphql-tag'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'
import { useAuth } from 'lodestar-app-element/src/contexts/AuthContext'
import moment from 'moment-timezone'
import React, { useState } from 'react'
import { useIntl } from 'react-intl'
import { ReactComponent as DiscountIcon } from '../..//images/icon/discount.svg'
import { AdminPageTitle } from '../../components/admin'
import GiftPlanCollectionAdminModal from '../../components/gift/GiftPlanCollectionAdminModal'
import AdminLayout from '../../components/layout/AdminLayout'
import hasura from '../../hasura'
import { promotionMessages } from '../../helpers/translation'
import ForbiddenPage from '../ForbiddenPage'
import pageMessages from '../translation'
import GiftPlanCollectionBlock, { GiftPlanColumn } from './GiftPlanCollectionBlock'

const GiftPlanCollectionAdminPage: React.FC = () => {
  const { formatMessage } = useIntl()
  const { enabledModules } = useApp()
  const { permissions, currentMemberId } = useAuth()
  const [loading, setLoading] = useState(false)
  const { id: appId } = useApp()
  const [searchTitle, setSearchTitle] = useState('')
  const { giftPlanCollection, refetchGiftPlanCollection, giftPlanCollectionLoading, giftPlanCollectionError } =
    useGiftPlanCollection({
      app_id: appId ? { _eq: appId } : undefined,
      title: searchTitle ? { _ilike: `%${searchTitle}%` } : undefined,
    })

  if (Object.keys(enabledModules).length === 0 || Object.keys(permissions).length === 0) {
    return <Skeleton active />
  }

  if (!enabledModules.gift || (!permissions.GIFT_PLAN_ADMIN && !permissions.GIFT_PLAN_NORMAL)) {
    return <ForbiddenPage />
  }

  return (
    <AdminLayout>
      <AdminPageTitle className="mb-4">
        <Icon component={() => <DiscountIcon />} className="mr-3" />
        <span>{formatMessage(pageMessages['GiftPlanCollectionAdminPage'].giftPlan)}</span>
      </AdminPageTitle>
      <div className="row mb-5">
        <div className="col-8">
          <GiftPlanCollectionAdminModal
            title={formatMessage(promotionMessages.ui.createGiftPlan)}
            destroyOnClose
            footer={null}
            renderTrigger={({ setVisible }) => (
              <Button className="mb-4" type="primary" icon={<FileAddOutlined />} onClick={() => setVisible(true)}>
                {formatMessage(promotionMessages.ui.createGiftPlan)}
              </Button>
            )}
            maskClosable={false}
            giftIdList={[]}
          />
        </div>
      </div>
      <GiftPlanCollectionBlock
        giftPlanCollection={giftPlanCollection}
        searchTitle={searchTitle}
        onSearch={setSearchTitle}
      />
    </AdminLayout>
  )
}

export default GiftPlanCollectionAdminPage

const useGiftPlanCollection = (condition: hasura.GET_GIFT_PLAN_COLLECTIONVariables['condition']) => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GET_GIFT_PLAN_COLLECTION,
    hasura.GET_GIFT_PLAN_COLLECTIONVariables
  >(GET_GIFT_PLAN_COLLECTION, {
    variables: {
      condition,
    },
  })

  const giftPlanCollection: GiftPlanColumn[] =
    data?.gift_plan.map(v => ({
      id: v.id,
      title: v.title,
      createdAt: moment(v.created_at).format('YYYY-MM-DD HH:mm:ss'),
      giftIdList: v.gift_plan_products.map(w => w.product.target),
    })) || []

  return {
    giftPlanCollection: giftPlanCollection,
    refetchGiftPlanCollection: refetch,
    giftPlanCollectionLoading: loading,
    giftPlanCollectionError: error,
  }
}

const GET_GIFT_PLAN_COLLECTION = gql`
  query GET_GIFT_PLAN_COLLECTION($condition: gift_plan_bool_exp!) {
    gift_plan(where: $condition, order_by: { created_at: desc }) {
      id
      title
      created_at
      gift_plan_products {
        product {
          target
        }
      }
    }
  }
`

// const INSERT_GIFT_PLAN = gql`
//   mutation INSERT_GIFT_PLAN($appId: string!, $title: String!, $editorId: String!) {
//     insert_gift_plan(objects: { app_id: $appId, title: $title, editor_id: $editorId }) {
//       affected_rows
//       returning {
//         id
//       }
//     }
//   }
// `
