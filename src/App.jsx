import React, { useState } from "react"
import "./App.css"
import "./style"
import { HashRouter, Route, Switch } from "react-router-dom"
import Auth from "./components/auth/Auth"
const Layout = React.lazy(() => import("./container/layout"))

function App() {
  const [count, setCount] = useState(0)

  return (
    <Auth>
      <HashRouter>
        <React.Suspense>
          <Switch>
            <Route path="/" name="หน้าแรก" render={(props) => <Layout {...props} />} />
          </Switch>
        </React.Suspense>
      </HashRouter>
    </Auth>
  )
}

export default App
