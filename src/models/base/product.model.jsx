import { BaseFetch } from "../main-model"

export default class ProductModel extends BaseFetch {
  getProductBy      = (data) => this.authFetch({ url: "shop/product/getProductBy",      method: "POST", body: JSON.stringify(data) })
  getProductById    = (data) => this.authFetch({ url: "shop/product/getProductById",    method: "POST", body: JSON.stringify(data) })
  getProductForSale = (data) => this.authFetch({ url: "shop/product/getProductForSale", method: "POST", body: JSON.stringify(data) })
  insertProduct     = (data) => this.authFetch({ url: "shop/product/insertProduct",     method: "POST", body: JSON.stringify(data) })
  updateProductById = (data) => this.authFetch({ url: "shop/product/updateProductById", method: "POST", body: JSON.stringify(data) })
  deleteProductById = (data) => this.authFetch({ url: "shop/product/deleteProductById", method: "POST", body: JSON.stringify(data) })
}
