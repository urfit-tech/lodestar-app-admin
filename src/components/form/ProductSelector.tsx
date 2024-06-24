import { gql, useQuery } from '@apollo/client'
import { Spin, Tag, TreeSelect } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React from 'react'
import { defineMessages, useIntl } from 'react-intl'
import hasura from '../../hasura'
import { commonMessages, errorMessages } from '../../helpers/translation'
import formMessages from './translation'

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
    case 'Merchandise':
      return commonMessages.label.allMerchandise
    case 'MerchandiseSpec':
      return commonMessages.label.allMerchandiseSpec
    case 'GeneralPhysicalMerchandiseSpec':
      return formMessages.ProductSelector.generalPhysicalMerchandiseSpec
    case 'GeneralVirtualMerchandiseSpec':
      return formMessages.ProductSelector.generalVirtualMerchandiseSpec
    case 'CustomizedPhysicalMerchandiseSpec':
      return formMessages.ProductSelector.customizedPhysicalMerchandiseSpec
    case 'CustomizedVirtualMerchandiseSpec':
      return formMessages.ProductSelector.customizedVirtualMerchandiseSpec
    case 'ProjectPlan':
      return commonMessages.label.allProjectPlan
    case 'AppointmentPlan':
      return commonMessages.label.allAppointmentPlan
    case 'PodcastPlan':
      return commonMessages.label.allPodcastPlan
    case 'CouponPlan':
      return commonMessages.label.allCouponPlan
    case 'VoucherPlan':
      return commonMessages.label.allVoucherPlan
    case 'Estimator': // customized
      return commonMessages.label.allEstimator
    default:
      return commonMessages.label.unknownProduct
  }
}

const messages = defineMessages({
  selectProducts: { id: 'promotion.label.selectProducts', defaultMessage: '選擇項目' },
})

const ProductSelector: React.FC<{
  allowTypes: (
    | ProductType
    | 'CouponPlan'
    | 'GeneralPhysicalMerchandiseSpec'
    | 'GeneralVirtualMerchandiseSpec'
    | 'CustomizedPhysicalMerchandiseSpec'
    | 'CustomizedVirtualMerchandiseSpec'
  )[]
  multiple?: boolean
  value?: string[]
  onlyValid?: boolean
  onChange?: (value: string[]) => void
  onProductChange?: (
    value: {
      id: string
      title: string
      publishedAt?: Date | null
      tag?: string
      children?: any[]
    }[],
  ) => void
  onFullSelected?: (types: (ProductType | 'CouponPlan')[]) => void
}> = ({ allowTypes, multiple, value, onlyValid, onChange, onProductChange, onFullSelected }) => {
  const { formatMessage } = useIntl()
  const { loading, error, productSelections } = useProductSelections(onlyValid)

  if (loading) {
    return <Spin />
  }

  if (error) {
    return <div>{formatMessage(errorMessages.data.fetch)}</div>
  }

  const treeData: DataNode[] = productSelections
    .filter(productSelection => allowTypes.includes(productSelection.productType) && productSelection.products.length)
    .map(productSelection => ({
      key: productSelection.productType,
      title: formatMessage(productTypeLabel(productSelection.productType)),
      value: productSelection.productType,
      selectable: !!multiple,
      children: productSelection.products.map(product => ({
        key: product.id,
        title: (
          <div className="d-flex align-items-center" title={product.title}>
            {product.publishedAt === null
              ? `(${formatMessage(commonMessages.label.unPublished)}) `
              : product.publishedAt && product.publishedAt.getTime() > Date.now()
              ? `(${formatMessage(commonMessages.status.notSold)}) `
              : ''}
            {product.tag && <Tag className="mr-2">{product.tag}</Tag>}
            {<span>{product.title}</span>}
          </div>
        ),
        name: product.title || '',
        value: product.id,
      })),
    }))

  return (
    <TreeSelect
      value={value}
      onChange={selectedValue => {
        const found = (multiple ? selectedValue : [selectedValue])
          .map(v => {
            const productType = (v.includes('_') ? v.slice(0, v.indexOf('_')) : v) as ProductType | 'CouponPlan'
            const products = productSelections.find(({ productType: type }) => type === productType)!.products
            return v.includes('_') ? products.find(({ id }) => v === id)! : products
          })
          .flat()
        onFullSelected?.(selectedValue.map(v => (v.includes('_') ? [] : (v as ProductType | 'CouponPlan'))).flat())
        onChange?.(
          (multiple ? selectedValue : [selectedValue])
            .map(
              v =>
                productSelections
                  .find(productSelection => productSelection.productType === v)
                  ?.products.map(product => product.id) || v,
            )
            .flat(),
        )
        onProductChange?.(found)
      }}
      treeData={treeData}
      treeCheckable={multiple}
      showCheckedStrategy="SHOW_PARENT"
      placeholder={formatMessage(messages.selectProducts)}
      treeNodeFilterProp="name"
      dropdownStyle={{
        maxHeight: '40vh',
      }}
    />
  )
}

