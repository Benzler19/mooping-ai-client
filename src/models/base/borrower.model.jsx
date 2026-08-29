import { BaseFetch } from "../main-model"

export default class BorrowerModel extends BaseFetch {
  getBorrowerBy      = (data) => this.authFetch({ url: "loan/borrower/getBorrowerBy",      method: "POST", body: JSON.stringify(data) })
  getBorrowerById    = (data) => this.authFetch({ url: "loan/borrower/getBorrowerById",    method: "POST", body: JSON.stringify(data) })
  insertBorrower     = (data) => this.authFetch({ url: "loan/borrower/insertBorrower",     method: "POST", body: JSON.stringify(data) })
  updateBorrowerById = (data) => this.authFetch({ url: "loan/borrower/updateBorrowerById", method: "POST", body: JSON.stringify(data) })
  deleteBorrowerById   = (data) => this.authFetch({ url: "loan/borrower/deleteBorrowerById",   method: "POST", body: JSON.stringify(data) })
  getBorrowerByRoute = (data) => this.authFetch({ url: "loan/borrower/getBorrowerByRoute", method: "POST", body: JSON.stringify(data) })
}
