import { useQuery } from '@apollo/react-hooks'
import { Spin, TreeSelect } from 'antd'
import gql from 'graphql-tag'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages, errorMessages } from '../../helpers/translation'
import types from '../../types'
import { ProductType } from '../../types/general'

const productTypeLabel = (productType: string) => {
  switch (productType) {
    case 'Program':
      return commonMessages.label.allProgram
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
      return commonMessages.term.unknownProduct
  }
}

const messages = defineMessages({
  selectProducts: { id: 'voucher.label.selectProducts', defaultMessage: '選擇兌換項目' },
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
        title: product.title,
        value: product.id,
      })),
    }))

  return (
    <TreeSelect
      value={value}
      onChange={onChange}
      treeData={treeData}
      treeCheckable
      showCheckedStrategy="SHOW_PARENT"
      placeholder={formatMessage(messages.selectProducts)}
      treeNodeFilterProp="title"
      dropdownStyle={{
        maxHeight: '30vh',
      }}
    />
  )
}

const useProductSelections = () => {
  const { loading, error, data, refetch } = useQuery<types.GET_PRODUCT_SELECTION_COLLECTION>(
    gql`
      query GET_PRODUCT_SELECTION_COLLECTION {
        program(
          where: { published_at: { _is_null: false }, is_deleted: { _eq: false }, is_subscription: { _eq: false } }
          order_by: { position: asc }
        ) {
          id
          title
          published_at
        }
        # program_plan {
        #   id
        #   title
        #   program {
        #     id
        #     title
        #     published_at
        #   }
        # }
        program_package_plan {
          id
          title
          program_package {
            id
            title
          }
        }
        activity_ticket {
          id
          title
          activity {
            id
            title
          }
        }
        podcast_program(order_by: { published_at: desc_nulls_last, updated_at: desc_nulls_last }) {
          id
          title
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
    productType: ProductType
    products: {
      id: string
      title: string
    }[]
  }[] = [
    {
      productType: 'Program',
      products:
        data?.program.map(v => ({
          id: `Program_${v.id}`,
          title: v.title,
        })) || [],
    },
    {
      productType: 'ProgramPackagePlan',
      products:
        data?.program_package_plan.map(v => ({
          id: `ProgramPackagePlan_${v.id}`,
          title: `${v.program_package.title} - ${v.title}`,
        })) || [],
    },
    {
      productType: 'ActivityTicket',
      products:
        data?.activity_ticket.map(v => ({
          id: `ActivityTicket_${v.id}`,
          title: `${v.activity.title} - ${v.title}`,
        })) || [],
    },
    {
      productType: 'PodcastProgram',
      products:
        data?.podcast_program.map(v => ({
          id: `PodcastProgram_${v.id}`,
          title: v.title,
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
