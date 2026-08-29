import { BaseFetch } from "../main-model"

export default class CollectionDetailModel extends BaseFetch {
  getCollectionByTrip    = (data) => this.authFetch({ url: "loan/collection/getCollectionByTrip",    method: "POST", body: JSON.stringify(data) })
  saveCollection         = (data) => this.authFetch({ url: "loan/collection/saveCollection",         method: "POST", body: JSON.stringify(data) })
  deleteCollectionByTrip = (data) => this.authFetch({ url: "loan/collection/deleteCollectionByTrip", method: "POST", body: JSON.stringify(data) })
}
