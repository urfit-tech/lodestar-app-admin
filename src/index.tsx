import React from 'react'
import { render } from 'react-dom'
import App from './Application'
import './styles/default/index.scss'

const rootElement = document.getElementById('root')
const appId: string = import.meta.env.VITE_APP_ID || process.env.REACT_APP_ID || (window as any).APP_ID

if (!appId) {
  render(<div>Application cannot be loaded</div>, rootElement)
} else {
  render(<App appId={appId} />, rootElement)
}
