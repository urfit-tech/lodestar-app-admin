import React from 'react'
import { render } from 'react-dom'
import Application from './Application'
import { unregister } from './serviceWorker'
import './styles/default/index.scss'

const rootElement = document.getElementById('root')
render(<Application />, rootElement)

unregister()
