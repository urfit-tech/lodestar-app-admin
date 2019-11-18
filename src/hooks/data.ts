import gql from 'graphql-tag'
import { uniq, unnest } from 'ramda'
import { useMutation, useQuery } from 'react-apollo-hooks'
import { array, date, number, object, string } from 'yup'
import { ActivityProps } from '../components/activity/Activity'
import { useAuth } from '../components/auth/AuthContext'
import { activitySchema, activityTicketSchema } from '../schemas/activity'
import { couponSchema } from '../schemas/coupon'
import { fundingSchema } from '../schemas/funding'
import { appSchema, CartProduct, memberSchema, ProductType } from '../schemas/general'
import { programContentSchema, programSchema } from '../schemas/program'
import types from '../types'

export const useApp = () => {
  const { data } = useQuery(
    gql`
      query GET_APP($appId: String!) {
        app_by_pk(id: $appId) {
          id
          name
          title
          description
          og_title
          og_url
          og_image
          og_description
          point_exchange_rate
          point_discount_ratio
          point_validity_period
        }
      }
    `,
    { variables: { appId: process.env.REACT_APP_ID || 'default' } },
  )
  return object({ appByPk: appSchema })
    .camelCase()
    .cast(data).appByPk
}

export const useProduct: (
  productType: string,
  targetId: string,
) => {
  product: {
    id: string
    title: string
    cover_url: string
  }
} = (productType, targetId) => {
  switch (productType) {
    case 'Program': {
      const { program } = useProgram(targetId)
      return {
        product: {
          id: program && program.id ? program.id : '',
          title: program && program.title ? program.title : '',
          cover_url: program && program.coverUrl ? program.coverUrl : '',
        },
      }
    }
    case 'ProjectPlan': {
      const { projectPlan } = useProjectPlan(targetId)
      return {
        product: {
          id: projectPlan ? projectPlan.id && projectPlan.id : '',
          title: projectPlan ? projectPlan.title && projectPlan.title : '',
          cover_url: projectPlan && projectPlan.cover_url && projectPlan.cover_url ? projectPlan.cover_url : '',
        },
      }
    }
    case 'ActivityTicket': {
      const { activityTicket } = useActivityTicket(targetId)
      return {
        product: {
          id: activityTicket ? activityTicket.id && activityTicket.id : '',
          title: activityTicket ? activityTicket.title && activityTicket.title : '',
          cover_url:
            activityTicket && activityTicket.activity && activityTicket.activity.cover_url
              ? activityTicket.activity.cover_url
              : '',
        },
      }
    }
    case 'Card': {
      const { card } = useCard(targetId)
      return {
        product: {
          id: card ? card.id && card.id : '',
          title: card ? card.title && card.title : '',
          cover_url: '',
        },
      }
    }
  }
  return {
    product: {
      id: '',
      title: '',
      cover_url: '',
    },
  }
}

export const useProgram = (programId: string) => {
  const { loading, data, error, refetch } = useQuery(
    gql`
      query GET_PROGRAM($programId: uuid!) {
        program_by_pk(id: $programId) {
          id
          app_id
          title
          abstract
          description
          is_subscription
          sold_at
          sale_price
          list_price
          cover_url
          cover_video_url
          published_at
          in_advance
          funding_id
          is_sold_out
          program_content_sections(order_by: { position: asc }) {
            id
            title
            program_contents(order_by: { position: asc }) {
              id
              title
              published_at
              list_price
              duration
              program_content_type {
                id
                type
              }
              program_content_plans {
                id
                program_plan {
                  id
                  title
                }
              }
            }
          }
          program_roles {
            id
            member_id
            name
          }
          program_plans(order_by: { created_at: asc }) {
            id
            type
            title
            description
            gains
            sale_price
            discount_down_price
            list_price
            period_type
            sold_at
          }
          program_categories(order_by: { position: asc }) {
            position
            category {
              id
              name
            }
          }
        }
      }
    `,
    { variables: { programId } },
  )
  return {
    program:
      loading || error
        ? null
        : object({
            programByPk: programSchema
              .from('programContentSections', 'contentSections')
              .from('programRoles', 'roles')
              .from('programPlans', 'plans')
              .nullable(),
          })
            .camelCase()
            .cast(data).programByPk,
    refetch,
    loading,
  }
}

