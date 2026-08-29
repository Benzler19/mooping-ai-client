import { BaseFetch } from "../main-model"

export default class ReportModel extends BaseFetch {
  getSummary      = (data) => this.authFetch({ url: "shop/report/getSummary",     method: "POST", body: JSON.stringify(data) })
  getDailySales   = (data) => this.authFetch({ url: "shop/report/getDailySales",  method: "POST", body: JSON.stringify(data) })
  getTopProducts  = (data) => this.authFetch({ url: "shop/report/getTopProducts", method: "POST", body: JSON.stringify(data) })
  getDashboard    = (data) => this.authFetch({ url: "shop/report/getDashboard",   method: "POST", body: JSON.stringify(data) })
}
