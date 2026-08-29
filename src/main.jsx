import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './App.css'
// Ensure PrimeReact styles are loaded (imports theme and core css)
import './style.jsx'

// Force DaisyUI theme at runtime in case index.html changes weren't picked up
try {
    if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', 'cupcake')
    }
} catch (e) {
    // ignore in non-browser environments
}

ReactDOM.createRoot(document.getElementById('root')).render(
        <App />
)
