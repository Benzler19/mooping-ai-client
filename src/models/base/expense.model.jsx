import { BaseFetch } from "../main-model"

export default class ExpenseModel extends BaseFetch {
  getExpenseBy      = (data) => this.authFetch({ url: "shop/expense/getExpenseBy",      method: "POST", body: JSON.stringify(data) })
  getExpenseById    = (data) => this.authFetch({ url: "shop/expense/getExpenseById",    method: "POST", body: JSON.stringify(data) })
  insertExpense     = (data) => this.authFetch({ url: "shop/expense/insertExpense",     method: "POST", body: JSON.stringify(data) })
  updateExpenseById = (data) => this.authFetch({ url: "shop/expense/updateExpenseById", method: "POST", body: JSON.stringify(data) })
  deleteExpenseById = (data) => this.authFetch({ url: "shop/expense/deleteExpenseById", method: "POST", body: JSON.stringify(data) })
}
