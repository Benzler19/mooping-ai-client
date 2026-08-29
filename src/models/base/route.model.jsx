import { BaseFetch } from "../main-model"

export default class RouteModel extends BaseFetch {
  getRouteBy      = (data) => this.authFetch({ url: "loan/route/getRouteBy",      method: "POST", body: JSON.stringify(data) })
  getRouteById    = (data) => this.authFetch({ url: "loan/route/getRouteById",    method: "POST", body: JSON.stringify(data) })
  insertRoute     = (data) => this.authFetch({ url: "loan/route/insertRoute",     method: "POST", body: JSON.stringify(data) })
  updateRouteById = (data) => this.authFetch({ url: "loan/route/updateRouteById", method: "POST", body: JSON.stringify(data) })
  deleteRouteById = (data) => this.authFetch({ url: "loan/route/deleteRouteById", method: "POST", body: JSON.stringify(data) })
}
