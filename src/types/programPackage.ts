export type ProgramPackage = {
  title: string
  coverUrl: string | null
  publishedAt: string | null
  description: string | null
  programs: {
    id: string
    title: string
    coverUrl: string
    position: number
  }[]
  plans: {
    title: string
    listPrice: number
    salePrice: number | null
    soldAt: Date | null
    description: string | null
    soldQuantity: number
  }[]
}

export type ProgramPackageCollection = {
  id: string
  coverUrl?: string | null
  title: string
  publishedAt: Date
  soldQuantity: number
}[]

export type ProgramPackageProps = {
  programPackageId: string
  programPackage: ProgramPackage
  onRefetch?: () => void
}
