import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useHistory } from "react-router-dom"
import { DailyTripModel, BorrowerModel } from "../../models"

const tripModel = new DailyTripModel()
const borModel  = new BorrowerModel()
const today = () => new Date().toISOString().slice(0, 10)
const fmt   = (v) => (Number(v) || 0).toLocaleString()

const StatCard = ({ icon, label, value, sub, color, delay, onClick }) => (
  <motion.div className={`card card-hover p-5 ${onClick ? "cursor-pointer" : ""}`}
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    onClick={onClick}
    whileHover={onClick ? { scale: 1.02 } : {}}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-3xl font-black mt-1 text-slate-900">{value}</p>
        {sub && <p className="text-xs mt-1.5 text-slate-400">{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <i className={`${icon} text-lg`} style={{ color }} />
      </div>
    </div>
  </motion.div>
)

export default function Dashboard({ SESSION }) {
  const user    = SESSION?.USER
  const history = useHistory()
  const [stats, setStats]   = useState({ borrowers: 0, todayTrips: 0, submitted: 0, verified: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const [b, t] = await Promise.all([
        borModel.getBorrowerBy({ params: {} }),
        tripModel.getTripBy({ params: { filters: { trip_date: today() } } }),
      ])
      const trips = t.data || []
      setStats({
        borrowers: b.data?.length || 0,
        todayTrips: trips.length,
        submitted: trips.filter(x => x.status === "submitted").length,
        verified:  trips.filter(x => x.status === "verified").length,
      })
      setLoading(false)
    }
    load()
  }, [])

  const isCollector = !!user?.route_id

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      {/* Welcome */}
      <motion.div className="mb-6"
        initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-black text-slate-900">
          สวัสดี, {user?.firstname} 👋
        </h1>
        <p className="text-sm mt-0.5 text-slate-500">
          {isCollector
            ? `คุณรับผิดชอบสาย ${user.route_code} — ${user.route_name}`
            : "G-Cash Flow — ภาพรวมระบบ"}
        </p>
      </motion.div>

      {/* Stats */}
      {!isCollector && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard icon="pi pi-users"     label="ผู้กู้ทั้งหมด"   value={loading ? "..." : fmt(stats.borrowers)}  sub="ทุกสาย"          color="#3b82f6" delay={0.05} onClick={() => history.push("/borrower")} />
          <StatCard icon="pi pi-wallet"    label="Trip วันนี้"      value={loading ? "..." : stats.todayTrips}      sub="ทุกสาย"          color="#f59e0b" delay={0.10} onClick={() => history.push("/verify")} />
          <StatCard icon="pi pi-send"      label="รอตรวจสอบ"        value={loading ? "..." : stats.submitted}       sub="กดเพื่อตรวจสอบ" color="#ef4444" delay={0.15} onClick={() => history.push("/verify")} />
          <StatCard icon="pi pi-check-circle" label="ตรวจแล้ววันนี้" value={loading ? "..." : stats.verified}     sub="สำเร็จ"          color="#10b981" delay={0.20} />
        </div>
      )}

      {/* Quick actions */}
      <motion.div className="card p-5"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-sm font-bold text-slate-500 mb-4">เมนูด่วน</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(isCollector
            ? [
                { icon: "pi pi-wallet",       label: "เก็บเงินวันนี้",  to: "/trip",     color: "#3b82f6" },
              ]
            : [
                { icon: "pi pi-map",          label: "จัดการสาย",      to: "/route",    color: "#3b82f6" },
                { icon: "pi pi-users",        label: "ผู้กู้เงิน",     to: "/borrower", color: "#10b981" },
                { icon: "pi pi-check-circle", label: "ตรวจสอบยอด",     to: "/verify",   color: "#f59e0b" },
                { icon: "pi pi-user",         label: "ผู้ใช้งาน",      to: "/user",     color: "#6366f1" },
              ]
          ).map((item) => (
            <motion.div key={item.to}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer border border-slate-200 hover:border-slate-300 transition-colors"
              onClick={() => history.push(item.to)}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: `${item.color}18` }}>
                <i className={`${item.icon} text-base`} style={{ color: item.color }} />
              </div>
              <span className="text-xs font-semibold text-center text-slate-600">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
