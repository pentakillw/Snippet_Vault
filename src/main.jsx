import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css' 

ReactDOM.createRoot(document.getElementById('root')).render(
  /* NOTA: Se ha eliminado <React.StrictMode> intencionalmente.
     Esto evita el error "operation is manually canceled" del editor Monaco
     causado por el doble montaje de componentes en desarrollo.
  */
  <App />
)