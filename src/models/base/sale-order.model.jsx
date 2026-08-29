import { BaseFetch } from "../main-model"

export default class SaleOrderModel extends BaseFetch {
  getSaleOrderBy          = (data) => this.authFetch({ url: "shop/sale/getSaleOrderBy",          method: "POST", body: JSON.stringify(data) })
  getSaleOrderWithDetails = (data) => this.authFetch({ url: "shop/sale/getSaleOrderWithDetails", method: "POST", body: JSON.stringify(data) })
  insertSaleOrder         = (data) => this.authFetch({ url: "shop/sale/insertSaleOrder",         method: "POST", body: JSON.stringify(data) })
  cancelSaleOrder         = (data) => this.authFetch({ url: "shop/sale/cancelSaleOrder",         method: "POST", body: JSON.stringify(data) })
}
