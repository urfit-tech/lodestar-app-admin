import { MetaTag } from 'lodestar-app-element/src/types/general'

export type Certificate = {
  id: string
  title: string
  description: string | null
  qualification: string | null
  code: string | null
  periodType: 'D' | 'W' | 'M' | 'Y'
  periodAmount: number
  author: {
    id: string
    name: string
  }
  certificateTemplate: CertificateTemplate
  publishedAt: Date | null
  metaTag?: MetaTag
}

export type CertificateTemplate = {
  id: string
  title: string
  template: string
  backgroundImage: string
  author: { id: string; name: string }
}
