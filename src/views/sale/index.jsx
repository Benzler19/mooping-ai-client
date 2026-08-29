import React from "react"
import { Switch, Route } from "react-router-dom"

const Pos     = React.lazy(() => import("./pos"))
const History = React.lazy(() => import("./history"))

export default function SaleIndex({ SESSION }) {
  return (
    <Switch>
      <Route path="/sale/history" render={props => <History {...props} SESSION={SESSION} />} />
      <Route path="/"             render={props => <Pos     {...props} SESSION={SESSION} />} />
    </Switch>
  )
}
