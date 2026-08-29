import { BaseFetch } from "../main-model"

export default class CategoryModel extends BaseFetch {
  getCategoryBy      = (data) => this.authFetch({ url: "shop/category/getCategoryBy",      method: "POST", body: JSON.stringify(data) })
  getCategoryById    = (data) => this.authFetch({ url: "shop/category/getCategoryById",    method: "POST", body: JSON.stringify(data) })
  insertCategory     = (data) => this.authFetch({ url: "shop/category/insertCategory",     method: "POST", body: JSON.stringify(data) })
  updateCategoryById = (data) => this.authFetch({ url: "shop/category/updateCategoryById", method: "POST", body: JSON.stringify(data) })
  deleteCategoryById = (data) => this.authFetch({ url: "shop/category/deleteCategoryById", method: "POST", body: JSON.stringify(data) })
}
