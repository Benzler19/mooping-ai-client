import React, { useState, useEffect } from "react"
import { Calendar } from "primereact/calendar"
import { Button } from "primereact/button"
import { Chart } from "primereact/chart"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { motion } from "framer-motion"
import { ReportModel } from "../../models"
import { PageHeader, EmptyState } from "../../components/customComponent"

const model = new ReportModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
const dateToStr = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const startOfMonth = () => { const d = new Date(); d.setDate(1); return d }

const StatCard = ({ label, value, color, icon }) => (
  <motion.div className="card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <p className="text-2xl font-black mt-1" style={{ color }}>{value}</p>
      </div>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}18` }}>
        <i className={`${icon} text-base`} style={{ color }} />
      </div>
    </div>
  </motion.div>
)

export default function Report() {
  const [dateFrom, setDateFrom] = useState(startOfMonth())
  const [dateTo, setDateTo] = useState(new Date())
  const [summary, setSummary] = useState(null)
  const [dailySales, setDailySales] = useState([])
  const [topProducts, setTopProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const params = { date_from: dateToStr(dateFrom), date_to: dateToStr(dateTo) }
    const [s, d, t] = await Promise.all([
      model.getSummary(params), model.getDailySales(params), model.getTopProducts({ ...params, limit: 10 }),
    ])
    setSummary(s.data); setDailySales(d.data || []); setTopProducts(t.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const chartData = {
    labels: dailySales.map(d => new Date(d.order_date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })),
    datasets: [
      { label: "ยอดขาย", data: dailySales.map(d => Number(d.total_sale)), borderColor: "#ea580c", backgroundColor: "rgba(234,88,12,.12)", tension: 0.35, fill: true },
      { label: "ต้นทุน", data: dailySales.map(d => Number(d.total_cogs)), borderColor: "#94a3b8", backgroundColor: "rgba(148,163,184,.10)", tension: 0.35, fill: true },
    ],
  }
  const chartOptions = { plugins: { legend: { position: "bottom" } }, scales: { y: { beginAtZero: true } }, maintainAspectRatio: false }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <PageHeader title="รายงานสรุปผล" subtitle="รายรับ - รายจ่าย - กำไร ตามช่วงเวลาที่เลือก" />

      <div className="card p-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">ตั้งแต่วันที่</label>
          <Calendar value={dateFrom} onChange={e => setDateFrom(e.value)} dateFormat="dd/mm/yy" showIcon locale="th" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">ถึงวันที่</label>
          <Calendar value={dateTo} onChange={e => setDateTo(e.value)} dateFormat="dd/mm/yy" showIcon locale="th" />
        </div>
        <Button label="ดูรายงาน" icon="pi pi-search" className="btn-primary" loading={loading} onClick={load} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        <StatCard label="ยอดขายรวม" value={fmt(summary?.total_sale)} color="#ea580c" icon="pi pi-shopping-cart" />
        <StatCard label="ต้นทุนวัตถุดิบ" value={fmt(summary?.total_cogs)} color="#a8a29e" icon="pi pi-box" />
        <StatCard label="กำไรขั้นต้น" value={fmt(summary?.gross_profit)} color="#16a34a" icon="pi pi-chart-line" />
        <StatCard label="ค่าใช้จ่ายอื่น" value={fmt(summary?.total_expense)} color="#f59e0b" icon="pi pi-wallet" />
        <StatCard label="กำไรสุทธิ" value={fmt(summary?.net_profit)} color={(summary?.net_profit ?? 0) >= 0 ? "#16a34a" : "#dc2626"} icon="pi pi-verified" />
      </div>

      <motion.div className="card p-5 mb-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-sm font-bold text-slate-600 mb-4">แนวโน้มยอดขาย vs ต้นทุน</h2>
        <div style={{ height: 280 }}>
          {dailySales.length === 0 ? <EmptyState title="ไม่มีข้อมูลในช่วงนี้" /> : <Chart type="line" data={chartData} options={chartOptions} style={{ height: "100%" }} />}
        </div>
      </motion.div>

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-5 pb-0"><h2 className="text-sm font-bold text-slate-600">สินค้าขายดี</h2></div>
        <div className="overflow-x-auto">
          <DataTable value={topProducts} stripedRows emptyMessage={<EmptyState title="ไม่มีข้อมูล" />}>
          <Column field="product_name" header="สินค้า" />
          <Column field="total_quantity" header="จำนวนขาย" body={r => Number(r.total_quantity).toLocaleString()} style={{ width: 130 }} />
          <Column field="total_sale" header="ยอดขาย" body={r => fmt(r.total_sale)} style={{ width: 140 }} />
          <Column field="total_profit" header="กำไร" body={r => fmt(r.total_profit)} style={{ width: 140 }} />
        </DataTable>
        </div>
      </motion.div>
    </div>
  )
}
