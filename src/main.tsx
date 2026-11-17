import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { useStore } from './lib/store'
import { isPinnedWindow } from './lib/pin'

// Keep <html data-theme> in sync with the saved theme (applied before first paint)
const applyTheme = () => {
  document.documentElement.dataset.theme = useStore.getState().theme
}
applyTheme()
// The pinned window is resizable, so let the layout fill it instead of the fixed popup size
if (isPinnedWindow) document.documentElement.classList.add('pinned')
useStore.subscribe(applyTheme)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
