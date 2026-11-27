import './style.css'
import { mountApp } from './render/app'

const app = document.querySelector<HTMLDivElement>('#app')
if (!app) throw new Error('#app missing')
mountApp(app)
