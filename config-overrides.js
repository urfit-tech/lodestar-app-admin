const { override, fixBabelImports, addLessLoader, removeModuleScopePlugin, babelInclude } = require('customize-cra')
const rewireReactHotLoader = require('react-app-rewire-hot-loader')
const path = require('path')
const webpack = require('webpack')
const themeVars = require(`./src/theme/default.json`)

module.exports = override(
  removeModuleScopePlugin(),
  babelInclude([path.resolve('src'), path.resolve('node_modules/lodestar-app-element/src')]),
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
    // Include relative imports inside element so every consumer shares one auth context.
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(/AuthContext$/, resource => {
        if (resource.request.includes('lodestar-app-element/') || resource.context.includes('lodestar-app-element')) {
          resource.request = path.resolve(__dirname, 'src/contexts/AuthContext.tsx')
        }
      }),
    )
    config = rewireReactHotLoader(config, env)
    return config
  },
)
