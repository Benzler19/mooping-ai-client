import React from "react"
import { Switch, Route } from "react-router-dom"

const View   = React.lazy(() => import("./view"))
const Upsert = React.lazy(() => import("./upsert"))
const Recipe = React.lazy(() => import("./recipe"))

export default function ProductIndex({ SESSION }) {
  return (
    <Switch>
      <Route path="/product/insert"      render={props => <Upsert {...props} SESSION={SESSION} />} />
      <Route path="/product/update/:id"  render={props => <Upsert {...props} SESSION={SESSION} />} />
      <Route path="/product/recipe/:id"  render={props => <Recipe {...props} SESSION={SESSION} />} />
      <Route path="/"                    render={props => <View   {...props} SESSION={SESSION} />} />
    </Switch>
  )
}
