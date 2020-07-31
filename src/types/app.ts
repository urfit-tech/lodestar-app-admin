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
  | 'podcast'
  | 'podcast_recording'
  | 'point'
  | 'program_package'
  | 'project'
  | 'qrcode'
  | 'social_connect'
  | 'tempo_delivery'
  | 'voucher'

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
  secrets?: {
    [key: string]: string
  }
}
