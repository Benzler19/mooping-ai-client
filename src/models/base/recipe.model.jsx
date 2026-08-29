import { BaseFetch } from "../main-model"

export default class RecipeModel extends BaseFetch {
  getRecipeByProduct = (data) => this.authFetch({ url: "shop/recipe/getRecipeByProduct", method: "POST", body: JSON.stringify(data) })
  saveRecipe         = (data) => this.authFetch({ url: "shop/recipe/saveRecipe",         method: "POST", body: JSON.stringify(data) })
}
