export type Module =
  | 'activity'
  | 'appointment'
  | 'blog'
  | 'coupon_scope'
  | 'invoice'
  | 'learning_statistics'
  | 'locale'
  | 'member_card'
  | 'merchandise'
  | 'point'
  | 'podcast'
  | 'podcast_recording'
  | 'program_package'
  | 'project'
  | 'qrcode'
  | 'social_connect'
  | 'tempo_delivery'
  | 'voucher'
  | 'coin'
  | 'currency'

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
