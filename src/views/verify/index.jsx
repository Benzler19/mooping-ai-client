import React, { useState, useEffect } from "react"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Calendar } from "primereact/calendar"
import { Dropdown } from "primereact/dropdown"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { DailyTripModel, RouteModel } from "../../models"
import PageHeader from "../../components/customComponent/PageHeader"

const tripModel  = new DailyTripModel()
const routeModel = new RouteModel()
const fmt = (v) => (Number(v) || 0).toLocaleString()

export default function VerifyPage({ SESSION }) {
  const [trips, setTrips]     = useState([])
  const [routes, setRoutes]   = useState([])
  const [loading, setLoading] = useState(false)
  const [detail, setDetail]   = useState(null)   // trip with details
  const [detailVisible, setDetailVisible] = useState(false)
  const [date, setDate]       = useState(new Date())
  const [filterRoute, setFilterRoute] = useState(null)

  const toDateStr = (d) => (d || new Date()).toISOString().slice(0, 10)

  const load = async () => {
    setLoading(true)
    const filters = { trip_date: toDateStr(date) }
    if (filterRoute) filters.route_id = filterRoute
    const res = await tripModel.getTripBy({ params: { filters } })
    setTrips(res.data || [])
    setLoading(false)
  }

  useEffect(() => {
    routeModel.getRouteBy({ params: {} }).then(r =>
      setRoutes([{ label: "ทุกสาย", value: null }, ...(r.data || []).map(x => ({ label: `${x.route_code} – ${x.route_name}`, value: x.route_id }))])
    )
  }, [])

  useEffect(() => { load() }, [date, filterRoute])

  const openDetail = async (row) => {
    const res = await tripModel.getTripWithDetails({ trip_id: row.trip_id })
    if (res.require) { setDetail(res.data); setDetailVisible(true) }
  }

  const verify = async (trip_id) => {
    const { isConfirmed } = await Swal.fire({
      title: "ยืนยันตรวจสอบ?", icon: "question",
      showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#1e293b",
    })
    if (!isConfirmed) return
    const res = await tripModel.verifyTrip({ trip_id, verified_by: SESSION?.USER?.username })
    if (res.require) {
      Swal.fire({ icon: "success", title: "ตรวจสอบแล้ว", timer: 1500, showConfirmButton: false })
      load()
      if (detailVisible) setDetailVisible(false)
    }
  }

  const statusBadge = (row) => {
    const map = { draft: ["badge-draft","กรอกอยู่"], submitted: ["badge-submitted","รอตรวจ"], verified: ["badge-verified","ตรวจแล้ว"] }
    const [cls, label] = map[row.status] || ["badge-draft",""]
    return <span className={`badge ${cls}`}>{label}</span>
  }

  // Summary
  const totalTrips     = trips.length
  const waitingTrips   = trips.filter(t => t.status === "submitted").length
  const verifiedTrips  = trips.filter(t => t.status === "verified").length

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <PageHeader title="ตรวจสอบยอด" subtitle="ภาพรวมการเก็บเงินทุกสาย" />

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: "ทั้งหมด",    value: totalTrips,   color: "#3b82f6" },
          { label: "รอตรวจ",     value: waitingTrips, color: "#f59e0b" },
          { label: "ตรวจแล้ว",   value: verifiedTrips,color: "#10b981" },
        ].map(({ label, value, color }) => (
          <motion.div key={label} className="card p-4 text-center"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-xs text-slate-500">{label}</div>
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Calendar value={date} onChange={e => setDate(e.value)} dateFormat="dd/mm/yy"
          showIcon className="h-9" inputClassName="h-9 text-sm" />
        <Dropdown value={filterRoute} options={routes} onChange={e => setFilterRoute(e.value)}
          placeholder="เลือกสาย" className="w-44 h-9" />
      </div>

      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable value={trips} loading={loading} size="small"
          emptyMessage="ไม่มีข้อมูลวันที่เลือก">
          <Column header="#" body={(_, o) => o.rowIndex + 1} style={{ width: 60 }} />
          <Column field="route_code" header="สาย" style={{ width: 80 }} />
          <Column field="route_name" header="ชื่อสาย" />
          <Column header="วันที่" body={r => new Date(r.trip_date).toLocaleDateString("th-TH")} />
          <Column header="สถานะ" body={statusBadge} />
          <Column header="ส่งโดย" field="submit_by" />
          <Column header="เวลาส่ง" body={r => r.submit_date ? new Date(r.submit_date).toLocaleTimeString("th-TH") : "—"} />
          <Column header="จัดการ" body={row => (
            <div className="flex gap-2">
              <Button size="small" icon="pi pi-eye" className="btn-edit" onClick={() => openDetail(row)} />
              {row.status === "submitted" && (
                <Button size="small" icon="pi pi-check" className="btn-primary"
                  label="ตรวจแล้ว" onClick={() => verify(row.trip_id)} />
              )}
            </div>
          )} />
        </DataTable>
      </motion.div>

      {/* Detail Dialog */}
      <Dialog visible={detailVisible} onHide={() => setDetailVisible(false)}
        header={`รายละเอียด — สาย ${detail?.trip?.route_code || ""}`}
        style={{ width: "min(700px, 95vw)" }} maximizable>
        {detail && (
          <div>
            {/* Trip summary */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {(() => {
                const ds = detail.details || []
                const totalI = ds.reduce((s, d) => s + (d.installment_amount || 0), 0)
                const totalC = ds.reduce((s, d) => s + (d.collected_amount || 0), 0)
                return [
                  { label: "ต้องเก็บ",  value: fmt(totalI), color: "#3b82f6" },
                  { label: "เก็บได้",   value: fmt(totalC), color: "#10b981" },
                  { label: "ขาด",       value: fmt(totalI - totalC), color: "#ef4444" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="card p-3 text-center">
                    <div className="text-xs text-slate-500">{label}</div>
                    <div className="text-xl font-black" style={{ color }}>{value}</div>
                  </div>
                ))
              })()}
            </div>

            <DataTable value={detail.details || []} size="small" scrollable scrollHeight="400px">
              <Column header="#" body={(_, o) => o.rowIndex + 1} style={{ width: 50 }} />
              <Column field="seq_no"       header="ลำดับ" style={{ width: 70 }} />
              <Column field="borrower_name" header="ชื่อ" />
              <Column field="location"     header="สถานที่" />
              <Column header="ยอดค้าง" body={r => fmt(r.outstanding_before)} />
              <Column header="งวดวันนี้"   body={r => fmt(r.installment_amount)} />
              <Column header="เก็บได้" body={r => (
                <span className="font-bold text-green-600">{fmt(r.collected_amount)}</span>
              )} />
              <Column header="ขาด" body={r => (
                <span className={r.shortage_amount > 0 ? "text-red-500 font-bold" : "text-slate-400"}>
                  {fmt(r.shortage_amount)}
                </span>
              )} />
            </DataTable>

            {detail.trip?.status === "submitted" && (
              <div className="flex justify-end mt-4">
                <Button label="ตรวจสอบแล้ว" icon="pi pi-check" className="btn-primary"
                  onClick={() => verify(detail.trip.trip_id)} />
              </div>
            )}
          </div>
        )}
      </Dialog>
    </div>
  )
}
