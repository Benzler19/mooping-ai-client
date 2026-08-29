import { BaseFetch } from "../main-model"

export default class DailyTripModel extends BaseFetch {
  getTripBy          = (data) => this.authFetch({ url: "loan/trip/getTripBy",          method: "POST", body: JSON.stringify(data) })
  getTripById        = (data) => this.authFetch({ url: "loan/trip/getTripById",        method: "POST", body: JSON.stringify(data) })
  getTripWithDetails = (data) => this.authFetch({ url: "loan/trip/getTripWithDetails", method: "POST", body: JSON.stringify(data) })
  insertTrip         = (data) => this.authFetch({ url: "loan/trip/insertTrip",         method: "POST", body: JSON.stringify(data) })
  updateTripById     = (data) => this.authFetch({ url: "loan/trip/updateTripById",     method: "POST", body: JSON.stringify(data) })
  submitTrip         = (data) => this.authFetch({ url: "loan/trip/submitTrip",         method: "POST", body: JSON.stringify(data) })
  verifyTrip         = (data) => this.authFetch({ url: "loan/trip/verifyTrip",         method: "POST", body: JSON.stringify(data) })
  deleteTripById         = (data) => this.authFetch({ url: "loan/trip/deleteTripById",         method: "POST", body: JSON.stringify(data) })
  getTodayTripByRoute  = (data) => this.authFetch({ url: "loan/trip/getTodayTripByRoute",   method: "POST", body: JSON.stringify(data) })
}
