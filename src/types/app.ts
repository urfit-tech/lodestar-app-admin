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
  | 'member_note'
  | 'member_property'
  | 'member_task'
  | 'merchandise'
  | 'merchandise_customization'
  | 'permission'
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
  | 'merchandise_customization'

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