const useProgramPlan = (programPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROGRAM_PLAN, types.GET_PROGRAM_PLANVariables>(
    gql`
      query GET_PROGRAM_PLAN($id: uuid!) {
        program_plan_by_pk(id: $id) {
          id
          title
          program {
            cover_url
          }
        }
      }
    `,
    { variables: { id: programPlanId } },
  )
  return {
    loading,
    programPlan: data && data.program_plan_by_pk,
    refetch,
    error,
  }
}

export const useActivityCollection = () => {
  const GET_ACTIVITY_COLLECTION = gql`
    query GET_ACTIVITY_COLLECTION {
      activity(where: { published_at: { _is_null: false } }, order_by: [{ position: asc }, { published_at: desc }]) {
        id
        title
        cover_url
        published_at
        is_participants_visible
        activity_categories {
          id
          category {
            id
            name
          }
        }
        activity_enrollments_aggregate {
          aggregate {
            count
          }
        }
        activity_sessions_aggregate {
          aggregate {
            min {
              started_at
            }
            max {
              ended_at
            }
          }
        }
      }
    }
  `
  const { loading, error, data, refetch } = useQuery<types.GET_ACTIVITY_COLLECTION>(GET_ACTIVITY_COLLECTION)

  const activities: (ActivityProps & {
    categories: {
      id: string
      name: string
    }[]
  })[] =
    loading || error || !data
      ? []
      : data.activity
          .filter(activity => activity.published_at && new Date(activity.published_at).getTime() < Date.now())
          .map(activity => ({
            id: activity.id,
            title: activity.title,
            coverUrl: activity.cover_url,
            isParticipantsVisible: activity.is_participants_visible,
            participantCount: activity.activity_enrollments_aggregate.aggregate
              ? activity.activity_enrollments_aggregate.aggregate.count || 0
              : 0,
            publishedAt: activity.published_at,
            isPublished: activity.published_at ? new Date(activity.published_at).getTime() < Date.now() : false,
            startedAt:
              activity.activity_sessions_aggregate.aggregate &&
              activity.activity_sessions_aggregate.aggregate.min &&
              activity.activity_sessions_aggregate.aggregate.min.started_at
                ? new Date(activity.activity_sessions_aggregate.aggregate.min.started_at)
                : null,
            endedAt:
              activity.activity_sessions_aggregate.aggregate &&
              activity.activity_sessions_aggregate.aggregate.max &&
              activity.activity_sessions_aggregate.aggregate.max.ended_at
                ? new Date(activity.activity_sessions_aggregate.aggregate.max.ended_at)
                : null,
            link: `/activities/${activity.id}`,
            categories: activity.activity_categories.map(activityCategory => ({
              id: activityCategory.category.id,
              name: activityCategory.category.name,
            })),
          }))

  return {
    loadingActivities: loading,
    errorActivities: error,
    refetchActivities: refetch,
    activities,
  }
}

const useActivityTicket = (activityTicketId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ACTIVITY_TIECKT, types.GET_ACTIVITY_TIECKTVariables>(
    gql`
      query GET_ACTIVITY_TIECKT($id: uuid!) {
        activity_ticket_by_pk(id: $id) {
          id
          title
          activity {
            cover_url
          }
        }
      }
    `,
    { variables: { id: activityTicketId } },
  )
  return {
    loading,
    activityTicket: data && data.activity_ticket_by_pk,
    refetch,
    error,
  }
}
const useCard = (cardId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_CARD, types.GET_CARDVariables>(
    gql`
      query GET_CARD($id: uuid!) {
        card_by_pk(id: $id) {
          id
          title
        }
      }
    `,
    { variables: { id: cardId } },
  )
  return {
    loading,
    card: data && data.card_by_pk,
    refetch,
    error,
  }
}
const useProjectPlan = (projectPlanId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_PROJECT_PLAN, types.GET_PROJECT_PLANVariables>(
    gql`
      query GET_PROJECT_PLAN($id: uuid!) {
        project_plan_by_pk(id: $id) {
          id
          title
          cover_url
        }
      }
    `,
    { variables: { id: projectPlanId } },
  )
  return {
    loading,
    projectPlan: data && data.project_plan_by_pk,
    refetch,
    error,
  }
}

