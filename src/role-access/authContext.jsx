import { createContext } from "react"

const authContext = createContext({
  authcertifying: true,
  authenticated: false,
  user: {},
  _handleLogin: () => { },
  _handleLogout: () => { },
  _initiateAuthentication: () => { },
})

export const AuthProvider = authContext.Provider
export const AuthConsumer = authContext.Consumer
