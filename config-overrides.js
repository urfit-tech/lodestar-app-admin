const { override, fixBabelImports, addLessLoader, addWebpackAlias } = require('customize-cra')
const rewireReactHotLoader = require('react-app-rewire-hot-loader')

const themeVars = require(`./src/theme/default.json`)

module.exports = override(
  fixBabelImports(
    'import',
    {
      libraryName: 'antd',
      libraryDirectory: 'es',
      style: true,
    },
    'antd',
  ),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: themeVars,
  }),
  addWebpackAlias({
    'react-dom': '@hot-loader/react-dom',
  }),
  (config, env) => {
    config = rewireReactHotLoader(config, env)
    return config
  },
)