export const useProgramContent = (programContentId: string) => {
  const { loading, data, refetch } = useQuery(
    gql`
      query GET_PROGRAM_CONTENT($programContentId: uuid!) {
        program_content_by_pk(id: $programContentId) {
          id
          title
          abstract
          created_at
          published_at
          list_price
          sale_price
          sold_at
          metadata
          duration
          program_content_plans {
            id
            program_plan {
              id
              title
            }
          }
          program_content_body {
            id
            description
            data
            type
          }
          program_content_progress {
            id
            progress
          }
        }
      }
    `,
    {
      variables: {
        programContentId,
      },
    },
  )
  return {
    loadingProgramContent: loading,
    programContent: object({
      programContentByPk: programContentSchema,
    })
      .camelCase()
      .cast(data).programContentByPk,
    refetchProgramContent: refetch,
  }
}

export const useCouponCollection = (memberId?: string) => {
  const { loading, error, data, refetch } = useQuery(
    gql`
      query GET_COUPON_COLLECTION($memberId: String!) {
        coupon(where: { member_id: { _eq: $memberId } }) {
          id
          status {
            outdated
            used
          }
          coupon_code {
            code
            coupon_plan {
              title
              amount
              type
              constraint
              started_at
              ended_at
              description
            }
          }
        }
      }
    `,
    {
      variables: { memberId },
    },
  )
  return {
    coupons: object({ coupon: array(couponSchema).default([]) })
      .camelCase()
      .cast(data).coupon,
    errorCoupons: error,
    refetchCoupons: refetch,
    loadingCoupons: loading,
  }
}

export const useMember = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery(
    gql`
      query GET_MEMBER($memberId: String!) {
        member_by_pk(id: $memberId) {
          id
          name
          email
          username
          picture_url
          description
        }
      }
    `,
    { variables: { memberId } },
  )
  return {
    member: object({ memberByPk: memberSchema.nullable() })
      .camelCase()
      .cast(data).memberByPk,
    errorMember: error,
    loadingMember: loading,
    refetchMember: refetch,
  }
}

export const usePublicMember = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery(
    gql`
      query GET_PUBLIC_MEMBER($memberId: String!) {
        member_public(where: { id: { _eq: $memberId } }) {
          id
          name
          username
          picture_url
          metadata
          description
          roles
        }
      }
    `,
    { variables: { memberId } },
  )
  return {
    member:
      loading || error
        ? null
        : object({ memberPublic: array(memberSchema).default([]) })
            .camelCase()
            .cast(data).memberPublic[0],
    loadingMember: loading,
    refetchMember: refetch,
  }
}

export const useMemberPoint = (memberId: string) => {
  const { loading, data, refetch } = useQuery(
    gql`
      query GET_MEMBER_POINT($memberId: String!) {
        point_status(where: { member_id: { _eq: $memberId } }) {
          points
        }
      }
    `,
    { variables: { memberId } },
  )
  const castData = object({
    pointStatus: array(object({ points: number() }).default([])),
  })
    .camelCase()
    .cast(data)
  let numPoints: number
  try {
    numPoints = castData.pointStatus[0].points
  } catch {
    numPoints = 0
  }
  return {
    numPoints,
    loadingMemberPoint: loading,
    refetchMemberPoint: refetch,
  }
}

