export type Module =
  | 'activity'
  | 'activity_online'
  | 'appointment'
  | 'approval'
  | 'attend'
  | 'blog'
  | 'coin'
  | 'contract'
  | 'coupon_scope'
  | 'creator_display'
  | 'currency'
  | 'customer_review'
  | 'exercise'
  | 'invoice'
  | 'learning_statistics'
  | 'learning_statistics_advanced'
  | 'locale'
  | 'member_assignment'
  | 'member_card'
  | 'member_note'
  | 'member_note_demo'
  | 'member_property'
  | 'member_rejection'
  | 'member_task'
  | 'merchandise'
  | 'merchandise_customization'
  | 'merchandise_virtualness'
  | 'order_contact'
  | 'permission'
  | 'podcast'
  | 'podcast_recording'
  | 'point'
  | 'practice'
  | 'private_appointment_plan'
  | 'program_content_material'
  | 'program_package'
  | 'project'
  | 'qrcode'
  | 'referrer'
  | 'search'
  | 'sharing_code'
  | 'sms_verification'
  | 'social_connect'
  | 'tempo_delivery'
  | 'voucher'
  | 'xuemi_pt'
  | 'group_buying'
  | 'craft_page'
  | 'sku'

export type Currency = {
  name: string
  label: string
  unit: string
}

export type AppProps = {
  id: string
  host: string
  hosts: string[]
  name: string | null
  title: string | null
  description: string | null
  vimeoProjectId?: string | null
  enabledModules: {
    [key in Module]?: boolean
  }
  settings: Record<string, string>
  secrets: Record<string, string>
  currencies: { [currencyId: string]: Currency }
  locales: { [locale: string]: Record<string, string> }
  navs: {
    block: 'header' | 'footer' | 'social_media'
    label: string
    href: string
    external: boolean
    tag: string | null
    position: number
  }[]
}
