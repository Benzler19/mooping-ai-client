import React from "react"

const routes = [
  { path: "/",           key: "home",       exact: true,  component: React.lazy(() => import("./views/dashboard"))  },
  { path: "/sale",       key: "sale",       exact: false, component: React.lazy(() => import("./views/sale"))       },
  { path: "/product",    key: "product",    exact: false, component: React.lazy(() => import("./views/product"))    },
  { path: "/ingredient", key: "ingredient", exact: false, component: React.lazy(() => import("./views/ingredient")) },
  { path: "/purchase",   key: "purchase",   exact: false, component: React.lazy(() => import("./views/purchase"))   },
  { path: "/expense",    key: "expense",    exact: false, component: React.lazy(() => import("./views/expense"))    },
  { path: "/report",     key: "report",     exact: false, component: React.lazy(() => import("./views/report"))     },
  { path: "/user",       key: "user",       exact: false, component: React.lazy(() => import("./views/user"))       },
]

export default routes
