import { gql, useQuery } from '@apollo/client'
import { Spin, Tag, TreeSelect } from 'antd'
import { DataNode } from 'antd/lib/tree'
import { ProductType } from 'lodestar-app-element/src/types/product'
import React, { useEffect, useState } from 'react'
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
    case 'Estimator': // customized
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

// 獲取券碼條件函數
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

// 產品選擇器組件
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

  // 獲取 Apollo Client 實例
  const { client } = useQuery(
    gql`
      query GetClient {
        __typename
      }
    `,
  )

  // 動態創建單一產品類型的查詢
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

    // 特殊情況，Merchandise 派生類型
    const merchandiseSpecTypes = [
      'MerchandiseSpec',
      'GeneralPhysicalMerchandiseSpec',
      'GeneralVirtualMerchandiseSpec',
      'CustomizedPhysicalMerchandiseSpec',
      'CustomizedVirtualMerchandiseSpec',
    ]

    // 如果是 Merchandise 派生類型且未加載過 Merchandise，需要加載 Merchandise
    if (merchandiseSpecTypes.includes(type) && !loadedTypes.includes('Merchandise')) {
      return queries['Merchandise']
    }

    return queries[type] || ''
  }

  // 輔助函數：獲取商品規格標題
  const getSpecTitle = (merchandise: any, specId: string) => {
    // 這裡需要根據實際數據結構調整
    // 假設 merchandise.originalData 中包含原始規格數據
    const spec = merchandise.originalData?.merchandise_specs?.find((s: any) => s.id === specId)
    return spec?.title || 'Unknown Spec'
  }

  // 更新產品選擇 - 將 formatMessage 作為參數傳入，而不是在函數內調用 useIntl
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

    console.log('Products processed:', products.length, products)
    console.log(
      '實際產品標題格式:',
      products.map(p => p.title),
    )

    // 更新產品選擇
    setProductSelections(prev => {
      const updated = prev.map(selection => (selection.productType === type ? { ...selection, products } : selection))
      console.log('ProductSelections updated:', updated)
      return updated
    })
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

      // MerchandiseSpec 類型的特殊處理
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
        // 創建一個包含現有產品和新搜尋結果的集合
        // 使用 Map 去重複 (根據 id)
        const productsMap = new Map()

        // 添加現有產品
        selection.products.forEach((p: any) => productsMap.set(p.id, p))

        // 添加新搜尋結果
        products.forEach((p: any) => productsMap.set(p.id, p))

        // 將 Map 轉換回陣列
        const mergedProducts = Array.from(productsMap.values())

        console.log('Merged products:', mergedProducts.length, mergedProducts)

        // 用合併後的結果更新選擇
        return prev.map(sel => (sel.productType === type ? { ...sel, products: mergedProducts } : sel))
      } else {
        // 如果選擇不存在，創建一個新的
        console.log('Adding new product selection for type:', type)
        return [...prev, { productType: type, products }]
      }
    })
  }

  // 處理 MerchandiseSpec 相關類型
  const processMerchandiseSpecType = (type: string, searchKeyword?: string) => {
    console.log('processMerchandiseSpecType called for type:', type, 'searchKeyword:', searchKeyword)

    // 從已加載的產品選擇中尋找 Merchandise 數據
    const merchandiseData = productSelections.find(ps => ps.productType === 'Merchandise')?.products || []

    // 根據不同類型處理數據
    let products = []

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

    console.log('Merchandise spec products processed:', products.length, products)

    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase()
      products = products.filter((p: any) => p.title.toLowerCase().includes(keyword))
      console.log('Filtered products by keyword:', products.length, products)

      // 更新搜尋結果
      updateSearchResults(type, { [type.toLowerCase()]: products }, formatMessage)
    } else {
      // 更新產品選擇
      setProductSelections(prev => {
        const updated = prev.map(selection => (selection.productType === type ? { ...selection, products } : selection))
        console.log('Updated productSelections for merchandiseSpec:', updated)
        return updated
      })
    }
  }

  // 按需加載特定產品類型
  const loadProductType = async (type: string, searchKeyword?: string) => {
    console.log('loadProductType called for type:', type, 'searchKeyword:', searchKeyword)

    // 避免重複加載
    if (searchKeyword && loadedTypes.includes(type)) return

    if (searchKeyword) setIsSearchingDatabase(true)
    else setIsLoading(true)

    try {
      // 特殊處理 MerchandiseSpec 相關類型
      const merchandiseSpecTypes = [
        'MerchandiseSpec',
        'GeneralPhysicalMerchandiseSpec',
        'GeneralVirtualMerchandiseSpec',
        'CustomizedPhysicalMerchandiseSpec',
        'CustomizedVirtualMerchandiseSpec',
      ]

      if (merchandiseSpecTypes.includes(type) && !loadedTypes.includes('Merchandise')) {
        console.log('Loading Merchandise data first for spec type:', type)
        // 先載入 Merchandise 數據
        await loadProductType('Merchandise')
      }

      // 處理普通產品類型
      if (!merchandiseSpecTypes.includes(type)) {
        const queryString = getQueryForType(type)
        if (!queryString) {
          console.log('No query string found for type:', type)
          setIsLoading(false)
          setIsSearchingDatabase(false)
          return
        }

        // 創建完整查詢
        const fullQuery = gql`
          query GET_${type.toUpperCase()}_PRODUCTS($voucherCondition: voucher_plan_bool_exp) {
            ${queryString}
          }
        `

        console.log('Executing query for type:', type)
        // 執行查詢 - 使用外部獲取的 client 而不是在函數內調用 useQuery
        const { data } = await client.query({
          query: fullQuery,
          variables: { voucherCondition: getVoucherCondition(onlyValid) },
          fetchPolicy: searchKeyword ? 'network-only' : 'cache-first', // 搜尋時強制從網絡獲取
        })

        console.log('Query result for type:', type, data)

        // 處理數據並更新狀態
        if (searchKeyword) {
          // 搜尋模式：累加搜索結果
          updateSearchResults(type, data, formatMessage)
        } else {
          // 普通模式：更新整個產品列表
          updateProductSelections(type, data, formatMessage)
        }
      } else {
        console.log('Processing MerchandiseSpec type:', type)
        // 處理 MerchandiseSpec 相關類型
        // 這些類型不需要額外查詢，僅從現有 Merchandise 數據中過濾
        processMerchandiseSpecType(type, searchKeyword)
      }

      // 如果不是搜尋模式，標記該類型已加載
      if (!searchKeyword) {
        setLoadedTypes(prev => {
          const updated = [...prev, type]
          console.log('Updated loadedTypes:', updated)
          return updated
        })
      }
    } catch (error) {
      console.error(`Error loading products for type ${type}:`, error)
    } finally {
      setIsLoading(false)
      setIsSearchingDatabase(false)
    }
  }

  // 初始化一個包含所有允許類型的空產品結構
  useEffect(() => {
    console.log('useEffect[allowTypes] triggered, allowTypes:', allowTypes)
    console.log('Current productSelections:', productSelections)
    console.log('Current loadedTypes:', loadedTypes)

    const loadedData = {}
    productSelections.forEach(ps => {
      if (ps.products && ps.products.length > 0 && loadedTypes.includes(ps.productType)) {
        loadedData[ps.productType] = [...ps.products]
      }
    })

    const initialProductSelections = allowTypes.map(type => ({
      productType: type,
      products: loadedData[type] || [],
    }))

    console.log('Setting initialProductSelections:', initialProductSelections)
    setProductSelections(initialProductSelections)

    // 如果有預設值，預載入相關類型
    if (value && value.length > 0) {
      const typesToLoad = new Set<string>()
      value.forEach(v => {
        if (v.includes('_')) {
          const typeEnd = v.indexOf('_')
          const type = v.slice(0, typeEnd)
          typesToLoad.add(type)
        }
      })

      // 預載入這些類型的產品
      typesToLoad.forEach(type => {
        loadProductType(type)
      })
    }
  }, [allowTypes])

  // 處理樹節點展開
  const handleTreeExpand = (keys: string[]) => {
    console.log('handleTreeExpand called with keys:', keys)
    setExpandedKeys(keys)

    // 找出新展開的節點
    const newExpandedTypes = keys.filter(key => !loadedTypes.includes(key))
    console.log('New expanded types to load:', newExpandedTypes)

    // 為新展開的節點加載數據
    newExpandedTypes.forEach(type => {
      loadProductType(type)
    })
  }

  // 處理樹選擇變更
  const handleTreeSelect = (selectedValue: string[]) => {
    console.log('handleTreeSelect called with:', selectedValue)

    // 確保所需類型已加載
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

    // 找出已選產品
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

    console.log('Found products:', found)

    // 處理全選類型
    const selectedTypes = selectedValue.map(v => (v.includes('_') ? [] : (v as ProductType | 'CouponPlan'))).flat()
    onFullSelected?.(selectedTypes)
    console.log('Selected types for onFullSelected:', selectedTypes)
    onFullSelected?.(selectedTypes)

    // 處理選擇的產品 ID
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

    console.log('Selected IDs for onChange:', selectedIds)
    onChange?.(selectedIds)
    onProductChange?.(found)
  }

  // 處理搜尋功能
  const handleSearch = async (value: string) => {
    console.log('原始搜尋詞:', value)

    // 設置搜尋詞
    setSearchTerm(value)

    // 如果搜尋詞為空，不執行搜尋
    if (!value.trim()) {
      // 清空展開狀態
      setExpandedKeys([])
      return
    }

    // 首先搜尋本地已加載數據
    const hasLocalResults = productSelections.some(selection =>
      selection.products.some((product: any) => {
        const match = product.title.toLowerCase().includes(value.toLowerCase())
        if (match) {
          console.log('Local match found in product:', product)
        }
        return match
      }),
    )

    console.log('Has local results:', hasLocalResults)

    // 如果本地找不到結果，則查詢資料庫
    if (!hasLocalResults) {
      // 對所有允許的類型執行搜尋
      const searchPromises = allowTypes.map(type => loadProductType(type, value))

      // 等待所有搜尋完成
      await Promise.all(searchPromises)
      console.log('All search promises completed')
    }

    console.log('Tree data after search:', treeData)
  }

  useEffect(() => {
    // 如果有搜尋詞，則檢查匹配項
    if (searchTerm) {
      console.log(`檢查 productSelections 是否包含搜尋詞 "${searchTerm}" 的匹配項：`)

      // 搜尋匹配項
      const matchingTypes = []
      productSelections.forEach(selection => {
        const matches = selection.products.filter(product =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        if (matches.length > 0) {
          matchingTypes.push(selection.productType)
          console.log(`- 類型 ${selection.productType} 有 ${matches.length} 個匹配項，例如: "${matches[0].title}"`)
        }
      })

      console.log(`找到 ${matchingTypes.length} 個包含匹配項的類型:`, matchingTypes)
      console.log(`目前展開的節點:`, expandedKeys)

      // 關鍵解決方案：如果有匹配項，自動設置展開節點
      if (matchingTypes.length > 0) {
        console.log(`設置展開節點:`, matchingTypes)
        setExpandedKeys(matchingTypes)
      }
    }
  }, [productSelections, searchTerm])

  // 構建樹數據
  const treeData: DataNode[] = productSelections
    .filter(productSelection => allowTypes.includes(productSelection.productType))
    .map(productSelection => ({
      key: productSelection.productType,
      title: formatMessage(productTypeLabel(productSelection.productType)),
      value: productSelection.productType,
      selectable: !!multiple,
      isLeaf: false, // 確保顯示展開圖標
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
        isLeaf: true, // 葉節點沒有展開圖標
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
