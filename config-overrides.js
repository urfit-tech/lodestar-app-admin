const { removeModuleScopePlugin, override, babelInclude, fixBabelImports, addLessLoader } = require('customize-cra')
const rewireReactHotLoader = require('react-app-rewire-hot-loader')
const path = require('path')
const themeVars = require(`lodestar-app-admin/src/theme/default.json`)

module.exports = override(
  removeModuleScopePlugin(), // (1)
  babelInclude([
    path.resolve('src'),
    path.resolve('node_modules/lodestar-app-admin/src'), // (2)
    path.resolve('node_modules/lodestar-app-element/src')
  ]),
  fixBabelImports('import', {
    libraryName: 'antd',
    libraryDirectory: 'es',
    style: true,
  }),
  addLessLoader({
    lessOptions: {
      javascriptEnabled: true,
      modifyVars: themeVars,
    },
  }),
  (config, env) => {
    config = rewireReactHotLoader(config, env)
    return config
  },
)
