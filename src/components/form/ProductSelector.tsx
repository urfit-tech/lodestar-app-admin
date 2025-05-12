import { gql, useQuery } from '@apollo/client'
import { Spin, Tag, TreeSelect } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React, { Key, useEffect, useState } from 'react'
import { defineMessages, useIntl } from 'react-intl'
import { commonMessages } from '../../helpers/translation'
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
    case 'Estimator':
      return commonMessages.label.allEstimator
    default:
      return commonMessages.label.unknownProduct
  }
}

const messages = defineMessages({
  selectProducts: { id: 'promotion.label.selectProducts', defaultMessage: '選擇項目' },
  loading: { id: 'common.status.loading', defaultMessage: '載入中...' },
  searchingDatabase: { id: 'common.status.searchingDatabase', defaultMessage: '搜尋資料庫中...' },
})

const getVoucherCondition = (onlyValid?: boolean) => {
  return onlyValid
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
}

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
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [loadedTypes, setLoadedTypes] = useState<string[]>([])
  const [productSelections, setProductSelections] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false)

  const { client } = useQuery(
    gql`
      query GetClient {
        __typename
      }
    `,
  )

  const getQueryForType = (type: string) => {
    const queries: Record<string, string> = {
      ProgramPlan: `
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
      `,
      ProgramPackagePlan: `
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
      `,
      ActivityTicket: `
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
      `,
      PodcastProgram: `
        podcast_program(order_by: [{ published_at: desc_nulls_last }, { updated_at: desc_nulls_last }]) {
          id
          title
          published_at
          creator {
            id
            name
          }
        }
      `,
      Card: `
        card {
          id
          title
        }
      `,
      Merchandise: `
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
      `,
      ProjectPlan: `
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
      `,
      AppointmentPlan: `
        appointment_plan(order_by: { published_at: desc_nulls_last }) {
          id
          title
          published_at
        }
      `,
      PodcastPlan: `
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
      `,
      CouponPlan: `
        coupon_plan {
          id
          title
        }
      `,
      VoucherPlan: `
        voucher_plan(where: $voucherCondition) {
          id
          title
        }
      `,
      Estimator: `
        estimator {
          id
          title: name
        }
      `,
    }

    const merchandiseSpecTypes = [
      'MerchandiseSpec',
      'GeneralPhysicalMerchandiseSpec',
      'GeneralVirtualMerchandiseSpec',
      'CustomizedPhysicalMerchandiseSpec',
      'CustomizedVirtualMerchandiseSpec',
    ]

    if (merchandiseSpecTypes.includes(type) && !loadedTypes.includes('Merchandise')) {
      return queries['Merchandise']
    }

    return queries[type] || ''
  }

  const getSpecTitle = (merchandise: any, specId: string) => {
    const spec = merchandise.originalData?.merchandise_specs?.find((s: any) => s.id === specId)
    return spec?.title || 'Unknown Spec'
  }

  const updateProductSelections = (type: string, data: any, formatMessage: any) => {
    let products: any[] = []

    switch (type) {
      case 'ProgramPlan':
        products =
          data?.program_plan?.map((v: any) => ({
            id: `ProgramPlan_${v.id}`,
            title: `${v.program.title} - ${v.title}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            tag: v.auto_renewed
              ? formatMessage(commonMessages.ui.subscriptionPlan)
              : v.period_amount && v.period_type
              ? formatMessage(commonMessages.ui.periodPlan)
              : formatMessage(commonMessages.ui.perpetualPlan),
            originalData: v,
          })) || []
        break

      case 'ProgramPackagePlan':
        products =
          data?.program_package_plan?.map((v: any) => ({
            id: `ProgramPackagePlan_${v.id}`,
            title: `${v.program_package.title} - ${v.title}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break

      case 'ActivityTicket':
        products =
          data?.activity_ticket
            ?.filter((v: any) =>
              v.activity_session_tickets.find((w: any) => new Date(w.activity_session.ended_at).getTime() > Date.now()),
            )
            .map((v: any) => ({
              id: `ActivityTicket_${v.id}`,
              title: `${v.activity.title} - ${v.title}`,
              publishedAt:
                v.started_at && v.ended_at && Date.now() < new Date(v.ended_at).getTime()
                  ? new Date(v.started_at)
                  : null,
              originalData: v,
            })) || []
        break

      case 'PodcastProgram':
        products =
          data?.podcast_program?.map((v: any) => ({
            id: `PodcastProgram_${v.id}`,
            title: v.title || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break

      case 'Card':
        products =
          data?.card?.map((v: any) => ({
            id: `Card_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break

      case 'Merchandise':
        products =
          data?.merchandise?.map((v: any) => ({
            id: `Merchandise_${v.id}`,
            title: v.title || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            children: v.merchandise_specs.map(({ id }: any) => id),
            isCustomized: v.is_customized,
            isPhysical: v.is_physical,
            originalData: v,
          })) || []
        break

      case 'ProjectPlan':
        products =
          data?.project_plan?.map((v: any) => ({
            id: `ProjectPlan_${v.id}`,
            title: `${v.project.title} - ${v.title}` || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break

      case 'AppointmentPlan':
        products =
          data?.appointment_plan?.map((v: any) => ({
            id: `AppointmentPlan_${v.id}`,
            title: v.title || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break

      case 'PodcastPlan':
        products =
          data?.podcast_plan?.map((v: any) => ({
            id: `PodcastPlan_${v.id}`,
            title: `${v.creator?.name || v.creator?.username || ''}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break

      case 'CouponPlan':
        products =
          data?.coupon_plan?.map((v: any) => ({
            id: `CouponPlan_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break

      case 'VoucherPlan':
        products =
          data?.voucher_plan?.map((v: any) => ({
            id: `VoucherPlan_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break

      case 'Estimator':
        products =
          data?.estimator?.map((v: any) => ({
            id: `Estimator_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break
    }

    setProductSelections(prev =>
      prev.map(selection => (selection.productType === type ? { ...selection, products } : selection)),
    )
  }

  const updateSearchResults = (type: string, data: any, formatMessage: any) => {
    let products: any[] = []

    switch (type) {
      case 'ProgramPlan':
        products =
          data?.program_plan?.map((v: any) => ({
            id: `ProgramPlan_${v.id}`,
            title: `${v.program.title} - ${v.title}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            tag: v.auto_renewed
              ? formatMessage(commonMessages.ui.subscriptionPlan)
              : v.period_amount && v.period_type
              ? formatMessage(commonMessages.ui.periodPlan)
              : formatMessage(commonMessages.ui.perpetualPlan),
            originalData: v,
          })) || []
        break

      case 'ProgramPackagePlan':
        products =
          data?.program_package_plan?.map((v: any) => ({
            id: `ProgramPackagePlan_${v.id}`,
            title: `${v.program_package.title} - ${v.title}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break
      case 'ActivityTicket':
        products =
          data?.activity_ticket
            ?.filter((v: any) =>
              v.activity_session_tickets.find((w: any) => new Date(w.activity_session.ended_at).getTime() > Date.now()),
            )
            .map((v: any) => ({
              id: `ActivityTicket_${v.id}`,
              title: `${v.activity.title} - ${v.title}`,
              publishedAt:
                v.started_at && v.ended_at && Date.now() < new Date(v.ended_at).getTime()
                  ? new Date(v.started_at)
                  : null,
              originalData: v,
            })) || []
        break
      case 'PodcastProgram':
        products =
          data?.podcast_program?.map((v: any) => ({
            id: `PodcastProgram_${v.id}`,
            title: v.title || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break
      case 'Card':
        products =
          data?.card?.map((v: any) => ({
            id: `Card_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break
      case 'Merchandise':
        products =
          data?.merchandise?.map((v: any) => ({
            id: `Merchandise_${v.id}`,
            title: v.title || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            children: v.merchandise_specs.map(({ id }: any) => id),
            isCustomized: v.is_customized,
            isPhysical: v.is_physical,
            originalData: v,
          })) || []
        break
      case 'ProjectPlan':
        products =
          data?.project_plan?.map((v: any) => ({
            id: `ProjectPlan_${v.id}`,
            title: `${v.project.title} - ${v.title}` || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break
      case 'AppointmentPlan':
        products =
          data?.appointment_plan?.map((v: any) => ({
            id: `AppointmentPlan_${v.id}`,
            title: v.title || '',
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break
      case 'PodcastPlan':
        products =
          data?.podcast_plan?.map((v: any) => ({
            id: `PodcastPlan_${v.id}`,
            title: `${v.creator?.name || v.creator?.username || ''}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            originalData: v,
          })) || []
        break
      case 'CouponPlan':
        products =
          data?.coupon_plan?.map((v: any) => ({
            id: `CouponPlan_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break
      case 'VoucherPlan':
        products =
          data?.voucher_plan?.map((v: any) => ({
            id: `VoucherPlan_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break
      case 'Estimator':
        products =
          data?.estimator?.map((v: any) => ({
            id: `Estimator_${v.id}`,
            title: v.title || '',
            originalData: v,
          })) || []
        break

      case 'MerchandiseSpec':
      case 'GeneralPhysicalMerchandiseSpec':
      case 'GeneralVirtualMerchandiseSpec':
      case 'CustomizedPhysicalMerchandiseSpec':
      case 'CustomizedVirtualMerchandiseSpec':
        products = data[type.toLowerCase()] || []
        break
    }

    setProductSelections(prev => {
      const selection = prev.find(ps => ps.productType === type)

      if (selection) {
        const productsMap = new Map()

        selection.products.forEach((p: any) => productsMap.set(p.id, p))

        products.forEach((p: any) => productsMap.set(p.id, p))

        const mergedProducts = Array.from(productsMap.values())

        return prev.map(sel => (sel.productType === type ? { ...sel, products: mergedProducts } : sel))
      } else {
        return [...prev, { productType: type, products }]
      }
    })
  }

  const processMerchandiseSpecType = (type: string, searchKeyword?: string) => {
    const merchandiseData = productSelections.find(ps => ps.productType === 'Merchandise')?.products || []

    let products: any[] = []

    switch (type) {
      case 'MerchandiseSpec':
        products = merchandiseData.flatMap(
          (merchandise: any) =>
            merchandise.children?.map((specId: string) => ({
              id: `MerchandiseSpec_${specId}`,
              title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
              publishedAt: merchandise.publishedAt,
            })) || [],
        )
        break

      case 'GeneralPhysicalMerchandiseSpec':
        products = merchandiseData
          .filter((v: any) => !v.isCustomized && v.isPhysical)
          .flatMap(
            (merchandise: any) =>
              merchandise.children?.map((specId: string) => ({
                id: `MerchandiseSpec_${specId}`,
                title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
                publishedAt: merchandise.publishedAt,
              })) || [],
          )
        break

      case 'GeneralVirtualMerchandiseSpec':
        products = merchandiseData
          .filter((v: any) => !v.isCustomized && !v.isPhysical)
          .flatMap(
            (merchandise: any) =>
              merchandise.children?.map((specId: string) => ({
                id: `MerchandiseSpec_${specId}`,
                title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
                publishedAt: merchandise.publishedAt,
              })) || [],
          )
        break

      case 'CustomizedPhysicalMerchandiseSpec':
        products = merchandiseData
          .filter((v: any) => v.isCustomized && v.isPhysical)
          .flatMap(
            (merchandise: any) =>
              merchandise.children?.map((specId: string) => ({
                id: `MerchandiseSpec_${specId}`,
                title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
                publishedAt: merchandise.publishedAt,
              })) || [],
          )
        break

      case 'CustomizedVirtualMerchandiseSpec':
        products = merchandiseData
          .filter((v: any) => v.isCustomized && !v.isPhysical)
          .flatMap(
            (merchandise: any) =>
              merchandise.children?.map((specId: string) => ({
                id: `MerchandiseSpec_${specId}`,
                title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
                publishedAt: merchandise.publishedAt,
              })) || [],
          )
        break
    }

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      products = products.filter((p: any) => p.title.toLowerCase().includes(keyword))

      updateSearchResults(type, { [type.toLowerCase()]: products }, formatMessage)
    } else {
      setProductSelections(prev =>
        prev.map(selection => (selection.productType === type ? { ...selection, products } : selection)),
      )
    }
  }

  const loadProductType = async (type: string, searchKeyword?: string) => {
    if (searchKeyword && loadedTypes.includes(type)) return

    if (searchKeyword) setIsSearchingDatabase(true)
    else setIsLoading(true)

    try {
      const merchandiseSpecTypes = [
        'MerchandiseSpec',
        'GeneralPhysicalMerchandiseSpec',
        'GeneralVirtualMerchandiseSpec',
        'CustomizedPhysicalMerchandiseSpec',
        'CustomizedVirtualMerchandiseSpec',
      ]

      if (merchandiseSpecTypes.includes(type) && !loadedTypes.includes('Merchandise')) {
        await loadProductType('Merchandise')
      }

      if (!merchandiseSpecTypes.includes(type)) {
        const queryString = getQueryForType(type)
        if (!queryString) {
          setIsLoading(false)
          setIsSearchingDatabase(false)
          return
        }

        const fullQuery = gql`
          query GET_${type.toUpperCase()}_PRODUCTS($voucherCondition: voucher_plan_bool_exp) {
            ${queryString}
          }
        `

        const { data } = await client.query({
          query: fullQuery,
          variables: { voucherCondition: getVoucherCondition(onlyValid) },
          fetchPolicy: searchKeyword ? 'network-only' : 'cache-first',
        })

        if (searchKeyword) {
          updateSearchResults(type, data, formatMessage)
        } else {
          updateProductSelections(type, data, formatMessage)
        }
      } else {
        processMerchandiseSpecType(type, searchKeyword)
      }

      if (!searchKeyword) {
        setLoadedTypes(prev => [...prev, type])
      }
    } catch (error) {
      console.error(`Error loading products for type ${type}:`, error)
    } finally {
      setIsLoading(false)
      setIsSearchingDatabase(false)
    }
  }

  useEffect(() => {
    const loadedData: Record<string, any[]> = {}
    productSelections.forEach(ps => {
      if (ps.products && ps.products.length > 0 && loadedTypes.includes(ps.productType)) {
        loadedData[ps.productType] = [...ps.products]
      }
    })

    const initialProductSelections = allowTypes.map(type => ({
      productType: type,
      products: loadedData[type] || [],
    }))

    setProductSelections(initialProductSelections)

    if (value && value.length > 0) {
      const typesToLoad = new Set<string>()
      value.forEach(v => {
        if (v.includes('_')) {
          const typeEnd = v.indexOf('_')
          const type = v.slice(0, typeEnd)
          typesToLoad.add(type)
        }
      })

      typesToLoad.forEach(type => {
        loadProductType(type)
      })
    }
  }, [allowTypes])

  const handleTreeExpand = (keys: Key[]) => {
    const stringKeys = keys.map(key => String(key))
    setExpandedKeys(stringKeys)

    const newExpandedTypes = stringKeys.filter(key => !loadedTypes.includes(key))

    newExpandedTypes.forEach(type => {
      loadProductType(type)
    })
  }

  const handleTreeSelect = (selectedValue: string[]) => {
    selectedValue.forEach(value => {
      if (value.includes('_')) {
        const typeEnd = value.indexOf('_')
        const type = value.slice(0, typeEnd)
        if (!loadedTypes.includes(type)) {
          loadProductType(type)
        }
      } else if (!loadedTypes.includes(value)) {
        loadProductType(value)
      }
    })

    const found = (multiple ? selectedValue : [selectedValue])
      .map(v => {
        if (v.includes('_')) {
          const typeEnd = v.indexOf('_')
          const type = v.slice(0, typeEnd)
          const selection = productSelections.find(s => s.productType === type)
          return selection?.products.find((p: any) => p.id === v)
        } else {
          const selection = productSelections.find(s => s.productType === v)
          return selection?.products || []
        }
      })
      .flat()
      .filter(Boolean)

    const selectedTypes = selectedValue.map(v => (v.includes('_') ? [] : (v as ProductType | 'CouponPlan'))).flat()
    onFullSelected?.(selectedTypes)
    onFullSelected?.(selectedTypes)

    const selectedIds = (multiple ? selectedValue : [selectedValue])
      .map(v => {
        if (v.includes('_')) {
          return v
        } else {
          const selection = productSelections.find(s => s.productType === v)
          return selection?.products.map((p: any) => p.id) || []
        }
      })
      .flat()

    onChange?.(selectedIds)
    onProductChange?.(found)
  }

  const handleSearch = async (value: string) => {
    setSearchTerm(value)

    if (!value.trim()) {
      setExpandedKeys([])
      return
    }

    const hasLocalResults = productSelections.some(selection =>
      selection.products.some((product: any) => product.title.toLowerCase().includes(value.toLowerCase())),
    )

    if (!hasLocalResults) {
      const searchPromises = allowTypes.map(type => loadProductType(type, value))

      await Promise.all(searchPromises)
    }
  }

  useEffect(() => {
    if (searchTerm) {
      const matchingTypes: string[] = []
      productSelections.forEach(selection => {
        const matches = selection.products.filter(product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        if (matches.length > 0) {
          matchingTypes.push(selection.productType)
        }
      })

      if (matchingTypes.length > 0) {
        setExpandedKeys(matchingTypes)
      }
    }
  }, [productSelections, searchTerm])

  const treeData: DataNode[] = productSelections
    .filter(productSelection => allowTypes.includes(productSelection.productType))
    .map(productSelection => ({
      key: productSelection.productType,
      title: formatMessage(productTypeLabel(productSelection.productType)),
      value: productSelection.productType,
      selectable: !!multiple,
      isLeaf: false,
      children: productSelection.products.map((product: any) => ({
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
        isLeaf: true,
      })),
    }))

  return (
    <>
      {(isLoading || isSearchingDatabase) && (
        <div style={{ marginBottom: '8px' }}>
          <Spin size="small" />
          <span>
            {isSearchingDatabase ? formatMessage(messages.searchingDatabase) : formatMessage(messages.loading)}
          </span>
        </div>
      )}
      <TreeSelect
        value={value}
        onChange={handleTreeSelect}
        treeData={treeData}
        treeCheckable={multiple}
        showCheckedStrategy="SHOW_PARENT"
        placeholder={formatMessage(messages.selectProducts)}
        treeNodeFilterProp="name"
        onTreeExpand={handleTreeExpand}
        treeExpandedKeys={expandedKeys}
        showSearch
        allowClear
        onSearch={handleSearch}
        dropdownStyle={{
          maxHeight: '40vh',
        }}
      />
    </>
  )
}

export default ProductSelector
