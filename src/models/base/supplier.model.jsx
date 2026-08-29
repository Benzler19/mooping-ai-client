import { BaseFetch } from "../main-model"

export default class SupplierModel extends BaseFetch {
  getSupplierBy      = (data) => this.authFetch({ url: "shop/supplier/getSupplierBy",      method: "POST", body: JSON.stringify(data) })
  insertSupplier     = (data) => this.authFetch({ url: "shop/supplier/insertSupplier",     method: "POST", body: JSON.stringify(data) })
  updateSupplierById = (data) => this.authFetch({ url: "shop/supplier/updateSupplierById", method: "POST", body: JSON.stringify(data) })
  deleteSupplierById = (data) => this.authFetch({ url: "shop/supplier/deleteSupplierById", method: "POST", body: JSON.stringify(data) })
}
