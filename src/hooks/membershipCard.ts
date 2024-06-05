import { gql, useApolloClient, useMutation, useQuery } from '@apollo/client'
import { useCallback, useEffect, useState } from 'react'
import {
  Card,
  MembershipCardEquityProgramPlanProduct,
  MembershipCardPlanDetails,
  StrategyDiscount,
} from '../types/membershipCard'
import { executeQuery } from './util'
import hasura from '../hasura'
import { useIntl } from 'react-intl'
import dayjs from 'dayjs'
import MembershipCardPageMessages from '../pages/MembershipCardCollectionPage/translation'
import { useApp } from 'lodestar-app-element/src/contexts/AppContext'

const fetchMembershipCardEquityProgramPlanProduct = async (queryClient: any, membershipCardId: string) => {
  const data: hasura.GetProgramPlanByMembershipCard = await executeQuery(queryClient, {
    query: gql`
      query GetProgramPlanByMembershipCard($cardId: uuid!) {
        program_plan(
          where: {
            card_products: { card_id: { _eq: $cardId } }
            program: { published_at: { _is_null: false } }
            is_deleted: { _eq: false }
          }
        ) {
          id
          title
          program {
            id
            title
          }
        }
      }
    `,
    variables: { cardId: membershipCardId },
  })

  if (!data) return null

  const programPlan: MembershipCardEquityProgramPlanProduct[] = data.program_plan.map(programPlan => {
    return {
      id: programPlan.id,
      type: 'equity',
      amount: 1,
      product: {
        type: 'ProgramPlan',
        productId: `${`ProgramPlan_${programPlan.id}`}`,
        details: {
          productName: programPlan.program?.title,
          productPlanName: programPlan.title,
          productTarget: programPlan.program?.id,
        },
      },
    }
  })
  return programPlan
}

// Strategy functions map
const strategyMap: { [key: string]: (discount: StrategyDiscount) => Promise<MembershipCardPlanDetails | null> } = {
  ActivityTicket: async discount => {
    const data: hasura.GetActivityTicketTitle = await executeQuery(discount.queryClient, {
      query: gql`
        query GetActivityTicketTitle($id: uuid!) {
          activity_ticket(where: { id: { _eq: $id }, is_published: { _eq: true } }) {
            title
            activity {
              id
            }
          }
        }
      `,
      variables: { id: discount.productTarget },
    })
    if (!data) return null
    const activityTicket = data.activity_ticket && data.activity_ticket[0] ? data.activity_ticket[0] : null
    if (!activityTicket) return null
    return { productName: activityTicket.title, productTarget: activityTicket.activity.id }
  },

  ProgramPlan: async discount => {
    const data: hasura.GetProgramPlanInfo = await executeQuery(discount.queryClient, {
      query: gql`
        query GetProgramPlanInfo($id: uuid!) {
          program_plan(
            where: { id: { _eq: $id }, program: { published_at: { _is_null: false }, is_deleted: { _eq: false } } }
          ) {
            title
            program {
              title
              id
            }
          }
        }
      `,
      variables: { id: discount.productTarget },
    })
    if (!data) return null
    const programPlan = data.program_plan && data.program_plan[0] ? data.program_plan[0] : null
    if (!programPlan) return null
    return {
      productName: programPlan.program?.title,
      productPlanName: programPlan.title,
      productTarget: programPlan.program?.id,
    }
  },

  ProgramPackagePlan: async discount => {
    const data: hasura.GetProgramPackageAndProgramPackagePlan = await executeQuery(discount.queryClient, {
      query: gql`
        query GetProgramPackageAndProgramPackagePlan($id: uuid!) {
          program_package_plan(where: { id: { _eq: $id }, published_at: { _is_null: false } }) {
            title
            program_package {
              title
              id
            }
          }
        }
      `,
      variables: { id: discount.productTarget },
    })
    if (!data) return null
    const programPackagePlan =
      data.program_package_plan && data.program_package_plan[0] ? data.program_package_plan[0] : null
    if (!programPackagePlan) return null
    return {
      productName: programPackagePlan.program_package.title,
      productPlanName: programPackagePlan.title,
      productTarget: programPackagePlan.program_package.id,
    }
  },

  PodcastProgram: async discount => {
    const data: hasura.GetPodcastProgram = await executeQuery(discount.queryClient, {
      query: gql`
        query GetPodcastProgram($id: uuid!) {
          podcast_program(where: { id: { _eq: $id }, published_at: { _is_null: false } }) {
            title
            id
          }
        }
      `,
      variables: { id: discount.productTarget },
    })
    if (!data) return null
    const podcast = data.podcast_program && data.podcast_program[0] ? data.podcast_program[0] : null
    if (!podcast) return null
    return {
      productName: podcast.title,
      productTarget: podcast.id,
    }
  },

  default: async discount => {
    console.error(`Unknown product type: ${discount.type}`)
    return null
  },
}

