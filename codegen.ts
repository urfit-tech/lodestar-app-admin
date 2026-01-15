import { CodegenConfig } from '@graphql-codegen/cli'
require('dotenv-flow').config()

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
