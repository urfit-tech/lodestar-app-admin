import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useContext, useEffect } from 'react'
import ProductSelectorComponent from '../../components/common/ProductSelector'
import AppContext from '../../contexts/AppContext'
import types from '../../types'
import { ProductType, Product } from '../../types/general'

type ProductSelectorProps = {
  allowTypes: ProductType[]
  value?: string[]
  onChange?: (value: string[]) => void
}
const ProductSelector: React.FC<ProductSelectorProps> = ({ allowTypes, value, onChange }) => {
  const { enabledModules } = useContext(AppContext)
  const { loading, error, data, refetch } = useQuery<types.GET_ALLTYPE_PRODUCT_COLLECTION>(
    GET_ALLTYPE_PRODUCT_COLLECTION,
  )

  useEffect(() => {
    refetch()
  }, [refetch])

  const products: {
    [key: string]: Product[]
  } =
    loading || error || !data
      ? {}
      : {
          Program: allowTypes.includes('Program')
            ? data.program.map(program => ({
                id: `Program_${program.id}`,
                title: program.title,
                type: 'Program',
              }))
            : [],
          Card:
            enabledModules.member_card && allowTypes.includes('Card')
              ? data.card.map(card => ({
                  id: `Card_${card.id}`,
                  title: card.title,
                  type: 'Card',
                }))
              : [],
          ActivityTicket: allowTypes.includes('ActivityTicket')
            ? data.activity_ticket.map(activityTicket => ({
                id: `ActivityTicket_${activityTicket.id}`,
                title: `${activityTicket.activity.title} - ${activityTicket.title}`,
                type: 'ActivityTicket',
              }))
            : [],
          ProgramPackage: allowTypes.includes('ProgramPackage')
            ? data.program_package.map(programPackage => {
                return {
                  id: `ProgramPackage_${programPackage.id}`,
                  title: programPackage.title,
                  type: 'ProgramPackage',
                  children: programPackage.program_package_plans.map(programPackagePlan => {
                    return {
                      id: `ProgramPackagePlan_${programPackagePlan.id}`,
                      title: programPackagePlan.title,
                      type: 'ProgramPackagePlan',
                    }
                  }),
                }
              })
            : [],
        }

  const handleChange = (changedValue: string[]) => {
    if (onChange) {
      onChange(
        changedValue.flatMap(productId =>
          products[productId] ? products[productId].map(product => product.id) : productId,
        ),
      )
    }
  }

  return (
    <ProductSelectorComponent
      loading={loading}
      error={error}
      products={Object.values(products).flat()}
      value={value}
      onChange={handleChange}
    />
  )
}

const GET_ALLTYPE_PRODUCT_COLLECTION = gql`
  query GET_ALLTYPE_PRODUCT_COLLECTION {
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
    card {
      id
      title
    }
    activity_ticket {
      id
      title
      activity {
        id
        title
      }
    }
    program_package {
      id
      title
      published_at
      program_package_plans {
        id
        title
        published_at
      }
    }
  }
`

export default ProductSelector