export const useMembershipCardTerms = (cardId: string) => {
  const [cardTerm, setCardTerm] = useState<Card>()
  const { loading, error, data, refetch } = useQuery<hasura.GetCard, hasura.GetCardVariables>(
    gql`
      query GetCard($cardId: uuid!) {
        card(where: { id: { _eq: $cardId } }) {
          id
          title
          description
          card_discounts {
            id
            type
            amount
            product_id
            product {
              type
              target
            }
          }
        }
      }
    `,
    {
      variables: { cardId },
    },
  )

  const queryClient = useApolloClient()

  const processCardDiscounts = useCallback(
    async (cards: hasura.GetCard['card']) => {
      const card = cards[0]
      let processedCard: Card = {
        id: card.id,
        title: card.title,
        description: card.description || '',
        cardDiscounts: await Promise.all(
          card.card_discounts.map(async discount => {
            const details = await (strategyMap[discount.product.type] || strategyMap['default'])({
              productTarget: discount.product.target,
              queryClient,
              type: discount.product.type,
            })

            return {
              id: discount.id,
              type: discount.type,
              amount: discount.amount,
              product: {
                productId: discount.product_id,
                type: discount.product.type,
                ...(details ? { details } : null),
              },
            }
          }),
        ),
      }

      const programPlanEquityData = await fetchMembershipCardEquityProgramPlanProduct(queryClient, card.id)

      if (programPlanEquityData && programPlanEquityData.length > 0) {
        processedCard = { ...processedCard, cardDiscounts: [...processedCard.cardDiscounts, ...programPlanEquityData] }
      }

      setCardTerm(processedCard)
    },
    [queryClient],
  )

  const refetchCardTerm = async () => {
    await refetch()
    await queryClient.refetchQueries({
      include: ['GetProgramPlanInfo', 'GetProgramPackageAndProgramPackagePlan', 'GetPodcastProgram', 'GetCard'],
    })
  }

  useEffect(() => {
    if (data && data.card) {
      processCardDiscounts(data.card)
    }
  }, [data, processCardDiscounts])

  return {
    loading,
    cardTerm,
    error,
    refetchCardTerm,
  }
}

export const useUpsertCardDiscount = () => {
  const [upsertCardDiscount] = useMutation<hasura.upsertCardDiscount, hasura.upsertCardDiscountVariables>(gql`
    mutation upsertCardDiscount($cardDiscounts: [card_discount_insert_input!]!) {
      insert_card_discount(
        objects: $cardDiscounts
        on_conflict: { constraint: card_discount_pkey, update_columns: [product_id, amount, type] }
      ) {
        affected_rows
      }
    }
  `)
  return {
    upsertCardDiscount,
  }
}

export const useDeleteCardDiscount = () => {
  const [deleteCardDiscount] = useMutation<hasura.deleteCardDiscount, hasura.deleteCardDiscountVariables>(
    gql`
      mutation deleteCardDiscount($cardDiscountId: uuid!) {
        delete_card_discount(where: { id: { _eq: $cardDiscountId } }) {
          affected_rows
        }
      }
    `,
  )

  return { deleteCardDiscount }
}


export const useMembershipCardCollection = (condition: hasura.GetMembershipCardCollectionVariables['condition']) => {
  const { formatMessage } = useIntl()
  const extendedCondition = {
    ...condition,
    deleted_at: { _is_null: true },
  }

  const { loading, error, data } = useQuery<
    hasura.GetMembershipCardCollection,
    hasura.GetMembershipCardCollectionVariables
  >(GetMembershipCardCollection, {
    variables: {
      condition: extendedCondition,
    },
    fetchPolicy: 'network-only',
  })

  const formatExpiredData = (card: hasura.GetMembershipCardCollection['card'][0]): string => {
    const expiryType = card.expiry_type || 'fixed'
    if (expiryType === 'fixed') {
      const startDate = card.fixed_start_date
        ? dayjs(card.fixed_start_date).format('YYYY-MM-DD')
        : formatMessage(MembershipCardPageMessages.page.startToday)
      const endDate = card.fixed_end_date
        ? dayjs(card.fixed_end_date).format('YYYY-MM-DD')
        : formatMessage(MembershipCardPageMessages.page.noExpiry)
      return `${startDate} ~ ${endDate}`
    }
    if (expiryType === 'relative') {
      const periodAmount = card.relative_period_amount
      const periodType = card.relative_period_type
      let periodTypeText = ''
      if (periodType === 'Y') {
        periodTypeText = formatMessage(MembershipCardPageMessages.page.year)
      } else if (periodType === 'M') {
        periodTypeText = formatMessage(MembershipCardPageMessages.page.month)
      } else if (periodType === 'D') {
        periodTypeText = formatMessage(MembershipCardPageMessages.page.day)
      }
      return `${periodAmount} ${periodTypeText}`
    }
    return ''
  }

  const extractBackgroundImage = (template: string): string | null => {
    const backgroundImageRegex = /background-image:\s*url\(([^)]+)\)/i
    const match = template.match(backgroundImageRegex)
    return match ? match[1] : null
  }

  const membershipCards: {
    id: string
    title: string
    template: string
    sku: string
    expiredType: string
    expiredData: string
    backgroundImage: string | null
  }[] =
    data?.card.map(v => ({
      id: v.id,
      title: v.title || '',
      template: v.template || '',
      sku: v.sku || '',
      expiredType: v.expiry_type || 'fixed',
      expiredData: formatExpiredData(v),
      backgroundImage: extractBackgroundImage(v.template || ''),
    })) || []

  return {
    loading,
    error,
    membershipCards,
  }
}

