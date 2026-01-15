import dotenvFlow from 'dotenv-flow'

// 明确加载 .env.development 文件
dotenvFlow.config({
  node_env: process.env.NODE_ENV || 'development',
  default_node_env: 'development',
})

import { CodegenConfig } from '@graphql-codegen/cli'

const schemaEndpoint = process.env.REACT_APP_GRAPHQL_PH_ENDPOINT

if (!schemaEndpoint) {
  throw new Error(
    'REACT_APP_GRAPHQL_PH_ENDPOINT environment variable is not set. Please check your .env file.'
  )
}

const config: CodegenConfig = {
  schema: schemaEndpoint,
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  generates: {
    './src/hasura.d.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        namingConvention: 'keep',
        omitOperationSuffix: true,
      },
    },
  },
  config: {
    headers: {
      'X-Hasura-Admin-Secret': process.env.HDB_ADMIN_SECRET || '',
    },
  },
  verbose: true,
}

export default config
