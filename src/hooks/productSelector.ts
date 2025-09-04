
import { useState, useEffect, useRef, useMemo } from 'react'
import { gql, useQuery } from '@apollo/client'
import { ProductType } from 'lodestar-app-element/src/types/product'
import { Key } from 'react'


interface ProcessedProduct {
  id: string
  title: string
  publishedAt?: Date | null
  tag?: string
  children?: string[]
  isCustomized?: boolean
  isPhysical?: boolean
  originalData?: any
}

interface ProductSelection {
  productType: string
  products: ProcessedProduct[]
}

interface QueryData {
  [key: string]: any[]
}


export const useProductData = (
  allowTypes: (ProductType | 'CouponPlan' | string)[],
  onlyValid?: boolean
) => {
  const [loadedTypes, setLoadedTypes] = useState<string[]>([])
  const [productSelections, setProductSelections] = useState<ProductSelection[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const merchandiseDataCache = useRef<ProcessedProduct[]>([])

  const { client } = useQuery(gql`query GetClient { __typename }`)

  
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

  
  const getSpecTitle = (merchandise: ProcessedProduct, specId: string): string => {
    const spec = merchandise.originalData?.merchandise_specs?.find((s: any) => s.id === specId)
    return spec?.title || 'Unknown Spec'
  }

  
  const updateProductSelections = (type: string, data: QueryData) => {
    let products: ProcessedProduct[] = []

    switch (type) {
      case 'ProgramPlan':
        products =
          data?.program_plan?.map((v: any) => ({
            id: `ProgramPlan_${v.id}`,
            title: `${v.program.title} - ${v.title}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
            
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
      prev.map(selection => 
        selection.productType === type ? { ...selection, products } : selection
      )
    )
  }

  
  const updateSearchResults = (type: string, data: QueryData) => {
    let products: ProcessedProduct[] = []

    
    switch (type) {
      case 'ProgramPlan':
        products =
          data?.program_plan?.map((v: any) => ({
            id: `ProgramPlan_${v.id}`,
            title: `${v.program.title} - ${v.title}`,
            publishedAt: v.published_at ? new Date(v.published_at) : null,
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
        const productsMap = new Map<string, ProcessedProduct>()

        selection.products.forEach((p: ProcessedProduct) => productsMap.set(p.id, p))
        products.forEach((p: ProcessedProduct) => productsMap.set(p.id, p))

        const mergedProducts = Array.from(productsMap.values())

        return prev.map(sel => (sel.productType === type ? { ...sel, products: mergedProducts } : sel))
      } else {
        return [...prev, { productType: type, products }]
      }
    })
  }

  
  const processMerchandiseSpecType = (type: string, searchKeyword?: string, merchandiseDataOverride?: ProcessedProduct[]) => {
    const merchandiseSelection = productSelections.find(ps => ps.productType === 'Merchandise')
    const merchandiseData = merchandiseDataOverride || merchandiseSelection?.products || []

    let products: ProcessedProduct[] = []

    switch (type) {
      case 'MerchandiseSpec':
        products = merchandiseData.flatMap(
          (merchandise: ProcessedProduct) =>
            merchandise.children?.map((specId: string) => ({
              id: `MerchandiseSpec_${specId}`,
              title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
              publishedAt: merchandise.publishedAt,
            })) || [],
        )
        break

      case 'GeneralPhysicalMerchandiseSpec':
        products = merchandiseData
          .filter((v: ProcessedProduct) => !v.isCustomized && v.isPhysical)
          .flatMap(
            (merchandise: ProcessedProduct) =>
              merchandise.children?.map((specId: string) => ({
                id: `MerchandiseSpec_${specId}`,
                title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
                publishedAt: merchandise.publishedAt,
              })) || [],
          )
        break

      case 'GeneralVirtualMerchandiseSpec':
        products = merchandiseData
          .filter((v: ProcessedProduct) => !v.isCustomized && !v.isPhysical)
          .flatMap(
            (merchandise: ProcessedProduct) =>
              merchandise.children?.map((specId: string) => ({
                id: `MerchandiseSpec_${specId}`,
                title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
                publishedAt: merchandise.publishedAt,
              })) || [],
          )
        break

      case 'CustomizedPhysicalMerchandiseSpec':
        products = merchandiseData
          .filter((v: ProcessedProduct) => v.isCustomized && v.isPhysical)
          .flatMap(
            (merchandise: ProcessedProduct) =>
              merchandise.children?.map((specId: string) => ({
                id: `MerchandiseSpec_${specId}`,
                title: `${merchandise.title} - ${getSpecTitle(merchandise, specId)}`,
                publishedAt: merchandise.publishedAt,
              })) || [],
          )
        break

      case 'CustomizedVirtualMerchandiseSpec':
        products = merchandiseData
          .filter((v: ProcessedProduct) => v.isCustomized && !v.isPhysical)
          .flatMap(
            (merchandise: ProcessedProduct) =>
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
      products = products.filter((p: ProcessedProduct) => p.title.toLowerCase().includes(keyword))
      updateSearchResults(type, { [type.toLowerCase()]: products })
    } else {
      setProductSelections(prev =>
        prev.map(selection => (selection.productType === type ? { ...selection, products } : selection)),
      )
    }
  }

  
  const loadProductType = async (type: string, searchKeyword?: string) => {
    if (searchKeyword && loadedTypes.includes(type)) return

    if (searchKeyword) {
      setIsLoading(true)  
    } else {
      setIsLoading(true)
    }

    try {
      const merchandiseSpecTypes = [
        'MerchandiseSpec',
        'GeneralPhysicalMerchandiseSpec',
        'GeneralVirtualMerchandiseSpec',
        'CustomizedPhysicalMerchandiseSpec',
        'CustomizedVirtualMerchandiseSpec',
      ]

      if (merchandiseSpecTypes.includes(type)) {
        
        let merchandiseData: ProcessedProduct[] = []
        
        if (!loadedTypes.includes('Merchandise')) {
          
          const queryString = getQueryForType('Merchandise')
          if (queryString) {
            const fullQuery = gql`
              query GET_MERCHANDISE_PRODUCTS($voucherCondition: voucher_plan_bool_exp) {
                ${queryString}
              }
            `
            
            const { data } = await client.query({
              query: fullQuery,
              variables: { voucherCondition: getVoucherCondition(onlyValid) },
              fetchPolicy: searchKeyword ? 'network-only' : 'cache-first',
            })
            
            
            merchandiseData = data?.merchandise?.map((v: any) => ({
              id: `Merchandise_${v.id}`,
              title: v.title || '',
              publishedAt: v.published_at ? new Date(v.published_at) : null,
              children: v.merchandise_specs.map(({ id }: any) => id),
              isCustomized: v.is_customized,
              isPhysical: v.is_physical,
              originalData: v,
            })) || []
            
            
            merchandiseDataCache.current = merchandiseData
            
            updateProductSelections('Merchandise', data)
            setLoadedTypes(prev => [...prev, 'Merchandise'])
          }
        } else {
          
          merchandiseData = productSelections.find(ps => ps.productType === 'Merchandise')?.products || merchandiseDataCache.current
        }
        
        processMerchandiseSpecType(type, searchKeyword, merchandiseData)
      } else {
        const queryString = getQueryForType(type)
        if (!queryString) {
          setIsLoading(false)
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
          updateSearchResults(type, data)
        } else {
          updateProductSelections(type, data)
        }
      }

      if (!searchKeyword && !merchandiseSpecTypes.includes(type)) {
        setLoadedTypes(prev => [...prev, type])
      }
    } catch (error) {
      console.error(`Error loading products for type ${type}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  
  useEffect(() => {
    setProductSelections(prevSelections => {
      const loadedData: Record<string, ProcessedProduct[]> = {}
      prevSelections.forEach(ps => {
        if (ps.products && ps.products.length > 0) {
          loadedData[ps.productType] = [...ps.products]
        }
      })

      return allowTypes.map(type => ({
        productType: type,
        products: loadedData[type] || [],
      }))
    })
  }, [allowTypes])

  return {
    productSelections,
    loadedTypes,
    isLoading,
    loadProductType,
    setProductSelections,
  }
}


export const useProductSearch = (
  productSelections: ProductSelection[],
  allowTypes: (ProductType | 'CouponPlan' | string)[],
  loadProductType: (type: string, searchKeyword?: string) => Promise<void>
) => {
  const [searchTerm, setSearchTerm] = useState<string>('')
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const [isSearchingDatabase, setIsSearchingDatabase] = useState(false)

  
  const handleSearch = async (value: string) => {
    setSearchTerm(value)

    if (!value.trim()) {
      setExpandedKeys([])
      return
    }

    
    const hasLocalResults = productSelections.some(selection =>
      selection.products.some((product: any) => 
        product.title.toLowerCase().includes(value.toLowerCase())
      )
    )

    
    if (!hasLocalResults) {
      setIsSearchingDatabase(true)
      try {
        const searchPromises = allowTypes.map(type => loadProductType(type, value))
        await Promise.all(searchPromises)
      } finally {
        setIsSearchingDatabase(false)
      }
    }
  }

  useEffect(() => {
    if (searchTerm) {
      
      const matchingTypes: string[] = []
      productSelections.forEach(selection => {
        
        const matches = selection.products.filter((product: any) =>
          product.title.toLowerCase().includes(searchTerm.toLowerCase())
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

  return {
    searchTerm,
    expandedKeys,
    isSearchingDatabase,
    setExpandedKeys,
    setSearchTerm,
    handleSearch,
  }
}


export const useProductSelection = (
  value: string[] | undefined,
  multiple: boolean | undefined,
  productSelections: ProductSelection[],
  loadProductType: (type: string) => Promise<void>,
  loadedTypes: string[],
  onChange?: (value: string[]) => void,
  onProductChange?: (value: any[]) => void,
  onFullSelected?: (types: (ProductType | 'CouponPlan')[]) => void
) => {
  const loadProductTypeRef = useRef<typeof loadProductType>()
  loadProductTypeRef.current = loadProductType

  
  useEffect(() => {
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
        if (loadProductTypeRef.current) {
          loadProductTypeRef.current(type)
        }
      })
    }
  }, [value])

  
  const handleTreeSelect = (selectedValue: string[] | string) => {
    const valueArray = Array.isArray(selectedValue) ? selectedValue : [selectedValue]
    
    const selectedIds = (multiple ? valueArray : [valueArray[0]])
      .map(v => {
        if (v.includes('_')) {
          return v
        } else {
          const selection = productSelections.find(s => s.productType === v)
          const ids = selection?.products.map((p: any) => p.id) || []
          return ids
        }
      })
      .flat()

    valueArray.forEach(value => {
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

    const found = (multiple ? valueArray : [valueArray[0]])
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

    const selectedTypes = valueArray.map(v => (v.includes('_') ? [] : (v as ProductType | 'CouponPlan'))).flat()

    onFullSelected?.(selectedTypes)
    onChange?.(selectedIds)
    onProductChange?.(found)
  }

  
  const handleTreeExpand = (keys: Key[], setSearchTerm: (term: string) => void, setExpandedKeys: (keys: string[]) => void) => {
    const stringKeys = keys.map(key => String(key))
    
    setExpandedKeys(stringKeys)
    setSearchTerm('') 

    const newExpandedTypes = stringKeys.filter(key => !loadedTypes.includes(key))
    newExpandedTypes.forEach(type => {
      loadProductType(type)
    })
  }

  return {
    handleTreeSelect,
    handleTreeExpand,
  }
}


export const useTreeDataBase = (
  productSelections: ProductSelection[],
  allowTypes: (ProductType | 'CouponPlan' | string)[],
  multiple: boolean | undefined
) => {
  return useMemo(() => {
    return productSelections
      .filter(productSelection => allowTypes.includes(productSelection.productType))
      .map(productSelection => ({
        key: productSelection.productType,
        value: productSelection.productType,
        selectable: !!multiple,
        isLeaf: false,
        products: productSelection.products,
        productType: productSelection.productType,
      }))
  }, [productSelections, allowTypes, multiple])
}