const GetMembershipCardCollection = gql`
  query GetMembershipCardCollection($condition: card_bool_exp!) {
    card(where: $condition, order_by: { created_at: desc }) {
      app_id
      creator_id
      description
      sku
      template
      title
      id
      fixed_start_date
      fixed_end_date
      relative_period_type
      relative_period_amount
      expiry_type
    }
  }
`

export const InsertCard = gql`
  mutation InsertCard($appId: String, $title: String, $template: String) {
    insert_card(objects: { app_id: $appId, title: $title, template: $template }) {
      affected_rows
      returning {
        id
        app_id
        title
        description
        template
        creator_id
        sku
      }
    }
  }
`


export const useMembershipCardQuantity = () => {
  const { loading, error, data, refetch } = useQuery<
    hasura.GetMembershipCardQuantity,
    hasura.GetMembershipCardQuantityVariables
  >(gql`
    query GetMembershipCardQuantity {
      card(where: { deleted_at: { _is_null: true } }) {
        id
        fixed_end_date
      }
    }
  `)

  const cardData =
    data?.card.map((card: hasura.GetMembershipCardQuantity['card'][0]) => ({
      id: card.id,
      fixedEndDate: card.fixed_end_date,
    })) || []

  const now = new Date()
  const availableQuantity = cardData.filter(card => {
    const endDate = card.fixedEndDate ? new Date(card.fixedEndDate) : null
    return endDate === null || endDate > now
  }).length

  const expiredQuantity = cardData.filter(card => {
    const endDate = card.fixedEndDate ? new Date(card.fixedEndDate) : null
    return endDate !== null && endDate <= now
  }).length

  return {
    loading,
    error,
    cardData,
    availableQuantity,
    expiredQuantity,
    refetch,
  }
}

export const UpdateMembershipCardTemplate = gql`
  mutation UpdateMembershipCardTemplate($membershipCardId: uuid!, $template: String) {
    update_card(_set: { template: $template }, where: { id: { _eq: $membershipCardId } }) {
      affected_rows
    }
  }
`
export const UpdateMembershipCardBasic = gql`
  mutation UpdateMembershipCardBasic(
    $id: uuid!
    $title: String
    $description: String
    $creatorId: String
    $sku: String
    $fixedStartDate: timestamptz
    $relativePeriodAmount: Int
    $relativePeriodType: bpchar
    $fixedEndDate: timestamptz
    $expiryType: bpchar
  ) {
    update_card(
      where: { id: { _eq: $id } }
      _set: {
        title: $title
        description: $description
        creator_id: $creatorId
        sku: $sku
        fixed_start_date: $fixedStartDate
        relative_period_amount: $relativePeriodAmount
        relative_period_type: $relativePeriodType
        fixed_end_date: $fixedEndDate
        expiry_type: $expiryType
      }
    ) {
      affected_rows
      returning {
        id
        title
        description
        template
        creator_id
        sku
        fixed_start_date
        relative_period_type
        relative_period_amount
        expiry_type
        fixed_end_date
      }
    }
  }
`

export const UpdateMembershipCardProductSku = gql`
  mutation UpdateMembershipCardProductSku($type: String!, $target: String!, $sku: String!) {
    update_product(where: { type: { _eq: $type }, target: { _eq: $target } }, _set: { sku: $sku }) {
      affected_rows
      returning {
        target
        type
        sku
      }
    }
  }
`

export const useUpdateMembershipCard = () => {
  const [updateMembershipCardBasicMutation] = useMutation<
    hasura.UpdateMembershipCardBasic,
    hasura.UpdateMembershipCardBasicVariables
  >(UpdateMembershipCardBasic)
  const [updateMembershipCardProductSkuMutation] = useMutation(UpdateMembershipCardProductSku)
  const { enabledModules } = useApp()

  const updateMembershipCard = async (membershipCardId: string, values: any) => {
    try {
      await updateMembershipCardBasicMutation({
        variables: {
          id: membershipCardId,
          title: values.title || '',
          expiryType: values.expiryType,
          relativePeriodType: values.relativePeriodType,
          relativePeriodAmount: values.relativePeriodAmount || 0,
          fixedStartDate: values.fixedStartDate,
          fixedEndDate: values.fixedEndDate,
          sku: values.sku ?? '',
        },
      })

      if (enabledModules.sku) {
        await updateMembershipCardProductSkuMutation({
          variables: {
            type: 'Card',
            target: membershipCardId,
            sku: values.sku ?? '',
          },
        })
      }

    } catch (error) {
      throw error
    }
  }

  return {
    updateMembershipCard,
  }
}

