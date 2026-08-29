import { BaseFetch } from "../main-model"

export default class IngredientModel extends BaseFetch {
  getIngredientBy        = (data) => this.authFetch({ url: "shop/ingredient/getIngredientBy",        method: "POST", body: JSON.stringify(data) })
  getIngredientById      = (data) => this.authFetch({ url: "shop/ingredient/getIngredientById",      method: "POST", body: JSON.stringify(data) })
  getIngredientForRecipe = (data) => this.authFetch({ url: "shop/ingredient/getIngredientForRecipe", method: "POST", body: JSON.stringify(data) })
  getLowStock            = (data) => this.authFetch({ url: "shop/ingredient/getLowStock",            method: "POST", body: JSON.stringify(data) })
  insertIngredient       = (data) => this.authFetch({ url: "shop/ingredient/insertIngredient",       method: "POST", body: JSON.stringify(data) })
  updateIngredientById   = (data) => this.authFetch({ url: "shop/ingredient/updateIngredientById",   method: "POST", body: JSON.stringify(data) })
  adjustStock            = (data) => this.authFetch({ url: "shop/ingredient/adjustStock",            method: "POST", body: JSON.stringify(data) })
  deleteIngredientById   = (data) => this.authFetch({ url: "shop/ingredient/deleteIngredientById",   method: "POST", body: JSON.stringify(data) })
}
