import React from "react"
import { Switch, Route } from "react-router-dom"

const View = React.lazy(() => import("./view"))

export default function TripIndex({ SESSION }) {
  return (
    <Switch>
      <Route path="/" render={props => <View {...props} SESSION={SESSION} />} />
    </Switch>
  )
}
