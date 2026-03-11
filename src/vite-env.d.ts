/// <reference types="vite/client" />

declare module '*.svg' {
  import type { FunctionComponent, SVGProps } from 'react'

  export const ReactComponent: FunctionComponent<SVGProps<SVGSVGElement>>
  const src: string
  export default src
}

interface ImportMetaEnv {
  readonly VITE_APP_ID?: string
  readonly VITE_API_BASE_ROOT: string
  readonly VITE_GRAPHQL_PH_ENDPOINT: string
  readonly VITE_GRAPHQL_RH_ENDPOINT: string
  readonly VITE_CLAIMS_NAMESPACE: string
  readonly VITE_GRAPHQL_WS_ENDPOINT: string
  readonly VITE_S3_BUCKET: string
  readonly VITE_KOLABLE_SERVER_ENDPOINT: string
  readonly VITE_LODESTAR_SERVER_ENDPOINT: string
  readonly VITE_BASE_PATH?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'react-styled-frame'
declare module '@bobthered/tailwindcss-palette-generator'
declare module 'audio-recorder-polyfill/mpeg-encoder'
declare module 'coupon-code'
declare module 'react-calendar-heatmap'
declare module 'react-social-login'
declare module 'react-snapshot'
declare module 'react-style-editor'
declare module 'console' {
  export = typeof import('console')
}
