import { BaseFetch } from "../main-model"

export default class PurchaseModel extends BaseFetch {
  getPurchaseBy      = (data) => this.authFetch({ url: "shop/purchase/getPurchaseBy",      method: "POST", body: JSON.stringify(data) })
  getPurchaseById    = (data) => this.authFetch({ url: "shop/purchase/getPurchaseById",    method: "POST", body: JSON.stringify(data) })
  insertPurchase     = (data) => this.authFetch({ url: "shop/purchase/insertPurchase",     method: "POST", body: JSON.stringify(data) })
  deletePurchaseById = (data) => this.authFetch({ url: "shop/purchase/deletePurchaseById", method: "POST", body: JSON.stringify(data) })
}
