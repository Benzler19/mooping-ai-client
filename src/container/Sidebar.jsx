import React from "react"
import { Link, useHistory, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import accessMenu from "./menu"

function Sidebar({ mobileOpen, handleSidebarToggle }) {
  const { menuItems } = accessMenu()
  const history = useHistory()
  const location = useLocation()

  const isActive = (to) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to)

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 z-[9] xl:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleSidebarToggle}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — off-canvas drawer on phone/tablet, always visible from xl (desktop) up */}
      <aside
        className={`fixed top-0 left-0 h-screen z-[10] flex flex-col transition-transform duration-300 ease-out xl:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{ width: "var(--sidebar-w)", background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
      >
        {/* Logo */}
        <Link to="/" className="sidebar-border flex flex-col items-center justify-center py-6 border-b shrink-0">
          <motion.div
            initial={{ opacity: 0, scale: .8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: .5 }}
            className="flex flex-col items-center">
            <div className="text-3xl">🍢</div>
            <div className="sidebar-brand text-2xl font-black tracking-tighter -mt-1">หมูปิ้ง</div>
            <div className="text-xs font-semibold text-orange-400 tracking-[.35em] text-center mt-0.5">SHOP</div>
          </motion.div>
        </Link>

        {/* Menu */}
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {menuItems?.map((item, i) => (
            <motion.div
              key={item.to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => { history.push(item.to); if (mobileOpen) handleSidebarToggle() }}
              className={`sidebar-item flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mb-1 ${isActive(item.to) ? "active" : ""}`}
            >
              <i className={`${item.icon} text-sm w-4 text-center`} />
              <span className="text-sm font-medium">{item.name}</span>
              {isActive(item.to) && (
                <motion.div layoutId="pill"
                  className="ml-auto w-1.5 h-4 rounded-full bg-orange-400"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} />
              )}
            </motion.div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-border shrink-0 border-t px-4 py-4">
          <button
            className="sidebar-footer-btn w-full flex items-center gap-3 px-2"
            onClick={() => { localStorage.clear(); window.location.reload() }}>
            <i className="pi pi-sign-out text-sm" />
            <span className="text-sm font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