export const useCart = () => {
  const { currentMemberId: memberId } = useAuth()
  const GET_CART_PRODUCT = gql`
    query GET_CART_PRODUCT($appId: String!, $memberId: String!) {
      cart_product(where: { app_id: { _eq: $appId }, member_id: { _eq: $memberId } }) {
        id
        product_id
        created_at
      }
    }
  `

  const INSERT_CART_PRODUCT = gql`
    mutation INSERT_CART_PRODUCT($appId: String!, $memberId: String!, $productId: String!) {
      insert_cart_product(objects: { app_id: $appId, member_id: $memberId, product_id: $productId }) {
        affected_rows
      }
    }
  `

  const DELETE_CART_PRODUCT = gql`
    mutation DELETE_CART_PRODUCT($cartProductId: uuid!) {
      delete_cart_product(where: { id: { _eq: $cartProductId } }) {
        affected_rows
      }
    }
  `
  const { enrolledProductIds, loadingProductIds } = useEnrolledProductIds(memberId || '')
  const { data, refetch } = useQuery(GET_CART_PRODUCT, {
    variables: { appId: process.env.REACT_APP_ID, memberId },
  })
  const addCartProduct = useMutation(INSERT_CART_PRODUCT)
  const removeCartProduct = useMutation(DELETE_CART_PRODUCT)
  // TODO: cartProducts's props -> camelCase
  const cartProducts = (data && (data.cart_product as CartProduct[])) || []
  const filteredCartProducts = loadingProductIds
    ? []
    : cartProducts.filter(
        cartProduct => !cartProduct.product_id || !enrolledProductIds.includes(cartProduct.product_id),
      )

  return {
    cartProducts: filteredCartProducts,
    findCartProduct: (itemClass: ProductType, itemTarget: string) =>
      cartProducts.find(cartProduct => cartProduct.product_id === `${itemClass}_${itemTarget}`),
    addCartProduct: (itemClass: ProductType, itemTarget: string) => {
      addCartProduct({
        variables: {
          appId: process.env.REACT_APP_ID,
          memberId,
          productId: `${itemClass}_${itemTarget}`,
        },
      }).then(() => refetch())
    },
    removeCartProduct: (cartProductId: string) => {
      removeCartProduct({ variables: { cartProductId } }).then(() => refetch())
    },
  }
}

export const useEditablePrograms = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery(
    gql`
      query GET_PROGRAMS($memberId: String!) {
        program(where: { editors: { member_id: { _eq: $memberId } } }) {
          id
          title
        }
      }
    `,
    {
      variables: { memberId },
    },
  )
  return {
    programs: object({ program: array(programSchema).default([]) }).cast(data).program,
    error,
    loadingPrograms: loading,
    refetchPrograms: refetch,
  }
}