const useProductSelections = (onlyValid?: boolean) => {
  const { formatMessage } = useIntl()

  const voucherCondition = onlyValid
    ? {
        _or: [
          { ended_at: { _gte: 'now()' } },
          { started_at: { _is_null: true }, ended_at: { _is_null: true } },
          { ended_at: { _is_null: true } },
          { started_at: { _is_null: true }, ended_at: { _gte: 'now()' } },
        ],
        voucher_codes: { remaining: { _nin: [0] } },
        sale_price: { _is_null: false },
        sale_amount: { _is_null: false },
      }
    : {}

  const { loading, error, data, refetch } = useQuery<hasura.GET_PRODUCT_SELECTION_COLLECTION>(
    gql`
      query GET_PRODUCT_SELECTION_COLLECTION($voucherCondition: voucher_plan_bool_exp) {
        program_plan(
          where: {
            program: { _and: [{ is_deleted: { _eq: false } }, { published_at: { _is_null: false } }] }
            is_deleted: { _eq: false }
          }
          order_by: { published_at: desc_nulls_last }
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
        program_package_plan(
          where: { program_package: { published_at: { _is_null: false } } }
          order_by: { published_at: desc_nulls_last }
        ) {
          id
          title
          published_at
          program_package {
            id
            title
          }
        }
        activity_ticket(
          where: {
            ended_at: { _gt: "now()" }
            activity: { _and: [{ deleted_at: { _is_null: true } }, { published_at: { _is_null: false } }] }
          }
        ) {
          id
          title
          started_at
          ended_at
          activity {
            id
            title
          }
          activity_session_tickets(order_by: { activity_session: { ended_at: asc_nulls_first } }) {
            id
            activity_session {
              id
              ended_at
            }
          }
        }
        podcast_program(order_by: [{ published_at: desc_nulls_last }, { updated_at: desc_nulls_last }]) {
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
        merchandise(where: { published_at: { _is_null: false } }) {
          id
          title
          published_at
          is_customized
          is_physical
          merchandise_specs {
            id
            title
          }
        }
        project_plan(
          where: { project: { published_at: { _is_null: false } } }
          order_by: { published_at: desc_nulls_last }
        ) {
          id
          title
          published_at
          project {
            id
            title
          }
        }
        appointment_plan(order_by: { published_at: desc_nulls_last }) {
          id
          title
          published_at
        }
        podcast_plan(order_by: { published_at: desc_nulls_last }) {
          id
          title
          published_at
          creator {
            id
            name
            username
          }
        }
        coupon_plan {
          id
          title
        }
        voucher_plan(where: $voucherCondition) {
          id
          title
        }
        estimator {
          id
          title: name
        }
      }
    `,
    { variables: { voucherCondition }, fetchPolicy: 'network-only', nextFetchPolicy: 'cache-first' },
  )

  const productSelections: {
    productType:
      | ProductType
      | 'CouponPlan'
      | 'GeneralPhysicalMerchandiseSpec'
      | 'GeneralVirtualMerchandiseSpec'
      | 'CustomizedPhysicalMerchandiseSpec'
      | 'CustomizedVirtualMerchandiseSpec'
    products: {
      id: string
      title: string
      publishedAt?: Date | null
      tag?: string
      children?: any[]
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
        data?.activity_ticket
          .filter(v =>
            v.activity_session_tickets.find(w => new Date(w.activity_session.ended_at).getTime() > Date.now()),
          )
          .map(v => ({
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
          title: v.title || '',
          publishedAt: v.published_at ? new Date(v.published_at) : null,
        })) || [],
    },
    {
      productType: 'Card',
      products:
        data?.card.map(v => ({
          id: `Card_${v.id}`,
          title: v.title || '',
        })) || [],
    },
    {
      productType: 'Merchandise',
      products:
        data?.merchandise.map(v => ({
          id: `Merchandise_${v.id}`,
          title: v.title || '',
          publishedAt: v.published_at ? new Date(v.published_at) : null,
          children: v.merchandise_specs.map(({ id }) => id),
        })) || [],
    },
    {
      productType: 'MerchandiseSpec',
      products:
        data?.merchandise.flatMap(w =>
          w.merchandise_specs.flatMap(spec => ({
            id: `MerchandiseSpec_${spec.id}`,
            title: `${w.title} - ${spec.title}`,
            publishedAt: w.published_at ? new Date(w.published_at) : null,
          })),
        ) || [],
    },
    {
      productType: 'GeneralPhysicalMerchandiseSpec',
      products:
        data?.merchandise
          .filter(v => !v.is_customized && v.is_physical)
          .flatMap(w =>
            w.merchandise_specs.flatMap(spec => ({
              id: `MerchandiseSpec_${spec.id}`,
              title: `${w.title} - ${spec.title}`,
              publishedAt: w.published_at ? new Date(w.published_at) : null,
            })),
          ) || [],
    },
    {
      productType: 'GeneralVirtualMerchandiseSpec',
      products:
        data?.merchandise
          .filter(v => !v.is_customized && !v.is_physical)
          .flatMap(w =>
            w.merchandise_specs.flatMap(spec => ({
              id: `MerchandiseSpec_${spec.id}`,
              title: `${w.title} - ${spec.title}`,
              publishedAt: w.published_at ? new Date(w.published_at) : null,
            })),
          ) || [],
    },
    {
      productType: 'CustomizedPhysicalMerchandiseSpec',
      products:
        data?.merchandise
          .filter(v => v.is_customized && v.is_physical)
          .flatMap(w =>
            w.merchandise_specs.flatMap(spec => ({
              id: `MerchandiseSpec_${spec.id}`,
              title: `${w.title} - ${spec.title}`,
              publishedAt: w.published_at ? new Date(w.published_at) : null,
            })),
          ) || [],
    },
    {
      productType: 'CustomizedVirtualMerchandiseSpec',
      products:
        data?.merchandise
          .filter(v => v.is_customized && !v.is_physical)
          .flatMap(w =>
            w.merchandise_specs.flatMap(spec => ({
              id: `MerchandiseSpec_${spec.id}`,
              title: `${w.title} - ${spec.title}`,
              publishedAt: w.published_at ? new Date(w.published_at) : null,
            })),
          ) || [],
    },
    {
      productType: 'ProjectPlan',
      products:
        data?.project_plan.map(v => ({
          id: `ProjectPlan_${v.id}`,
          title: `${v.project.title} - ${v.title}` || '',
          publishedAt: v.published_at ? new Date(v.published_at) : null,
        })) || [],
    },
    {
      productType: 'AppointmentPlan',
      products:
        data?.appointment_plan.map(v => ({
          id: `AppointmentPlan_${v.id}`,
          title: v.title || '',
          publishedAt: v.published_at ? new Date(v.published_at) : null,
        })) || [],
    },
    {
      productType: 'PodcastPlan',
      products:
        data?.podcast_plan.map(v => ({
          id: `PodcastPlan_${v.id}`,
          title: `${v.creator?.name || v.creator?.username || ''}`,
          publishedAt: v.published_at ? new Date(v.published_at) : null,
        })) || [],
    },
    {
      productType: 'CouponPlan',
      products:
        data?.coupon_plan.map(v => ({
          id: `CouponPlan_${v.id}`,
          title: v.title || '',
        })) || [],
    },
    {
      productType: 'VoucherPlan',
      products:
        data?.voucher_plan.map(v => ({
          id: `VoucherPlan_${v.id}`,
          title: v.title || '',
        })) || [],
    },
    {
      productType: 'Estimator',
      products:
        data?.estimator.map(v => ({
          id: `Estimator_${v.id}`,
          title: v.title || '',
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
