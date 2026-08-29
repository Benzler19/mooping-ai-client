import React from "react"

const routes = [
  { path: "/",           key: "home",       exact: true,  component: React.lazy(() => import("./views/dashboard"))  },
  { path: "/route",      key: "route",      exact: false, component: React.lazy(() => import("./views/route"))      },
  { path: "/borrower",   key: "borrower",   exact: false, component: React.lazy(() => import("./views/borrower"))   },
  { path: "/trip",       key: "trip",       exact: false, component: React.lazy(() => import("./views/trip"))       },
  { path: "/verify",     key: "verify",     exact: false, component: React.lazy(() => import("./views/verify"))     },
  { path: "/permission", key: "permission", exact: false, component: React.lazy(() => import("./views/permission")) },
  { path: "/user",       key: "user",       exact: false, component: React.lazy(() => import("./views/user"))       },
]

export default routes
