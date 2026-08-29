import { BaseFetch } from "../main-model"

export default class ExpenseCategoryModel extends BaseFetch {
  getExpenseCategoryBy      = (data) => this.authFetch({ url: "shop/expenseCategory/getExpenseCategoryBy",      method: "POST", body: JSON.stringify(data) })
  insertExpenseCategory     = (data) => this.authFetch({ url: "shop/expenseCategory/insertExpenseCategory",     method: "POST", body: JSON.stringify(data) })
  deleteExpenseCategoryById = (data) => this.authFetch({ url: "shop/expenseCategory/deleteExpenseCategoryById", method: "POST", body: JSON.stringify(data) })
}
