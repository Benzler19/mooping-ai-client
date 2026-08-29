import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useHistory } from "react-router-dom"
import { ReportModel } from "../../models"
import { EmptyState } from "../../components/customComponent"

const model = new ReportModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
const today = () => new Date().toISOString().slice(0, 10)

const StatCard = ({ icon, label, value, sub, color, delay, onClick }) => (
  <motion.div className={`card card-hover p-5 ${onClick ? "cursor-pointer" : ""}`}
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    onClick={onClick}
    whileHover={onClick ? { scale: 1.02 } : {}}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-black mt-1 text-slate-900">{value}</p>
        {sub && <p className="text-xs mt-1.5 text-slate-400">{sub}</p>}
      </div>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <i className={`${icon} text-lg`} style={{ color }} />
      </div>
    </div>
  </motion.div>
)

export default function Dashboard({ SESSION }) {
  const user = SESSION?.USER
  const history = useHistory()
  const [dash, setDash] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const res = await model.getDashboard({ date_from: today(), date_to: today() })
      setDash(res.data)
      setLoading(false)
    }
    load()
  }, [])

  const s = dash?.summary || {}

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <motion.div className="mb-6" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-2xl font-black text-slate-900">สวัสดี, {user?.full_name || user?.username} 🍢</h1>
        <p className="text-sm mt-0.5 text-slate-500">ภาพรวมร้านวันนี้ — {new Date().toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" })}</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon="pi pi-shopping-cart" label="ยอดขายวันนี้" value={loading ? "..." : fmt(s.total_sale)} sub="สุทธิหลังส่วนลด" color="#ea580c" delay={0.05} onClick={() => history.push("/sale")} />
        <StatCard icon="pi pi-box"           label="ต้นทุนวัตถุดิบ" value={loading ? "..." : fmt(s.total_cogs)} sub="จากยอดขายวันนี้" color="#a8a29e" delay={0.10} />
        <StatCard icon="pi pi-chart-line"    label="กำไรขั้นต้น"   value={loading ? "..." : fmt(s.gross_profit)} sub="ยอดขาย − ต้นทุน" color="#16a34a" delay={0.15} onClick={() => history.push("/report")} />
        <StatCard icon="pi pi-wallet"        label="กำไรสุทธิ"     value={loading ? "..." : fmt(s.net_profit)}   sub="หลังหักค่าใช้จ่าย" color={(s.net_profit ?? 0) >= 0 ? "#16a34a" : "#dc2626"} delay={0.20} onClick={() => history.push("/report")} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <h2 className="text-sm font-bold text-slate-500 mb-4">สินค้าขายดีวันนี้</h2>
          {loading ? <div className="skeleton h-32 w-full" /> : dash?.top_products?.length ? (
            <div className="space-y-3">
              {dash.top_products.map((p, i) => (
                <div key={p.product_id} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700"><span className="text-slate-300 font-bold">{i + 1}.</span>{p.product_name}</span>
                  <span className="font-semibold text-slate-600">{Number(p.total_quantity).toLocaleString()} หน่วย · {fmt(p.total_sale)}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState title="ยังไม่มียอดขายวันนี้" icon="pi pi-shopping-bag" />}
        </motion.div>

        <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
            <i className="pi pi-exclamation-triangle text-red-400" /> วัตถุดิบใกล้หมด
          </h2>
          {loading ? <div className="skeleton h-32 w-full" /> : dash?.low_stock?.length ? (
            <div className="space-y-3">
              {dash.low_stock.map(item => (
                <div key={item.ingredient_id} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">{item.ingredient_name}</span>
                  <span className="font-bold text-red-500">{Number(item.current_stock).toLocaleString()} / {Number(item.min_stock).toLocaleString()} {item.unit}</span>
                </div>
              ))}
            </div>
          ) : <EmptyState title="สต็อกทุกอย่างเพียงพอ" icon="pi pi-check-circle" />}
        </motion.div>
      </div>

      <motion.div className="card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
        <h2 className="text-sm font-bold text-slate-500 mb-4">เมนูด่วน</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: "pi pi-shopping-cart", label: "ขายสินค้า",       to: "/sale",       color: "#ea580c" },
            { icon: "pi pi-list",          label: "เมนูสินค้า",      to: "/product",    color: "#16a34a" },
            { icon: "pi pi-truck",         label: "รับซื้อวัตถุดิบ", to: "/purchase",   color: "#f59e0b" },
            { icon: "pi pi-chart-line",    label: "รายงานสรุปผล",    to: "/report",     color: "#6366f1" },
          ].map((item) => (
            <motion.div key={item.to}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center gap-2 p-4 rounded-2xl cursor-pointer border border-slate-200 hover:border-slate-300 transition-colors"
              onClick={() => history.push(item.to)}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${item.color}18` }}>
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
