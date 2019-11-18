import React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { render } from 'react-snapshot'
import Application from './Application'
import { unregister } from './serviceWorker'
import './styles/default/index.scss'

render(
  <BrowserRouter>
    <Application />
  </BrowserRouter>,
  document.getElementById('root'),
)

unregister()
