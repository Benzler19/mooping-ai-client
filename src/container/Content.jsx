import React, { Suspense } from "react"
import { Route, Switch, useLocation, Redirect } from "react-router-dom"
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

/* หน้า Forbidden */
const Forbidden = () => (
  <motion.div className="flex flex-col items-center justify-center h-[70vh] gap-4"
    initial={{ opacity: 0, scale: .95 }} animate={{ opacity: 1, scale: 1 }}>
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
      <i className="pi pi-lock text-2xl text-red-400" />
    </div>
    <div className="text-center">
      <p className="text-lg font-black text-slate-700">ไม่มีสิทธิ์เข้าถึง</p>
      <p className="text-sm text-slate-400 mt-1">คุณไม่ได้รับอนุญาตให้ดูหน้านี้</p>
    </div>
    <Redirect to="/" />
  </motion.div>
)

const Content = ({ USER, PERMISSIONS }) => {
  const location = useLocation()

  const getPermission = (key) =>
    PERMISSIONS?.find(p => p.menu_name_en === key) || { permission_view: 0, permission_manage: 0 }

  const canView = (key) => {
    // home ทุกคนเข้าได้เสมอ
    if (key === "home") return true
    return getPermission(key)?.permission_view === 1
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <AnimatePresence mode="wait">
        <Switch location={location} key={location.pathname}>
          {routes.map((route) =>
            route.component ? (
              <Route key={route.path} path={route.path} exact={route.exact}
                render={(props) =>
                  canView(route.key) ? (
                    <PageWrapper>
                      <route.component {...props} SESSION={{ USER, PERMISSION: getPermission(route.key) }} />
                    </PageWrapper>
                  ) : (
                    <Forbidden />
                  )
                }
              />
            ) : null
          )}
        </Switch>
      </AnimatePresence>
    </Suspense>
  )
}

export default React.memo(Content)
