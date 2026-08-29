import React from "react"
import { Switch, Route } from "react-router-dom"

const View   = React.lazy(() => import("./view"))
const Upsert = React.lazy(() => import("./upsert"))

export default function RouteIndex({ SESSION }) {
  return (
    <Switch>
      <Route path="/route/insert"       render={props => <Upsert {...props} SESSION={SESSION} />} />
      <Route path="/route/update/:id"   render={props => <Upsert {...props} SESSION={SESSION} />} />
      <Route path="/"                   render={props => <View   {...props} SESSION={SESSION} />} />
    </Switch>
  )
}
