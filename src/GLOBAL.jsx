const PRIMARY_URL = import.meta.env.VITE_APP_SERVER_URL

const GLOBAL = {
  BASE_SERVER: {
    get URL() {
      const url = PRIMARY_URL || 'http://127.0.0.1:3000'
      return url.endsWith('/') ? url : `${url}/`
    }
  }
}

export default GLOBAL
