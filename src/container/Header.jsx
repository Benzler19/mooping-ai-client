import React, { useState, useEffect } from "react"
import { AuthConsumer } from "../role-access/authContext"

function Header({ handleSidebarToggle }) {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const dateStr = time.toLocaleDateString("th-TH", { year: "numeric", month: "long", day: "numeric" })
  const timeStr = time.toLocaleTimeString("th-TH", { hour12: false })

  return (
    <header
      className="app-header fixed top-0 right-0 z-[8] flex items-center justify-between px-4 md:px-6 bg-white border-b"
      style={{ height: "var(--header-h)", borderColor: "var(--border)" }}>

      {/* Hamburger — mobile */}
      <button className="xl:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors"
        onClick={handleSidebarToggle}>
        <i className="pi pi-bars text-slate-600" />
      </button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Date/Time */}
        <div className="hidden sm:flex items-center gap-3 text-right">
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">วันที่</div>
            <div className="text-xs font-semibold text-slate-700">{dateStr}</div>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest leading-none mb-0.5">เวลา</div>
            <div className="text-base font-mono font-bold text-orange-600">{timeStr}</div>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-200 hidden sm:block" />

        {/* User avatar */}
        <AuthConsumer>
          {({ user }) => (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-orange-700 flex items-center justify-center text-white text-xs font-bold select-none">
                {user?.full_name?.[0] || "A"}
              </div>
              <div className="hidden md:block">
                <div className="text-xs font-semibold text-slate-700 leading-none">{user?.full_name}</div>
                <div className="text-[10px] text-slate-400 mt-0.5">@{user?.username}</div>
              </div>
            </div>
          )}
        </AuthConsumer>
      </div>
    </header>
  )
}

export default Header
