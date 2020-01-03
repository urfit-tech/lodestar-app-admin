import { useQuery } from '@apollo/react-hooks'
import gql from 'graphql-tag'
import React, { useContext } from 'react'
import ProductSelectorComponent from '../../components/common/ProductSelector'
import AppContext from '../../contexts/AppContext'
import { ProductType } from '../../schemas/general'
import types from '../../types'

type ProductSelectorProps = {
  allowTypes: ProductType[]
  value?: string[]
  onChange?: (value: string[]) => void
}
const ProductSelector: React.FC<ProductSelectorProps> = ({ allowTypes, value, onChange }, ref) => {
  const { enabledModules } = useContext(AppContext)
  const { loading, error, data } = useQuery<types.GET_ALLTYPE_PRODUCT_COLLECTION>(GET_ALLTYPE_PRODUCT_COLLECTION)

  const products: {
    [key: string]: {
      id: string
      title: string
      type: string
    }[]
  } =
    loading || error || !data
      ? {}
      : {
          Program: allowTypes.includes('Program')
            ? data.program
                .filter(program => program.published_at && new Date(program.published_at).getTime() < Date.now())
                .map(program => ({
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
    <div ref={ref}>
      <ProductSelectorComponent
        loading={loading}
        error={error}
        products={Object.values(products).flat()}
        value={value}
        onChange={handleChange}
      />
    </div>
  )
}

const GET_ALLTYPE_PRODUCT_COLLECTION = gql`
  query GET_ALLTYPE_PRODUCT_COLLECTION {
    program(where: { is_subscription: { _eq: false } }) {
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
  }
`

export default React.forwardRef(ProductSelector)
