import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import Application from './Application'
import { unregister } from './serviceWorker'
import { hydrate, render } from 'react-dom'
import './styles/default/index.scss'

const rootElement = document.getElementById('root')
if (rootElement && rootElement.hasChildNodes()) {
  hydrate(<Application />, rootElement)
} else {
  render(<Application />, rootElement)
}

unregister()
