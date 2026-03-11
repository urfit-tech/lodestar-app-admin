import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import themeVars from './src/theme/default.json'

const legacyEnvKeys = [
  'REACT_APP_ID',
  'REACT_APP_API_BASE_ROOT',
  'REACT_APP_GRAPHQL_PH_ENDPOINT',
  'REACT_APP_GRAPHQL_RH_ENDPOINT',
  'REACT_APP_CLAIMS_NAMESPACE',
  'REACT_APP_GRAPHQL_WS_ENDPOINT',
  'REACT_APP_S3_BUCKET',
  'REACT_APP_KOLABLE_SERVER_ENDPOINT',
  'REACT_APP_LODESTAR_SERVER_ENDPOINT',
]

const normalizeBasePath = (value: string | undefined) => {
  const normalized = `/${(value || '/admin/').trim().replace(/^\/+|\/+$/g, '')}/`.replace(/\/+/g, '/')
  return normalized === '//' ? '/' : normalized
}

const svgReactImportPattern =
  /import\s*{\s*ReactComponent\s+as\s+([A-Za-z_$][\w$]*)\s*}\s*from\s*(['"])([^'"]+\.svg)\2/g
const svgReactExportPattern = /export\s*{\s*([^}]*ReactComponent\s+as[^}]*)\s*}\s*from\s*(['"])([^'"]+\.svg)\2/g

const svgReactCompatPlugin = (): Plugin => ({
  name: 'svg-react-compat',
  enforce: 'pre',
  transform(code, id) {
    if (
      !/\.[jt]sx?$/.test(id) ||
      (!id.includes('/src/') && !id.includes('/node_modules/lodestar-app-element/src/')) ||
      !code.includes('ReactComponent as')
    ) {
      return null
    }

    const rewrittenImports = code.replace(svgReactImportPattern, (_match, componentName, quote, source) => {
      return `import ${componentName} from ${quote}${source}?react${quote}`
    })

    const rewrittenCode = rewrittenImports.replace(svgReactExportPattern, (_match, specifiers, quote, source) => {
      const rewrittenSpecifiers = specifiers.replace(/ReactComponent\s+as\s+/g, 'default as ')
      return `export { ${rewrittenSpecifiers} } from ${quote}${source}?react${quote}`
    })

    if (rewrittenCode === code) {
      return null
    }

    return rewrittenCode
  },
})

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const base = normalizeBasePath(env.VITE_BASE_PATH)
  const publicUrl = base === '/' ? '' : base.replace(/\/$/, '')

  const legacyEnvDefinitions = legacyEnvKeys.reduce<Record<string, string>>((result, legacyKey) => {
    const viteKey = legacyKey.replace('REACT_APP_', 'VITE_')
    result[`process.env.${legacyKey}`] = JSON.stringify(env[viteKey] || '')
    return result
  }, {})

  return {
    base,
    plugins: [
      svgReactCompatPlugin(),
      react({
        include: [
          /\.[jt]sx?$/,
          /node_modules\/lodestar-app-element\/src\/.*\.[jt]sx?$/,
        ],
      }),
      svgr(),
    ].filter(Boolean),
    define: {
      ...legacyEnvDefinitions,
      'process.env.NODE_ENV': JSON.stringify(command === 'serve' ? 'development' : 'production'),
      'process.env.PUBLIC_URL': JSON.stringify(publicUrl),
    },
    resolve: {
      dedupe: ['react', 'react-dom', 'styled-components', 'react-is'],
      alias: [
        {
          find: /^styled-components$/,
          replacement: fileURLToPath(new URL('./node_modules/styled-components', import.meta.url)),
        },
        {
          find: /^jsonwebtoken$/,
          replacement: fileURLToPath(new URL('./src/shims/jsonwebtoken.ts', import.meta.url)),
        },
        {
          find: /^ajv$/,
          replacement: fileURLToPath(new URL('./src/shims/ajv.ts', import.meta.url)),
        },
        {
          find: /^@bobthered\/tailwindcss-palette-generator$/,
          replacement: fileURLToPath(new URL('./src/shims/tailwindPaletteGenerator.ts', import.meta.url)),
        },
        {
          find: /^moment$/,
          replacement: fileURLToPath(new URL('./src/shims/moment.ts', import.meta.url)),
        },
      ],
    },
    css: {
      preprocessorOptions: {
        less: {
          javascriptEnabled: true,
          modifyVars: themeVars,
        },
      },
    },
    optimizeDeps: {
      include: ['react-ga > prop-types'],
    },
    server: {
      open: base,
    },
    test: {
      css: true,
      environment: 'jsdom',
      globals: true,
    },
  }
})
