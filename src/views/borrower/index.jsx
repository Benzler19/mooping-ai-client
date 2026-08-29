import React from "react"
import { Switch, Route } from "react-router-dom"

const View   = React.lazy(() => import("./view"))
const Upsert = React.lazy(() => import("./upsert"))

export default function BorrowerIndex({ SESSION }) {
  return (
    <Switch>
      <Route path="/borrower/insert"      render={props => <Upsert {...props} SESSION={SESSION} />} />
      <Route path="/borrower/update/:id"  render={props => <Upsert {...props} SESSION={SESSION} />} />
      <Route path="/"                     render={props => <View   {...props} SESSION={SESSION} />} />
    </Switch>
  )
}
