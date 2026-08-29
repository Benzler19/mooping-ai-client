import React, { useState } from "react"
import "./App.css"
import "./style"
import { HashRouter, Route, Switch } from "react-router-dom"
import Auth from "./components/auth/Auth"
import ThaiCalendar from "./components/customComponent/thai-calendar"
const Layout = React.lazy(() => import("./container/layout"))

ThaiCalendar()

function App() {
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