export const useEnrolledProductIds = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery(
    gql`
      query GET_ENROLLED_PRODUCTS($memberId: String!) {
        product_enrollment(where: { member_id: { _eq: $memberId } }) {
          product_id
        }
      }
    `,
    { variables: { memberId } },
  )

  const castData = object({
    productEnrollment: array(
      object({
        productId: string(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  const enrolledProductsIds = castData.productEnrollment.map(product => product.productId)

  return {
    enrolledProductIds: loading || error ? [] : enrolledProductsIds,
    errorProductIds: error,
    loadingProductIds: loading,
    refetchProgramIds: refetch,
  }
}

export const useEnrolledProgramIds = (memberId: string, noFunding?: boolean) => {
  const { loading, data, error, refetch } = useQuery(
    gql`
      query GET_ENROLLED_PROGRAMS($memberId: String!, $noFunding: Boolean) {
        program_enrollment(
          where: { member_id: { _eq: $memberId }, program: { funding_id: { _is_null: $noFunding } } }
          distinct_on: program_id
        ) {
          program_id
        }
        program_plan_enrollment(
          where: { member_id: { _eq: $memberId }, program_plan: { program: { funding_id: { _is_null: $noFunding } } } }
        ) {
          program_plan {
            id
            program_id
          }
        }
        program_content_enrollment(
          where: { member_id: { _eq: $memberId }, program: { funding_id: { _is_null: $noFunding } } }
          distinct_on: program_id
        ) {
          program_id
        }
      }
    `,
    {
      variables: { memberId, noFunding },
      fetchPolicy: 'no-cache',
    },
  )

  const castData = object({
    programEnrollment: array(
      object({
        programId: string(),
      }).camelCase(),
    ).default([]),
    programPlanEnrollment: array(
      object({
        programPlan: object({
          id: string(),
          programId: string(),
        }).camelCase(),
      }).camelCase(),
    ).default([]),
    programContentEnrollment: array(
      object({
        programId: string(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  const enrolledProgramIds = uniq(
    unnest([
      castData.programEnrollment.map(value => value.programId),
      castData.programPlanEnrollment.map(value => value.programPlan.programId),
      castData.programContentEnrollment.map(value => value.programId),
    ]),
  )

  return {
    enrolledProgramIds: loading || error ? [] : enrolledProgramIds,
    errorProgramIds: error,
    loadingProgramIds: loading,
    refetchProgramIds: refetch,
  }
}

export const useEnrolledPlanIds = (memberId: string, noFunding?: boolean) => {
  const { loading, data, error, refetch } = useQuery(
    gql`
      query GET_ENROLLED_PROGRAM_PLANS($memberId: String!, $noFunding: Boolean) {
        program_plan_enrollment(
          where: { member_id: { _eq: $memberId }, program_plan: { program: { funding_id: { _is_null: $noFunding } } } }
        ) {
          program_plan_id
        }
      }
    `,
    { variables: { memberId, noFunding } },
  )

  const programPlanIds: string[] =
    loading || error ? [] : data.program_plan_enrollment.map((value: any) => value.program_plan_id)

  return {
    programPlanIds,
    loadingProgramPlanIds: loading,
    refetchProgramPlanIds: refetch,
  }
}

export const useEnrolledProgramPackagePlanIds = (memberId: string) => {
  const { loading, data, error, refetch } = useQuery<
    types.GET_ENROLLED_PROGRAM_PACKAGE_PLAN_IDS,
    types.GET_ENROLLED_PROGRAM_PACKAGE_PLAN_IDSVariables
  >(
    gql`
      query GET_ENROLLED_PROGRAM_PACKAGE_PLAN_IDS($memberId: String!) {
        program_package_plan_enrollment(where: { member_id: { _eq: $memberId } }) {
          program_package_plan_id
        }
      }
    `,
    { variables: { memberId } },
  )

  const enrolledProgramPackagePlanIds =
    loading || !!error || !data
      ? []
      : data.program_package_plan_enrollment.map(
          programPackagePlanEnrollment => programPackagePlanEnrollment.program_package_plan_id,
        )

  return {
    loadingProgramPackageIds: loading,
    enrolledProgramPackagePlanIds,
    errorProgramPackageIds: error,
    refetchProgramPackageIds: refetch,
  }
}

export const useEnrolledActivityTickets = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery<
    types.GET_ENROLLED_ACTIVITYT_TICKETS,
    types.GET_ENROLLED_ACTIVITYT_TICKETSVariables
  >(
    gql`
      query GET_ENROLLED_ACTIVITYT_TICKETS($memberId: String!) {
        activity_ticket_enrollment(where: { member_id: { _eq: $memberId } }) {
          order_log_id
          order_product_id
          activity_ticket_id
        }
      }
    `,
    { variables: { memberId } },
  )

  const enrolledActivityTickets: {
    orderLogId: string
    orderProductId: string
    activityTicketId: string
  }[] =
    loading || error || !data
      ? []
      : data.activity_ticket_enrollment.map(ticketEnrollment => ({
          orderLogId: ticketEnrollment.order_log_id || '',
          orderProductId: ticketEnrollment.order_product_id || '',
          activityTicketId: ticketEnrollment.activity_ticket_id,
        }))

  return {
    loadingTickets: loading,
    errorTickets: error,
    refetchTickets: refetch,
    enrolledActivityTickets,
  }
}

export const useTicket = (ticketId: string) => {
  const { loading, error, data, refetch } = useQuery(
    gql`
      query GET_TICKET($ticketId: uuid!) {
        activity_ticket_by_pk(id: $ticketId) {
          id
          title
          description
          is_published
          started_at
          ended_at
          count
          price

          activity_session_tickets(order_by: { activity_session: { started_at: asc } }) {
            activity_session {
              id
              title
              description
              location
              started_at
              ended_at
              threshold
            }
          }

          activity {
            id
            title
            is_participants_visible
            cover_url
            published_at
            activity_categories {
              category {
                id
                name
              }
              position
            }
          }
        }
      }
    `,
    {
      variables: { ticketId },
    },
  )

  const castData = object({
    activity_ticket_by_pk: activityTicketSchema
      .concat(
        object({
          activity: activitySchema,
        }).camelCase(),
      )
      .nullable()
      .camelCase(),
  }).cast(data)

  return {
    loadingTicket: loading,
    errorTicket: error,
    refetchTicket: refetch,
    ticket: castData.activity_ticket_by_pk,
  }
}

export const useEnrolledProjectPlanIds = (memberId: string) => {
  const GET_ENROLLED_PROJECT_PLAN_IDS = gql`
    query GET_ENROLLED_PROJECT_PLAN_IDS($memberId: String!) {
      project_plan_enrollment(where: { member_id: { _eq: $memberId } }) {
        project_plan_id
      }
    }
  `

  const { loading, error, data, refetch } = useQuery<
    types.GET_ENROLLED_PROJECT_PLAN_IDS,
    types.GET_ENROLLED_PROJECT_PLAN_IDSVariables
  >(GET_ENROLLED_PROJECT_PLAN_IDS, { variables: { memberId }, fetchPolicy: 'no-cache' })

  return {
    loadingProjectPlanIds: loading,
    errorProjectPlanIds: error,
    enrolledProjectPlanIds:
      data && data.project_plan_enrollment
        ? data.project_plan_enrollment.map(projectPlan => projectPlan.project_plan_id)
        : [],
    refetchProjectPlanIds: refetch,
  }
}

export const useUpdateMember = () => {
  return useMutation(
    gql`
      mutation UPDATE_MEMBER(
        $memberId: String
        $name: String
        $description: String
        $username: String
        $email: String
        $pictureUrl: String
      ) {
        update_member(
          where: { id: { _eq: $memberId } }
          _set: { name: $name, description: $description, username: $username, email: $email, picture_url: $pictureUrl }
        ) {
          affected_rows
        }
      }
    `,
  )
}

export const useProgramPlanEnrollment = (programPlanId: string) => {
  const { loading, data, refetch } = useQuery(
    gql`
      query GET_PROGRAM_PLAN_ENROLLMENT($programPlanId: uuid!) {
        program_plan_enrollment_aggregate(where: { program_plan_id: { _eq: $programPlanId } }) {
          aggregate {
            count
          }
        }
      }
    `,
    { variables: { programPlanId } },
  )

  return {
    numProgramPlanEnrollments: loading ? 0 : data.program_plan_enrollment_aggregate.aggregate.count,
    loadingProgramPlanEnrollments: loading,
    refetchProgramPlanEnrollments: refetch,
  }
}

export const useProgramDuration = (programId: string) => {
  const { loading, data, error } = useQuery(
    gql`
      query GET_PROGRAM_DURATION($programId: uuid!) {
        program_content_aggregate(where: { program_content_section: { program_id: { _eq: $programId } } }) {
          aggregate {
            sum {
              duration
            }
          }
        }
      }
    `,
    { variables: { programId } },
  )
  return loading || error ? null : data.program_content_aggregate.aggregate.sum.duration
}

export const useNotifications = (memberId: string, limit?: number) => {
  const { data, loading, error, refetch, startPolling } = useQuery(
    gql`
      query GET_NOTIFICATIONS($memberId: String, $limit: Int) {
        notification(where: { target_member_id: { _eq: $memberId } }, order_by: { updated_at: desc }, limit: $limit) {
          id
          avatar
          description
          reference_url
          extra
          type
          read_at
          updated_at
        }
      }
    `,
    { variables: { memberId, limit } },
  )
  return {
    refetch,
    loading,
    error,
    startPolling,
    notifications: object({
      notification: array(
        object({
          id: string(),
          description: string(),
          type: string(),
          referenceUrl: string().nullable(),
          extra: string().nullable(),
          avatar: string().nullable(),
          readAt: date().nullable(),
          updatedAt: date(),
        }).camelCase(),
      ).default([]),
    }).cast(data).notification,
  }
}

export const useFunding = (fundingId: string) => {
  const { data, loading, error, refetch } = useQuery(
    gql`
      query GET_FUNDING($fundingId: uuid!) {
        funding_by_pk(id: $fundingId) {
          id
          app_id
          cover_type
          cover_url
          title
          subtitle
          description
          target_amount
          expired_at
          introduction
          contents
          updates
          comments
          type
          programs(order_by: { published_at: asc }) {
            id
            cover_url
            title
            abstract
            description
            list_price
            sale_price
            sold_at
            is_subscription
            program_plans {
              id
              title
              description
              period_type
              list_price
              sale_price
              sold_at
              discount_down_price
            }
          }
        }
      }
    `,
    {
      variables: { fundingId },
    },
  )

  return {
    loadingFunding: loading,
    errorFunding: error,
    funding: loading || error || !data.funding_by_pk ? null : fundingSchema.cast(data.funding_by_pk),
    refetchFunding: refetch,
  }
}

export const useEnrolledMembershipCardIds = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery(
    gql`
      query GET_ENROLLED_CARDS($memberId: String!) {
        card_enrollment(where: { member_id: { _eq: $memberId } }) {
          card_id
        }
      }
    `,
    {
      variables: { memberId },
    },
  )

  const castData = object({
    cardEnrollment: array(
      object({
        cardId: string(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  return {
    loadingMembershipCardIds: loading,
    errorMembershipCardIds: error,
    enrolledMembershipCardIds: loading || error ? [] : castData.cardEnrollment.map(value => value.cardId),
    refetchMembershipCardIds: refetch,
  }
}

export const useMembershipCard = (cardId: string) => {
  const { loading, error, data, refetch } = useQuery(
    gql`
      query GET_ENROLLED_CARDS($cardId: uuid!) {
        card_by_pk(id: $cardId) {
          id
          title
          description
          template
          app_id
        }
      }
    `,
    { variables: { cardId } },
  )

  const castData = object({
    card_by_pk: object({
      id: string(),
      title: string(),
      description: string(),
      template: string(),
    }).camelCase(),
  }).cast(data).card_by_pk

  return {
    loadingMembershipCard: loading,
    errorMembershipCard: error,
    membershipCard: castData,
    refetchMembershipCard: refetch,
  }
}

export const useEnrolledMembershipCardCollection = (memberId: string) => {
  const { loading, error, data, refetch } = useQuery(
    gql`
      query GET_ENROLLED_CARDS($memberId: String!) {
        card_enrollment(where: { member_id: { _eq: $memberId } }) {
          card {
            id
            title
            description
            template
          }
          updated_at
        }
      }
    `,
    {
      variables: { memberId },
    },
  )

  const castData = object({
    cardEnrollment: array(
      object({
        card: object({
          id: string(),
          title: string(),
          description: string(),
          template: string(),
        }).camelCase(),
        updatedAt: date().nullable(),
      }).camelCase(),
    ).default([]),
  })
    .camelCase()
    .cast(data)

  return {
    loadingMembershipCardCollection: loading,
    errorMembershipCardCollection: error,
    enrolledMembershipCardCollection: loading || error ? [] : castData.cardEnrollment,
    refetchMembershipCardCollection: refetch,
  }
}

export const useOrderProduct = (orderProductId: string) => {
  const { loading, error, data, refetch } = useQuery<types.GET_ORDER_PRODUCT, types.GET_ORDER_PRODUCTVariables>(
    gql`
      query GET_ORDER_PRODUCT($orderProductId: uuid!) {
        order_product_by_pk(id: $orderProductId) {
          id
          name
          description
          created_at
          product {
            id
            type
            target
          }
        }
      }
    `,
    { variables: { orderProductId } },
  )

  const orderProduct =
    loading || error || !data || !data.order_product_by_pk
      ? {
          id: '',
          name: '',
          description: '',
          createAt: null,
          product: {
            id: '',
            type: '',
            target: '',
          },
        }
      : {
          id: data.order_product_by_pk.id,
          name: data.order_product_by_pk.name,
          description: data.order_product_by_pk.description,
          createAt: new Date(data.order_product_by_pk.created_at),
          product: data.order_product_by_pk.product,
        }

  return {
    loadingOrderProduct: loading,
    errorOrderProduct: error,
    orderProduct,
    refetchOrderProduct: refetch,
  }
}
