export type Module =
  | 'activity'
  | 'appointment'
  | 'approval'
  | 'blog'
  | 'coin'
  | 'contract'
  | 'coupon_scope'
  | 'currency'
  | 'invoice'
  | 'learning_statistics'
  | 'locale'
  | 'member_card'
  | 'merchandise'
  | 'podcast'
  | 'podcast_recording'
  | 'point'
  | 'program_package'
  | 'project'
  | 'qrcode'
  | 'search'
  | 'social_connect'
  | 'tempo_delivery'
  | 'voucher'
  | 'member_property'
  | 'member_note'

export type Currency = {
  name: string
  label: string
  unit: string
}

export type AppProps = {
  id: string
  name: string | null
  title: string | null
  description: string | null
  vimeoProjectId?: string | null
  enabledModules: {
    [key in Module]?: boolean
  }
  settings: {
    [key: string]: string
  }
  currencies: { [currencyId: string]: Currency }
}
