import { ApolloClient } from '@apollo/client'

export type MembershipCard = {
  id: string
  relativePeriodAmount: number | null
  relativePeriodType: 'D' | 'W' | 'M' | 'Y'
  appId: string
  description: string
  template: string
  fixedStartDate: string | null
  fixedEndDate: string | null
  expiryType: string
  title: string
  sku: string | null
}

export type MembershipCardTermsProductType = 'ActivityTicket' | 'ProgramPlan' | 'ProgramPackagePlan' | 'PodcastProgram'

export type MembershipCardEquityProgramPlanProduct = {
  id: string
  type: string
  amount: number
  product: {
    type: string
    details: {
      productName: string
      productPlanName: string
      productTarget: string
    }
  }
}

export type StrategyDiscount = {
  productTarget?: string
  queryClient: ApolloClient<object>
  type?: string
}

export type MembershipCardPlanDetails = {
  productName: string
  productPlanName?: string
  productTarget?: string
} | null

export type CardDiscount = {
  id: string
  type: 'cash' | 'percent' | string
  amount: number
  product: {
    productId?: string
    type: string
    details?: MembershipCardPlanDetails
  }
}

export type Card = {
  id: string
  title: string
  description: string
  cardDiscounts: CardDiscount[]
}

export type MembershipCardDiscountProps = {
  id: string
  type: 'cash' | 'percent' | string
  amount: number
  product: {
    productId?: string
  }
}

export type MembershipCardDiscountModalFieldProps = {
  discount: {
    type: 'cash' | 'percent' | string
    amount: number
  }
  productId: string
  productIds: string[]
}
