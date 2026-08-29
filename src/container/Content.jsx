import React, { Suspense } from "react"
import { Route, Switch, useLocation } from "react-router-dom"
import { AnimatePresence, motion } from "framer-motion"
import routes from "../routes"

const PageLoader = () => (
  <div className="p-6 space-y-4">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="skeleton h-16 w-full" style={{ animationDelay: `${i * 0.1}s` }} />
    ))}
  </div>
)

const PageWrapper = ({ children }) => (
  <motion.div
    className="page-enter"
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.28, ease: "easeOut" }}>
    {children}
  </motion.div>
)

const Content = ({ USER, handleLogout }) => {
  const location = useLocation()

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Switch location={location} key={location.pathname}>
          {routes.map((route) =>
            route.component ? (
              <Route key={route.path} path={route.path} exact={route.exact}
                render={(props) => (
                  <PageWrapper>
                    <route.component {...props} SESSION={{ USER, handleLogout }} />
                  </PageWrapper>
                )}
              />
            ) : null
          )}
        </Switch>
      </AnimatePresence>
    </Suspense>
  )
}

export default React.memo(Content)
