import { useQuery } from '@apollo/react-hooks'
import { Spin, Tag, TreeSelect } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages, errorMessages } from '../../helpers/translation'
import { ProductType } from '../../types/general'

const productTypeLabel = (productType: string) => {
  switch (productType) {
    case 'ProgramPackagePlan':
      return commonMessages.label.allProgramPackagePlan
    case 'ProgramPlan':
      return commonMessages.label.allProgramPlan
    case 'ProgramContent':
      return commonMessages.label.allProgramContent
    case 'Card':
      return commonMessages.label.allMembershipCard
    case 'ActivityTicket':
      return commonMessages.label.allActivityTicket
    case 'PodcastProgram':
      return commonMessages.label.allPodcastProgram
    default:
      return commonMessages.label.unknownProduct
  }
}

const messages = defineMessages({
  selectProducts: { id: 'promotion.label.selectProducts', defaultMessage: '選擇兌換項目' },
})

const ProductSelector: React.FC<{
  allowTypes: ProductType[]
  value?: string[]
  onChange?: (value: string[]) => void
}> = ({ allowTypes, value, onChange }) => {
  const { formatMessage } = useIntl()
  const { loading, error, productSelections } = useProductSelections()

  if (loading) {
    return <Spin />
  }

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const treeData = productSelections
    .filter(productSelection => allowTypes.includes(productSelection.productType) && productSelection.products.length)
    .map(productSelection => ({
      key: productSelection.productType,
      title: formatMessage(productTypeLabel(productSelection.productType)),
      value: productSelection.productType,
      children: productSelection.products.map(product => ({
        key: product.id,
        title: (
          <div className="d-flex align-items-center flex-wrap">
            {product.publishedAt === null
              ? `(${formatMessage(commonMessages.label.unPublished)}) `
              : product.publishedAt && product.publishedAt.getTime() > Date.now()
              ? `(${formatMessage(commonMessages.status.notSold)}) `
              : ''}
            {product.tag && <Tag className="mr-2">{product.tag}</Tag>}
            {product.title}
          </div>
        ),
        name: product.title,
        value: product.id,
      })),
    }))

  return (
    <TreeSelect
      value={value}
      onChange={value =>
        onChange?.(
          value
            .map(
              v =>
                productSelections
                  .find(productSelection => productSelection.productType === v)
                  ?.products.map(product => product.id) || v,
            )
            .flat(),
        )
      }
      treeData={treeData}
      treeCheckable
      showCheckedStrategy="SHOW_PARENT"
      placeholder={formatMessage(messages.selectProducts)}
      treeNodeFilterProp="name"
      dropdownStyle={{
        maxHeight: '30vh',
      }}
    />
  )
}

const useProductSelections = () => {
  const { formatMessage } = useIntl()

  const { loading, error, data, refetch } = useQuery<hasura.GET_PRODUCT_SELECTION_COLLECTION>(
    gql`
      query GET_PRODUCT_SELECTION_COLLECTION {
        program_plan(
          where: {
            is_deleted: { _eq: false }
            program: { is_deleted: { _eq: false }, published_at: { _is_null: false } }
          }
        ) {
          id
          title
          auto_renewed
          period_amount
          period_type
          published_at
          program {
            id
            title
          }
        }
        program_package_plan {
          id
          title
          published_at
          program_package {
            id
            title
          }
        }
        activity_ticket {
          id
          title
          started_at
          ended_at
          activity {
            id
            title
          }
        }
        podcast_program(order_by: { published_at: desc_nulls_last, updated_at: desc_nulls_last }) {
          id
          title
          published_at
          creator {
            id
            name
          }
        }
        card {
          id
          title
        }
      }
    `,
    { fetchPolicy: 'no-cache' },
  )

  const productSelections: {
    productType: 'ProgramPlan' | 'ProgramPackagePlan' | 'ActivityTicket' | 'PodcastProgram' | 'Card'
    products: {
      id: string
      title: string
      publishedAt?: Date | null
      tag?: string
    }[]
  }[] = [
    {
      productType: 'ProgramPlan',
      products:
        data?.program_plan.map(v => ({
          id: `ProgramPlan_${v.id}`,
          title: `${v.program.title} - ${v.title}`,
          publishedAt: v.published_at ? new Date(v.published_at) : null,
          tag: v.auto_renewed
            ? formatMessage(commonMessages.ui.subscriptionPlan)
            : v.period_amount && v.period_type
            ? formatMessage(commonMessages.ui.periodPlan)
            : formatMessage(commonMessages.ui.perpetualPlan),
        })) || [],
    },
    {
      productType: 'ProgramPackagePlan',
      products:
        data?.program_package_plan.map(v => ({
          id: `ProgramPackagePlan_${v.id}`,
          title: `${v.program_package.title} - ${v.title}`,
          publishedAt: v.published_at ? new Date(v.published_at) : null,
        })) || [],
    },
    {
      productType: 'ActivityTicket',
      products:
        data?.activity_ticket.map(v => ({
          id: `ActivityTicket_${v.id}`,
          title: `${v.activity.title} - ${v.title}`,
          publishedAt:
            v.started_at && v.ended_at && Date.now() < new Date(v.ended_at).getTime() ? new Date(v.started_at) : null,
        })) || [],
    },
    {
      productType: 'PodcastProgram',
      products:
        data?.podcast_program.map(v => ({
          id: `PodcastProgram_${v.id}`,
          title: v.title,
          publishedAt: v.published_at ? new Date(v.published_at) : null,
        })) || [],
    },
    {
      productType: 'Card',
      products:
        data?.card.map(v => ({
          id: `Card_${v.id}`,
          title: v.title,
        })) || [],
    },
  ]

  return {
    loading,
    error,
    productSelections,
    refetch,
  }
}

export default ProductSelector
