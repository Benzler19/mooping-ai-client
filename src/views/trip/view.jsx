import React, { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "primereact/button"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { Toast } from "primereact/toast"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import { DailyTripModel, CollectionDetailModel, BorrowerModel, RouteModel } from "../../models"
import EmptyState from "../../components/customComponent/EmptyState"

const tripModel  = new DailyTripModel()
const colModel   = new CollectionDetailModel()
const borModel   = new BorrowerModel()
const routeModel = new RouteModel()

const toDateStr = (d) => {
  const dt = d ? new Date(d) : new Date()
  return `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,"0")}-${String(dt.getDate()).padStart(2,"0")}`
}
const fmt = (v) => (Number(v) || 0).toLocaleString()
const thDate = (str) => {
  if (!str) return ""
  const [y, m, d] = str.split("-")
  return new Date(Number(y), Number(m)-1, Number(d))
    .toLocaleDateString("th-TH", { year:"numeric", month:"long", day:"numeric", weekday:"long" })
}

const ProgressBar = ({ collected, total }) => {
  const pct   = total > 0 ? Math.min(100, Math.round((collected/total)*100)) : 0
  const color = pct >= 100 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444"
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <motion.div className="h-full rounded-full" style={{ background: color }}
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{pct}%</span>
    </div>
  )
}

/* status config */
const STATUS = {
  verified:  { label:"ตรวจแล้ว",     color:"#10b981", bg:"#d1fae5", icon:"pi-check-circle" },
  submitted: { label:"รอตรวจ",       color:"#f59e0b", bg:"#fef3c7", icon:"pi-send" },
  draft:     { label:"กรอกอยู่",     color:"#3b82f6", bg:"#dbeafe", icon:"pi-pencil" },
  none:      { label:"ยังไม่มีข้อมูล", color:"#94a3b8", bg:"#f1f5f9", icon:"pi-circle" },
}

/* ─── Step 1: เลือกวัน (Grid) ───────────────── */
function DateSelectStep({ user, isAdmin, onSelect }) {
  const [selectedRoute, setSelectedRoute] = useState(
    isAdmin ? null : { route_id: user?.route_id, route_code: user?.route_code, route_name: user?.route_name }
  )
  const [routeOptions, setRouteOptions] = useState([])
  const [tripMap, setTripMap]           = useState({})
  const [loading, setLoading]           = useState(false)

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d
  })

  useEffect(() => {
    if (!isAdmin) return
    routeModel.getRouteBy({ params: {} }).then(r =>
      setRouteOptions((r.data||[]).map(x => ({ label:`สาย ${x.route_code} — ${x.route_name}`, value: x })))
    )
  }, [isAdmin])

  useEffect(() => {
    if (!selectedRoute?.route_id) return
    setLoading(true)
    Promise.all(days.map(d =>
      tripModel.getTodayTripByRoute({ route_id: selectedRoute.route_id, trip_date: toDateStr(d) })
    )).then(results => {
      const map = {}
      results.forEach((r, i) => { map[toDateStr(days[i])] = r.data?.[0] || null })
      setTripMap(map)
      setLoading(false)
    })
  }, [selectedRoute])

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <motion.div className="mb-5" initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <h1 className="text-xl font-black text-slate-900">การเก็บเงิน</h1>
        <p className="text-sm text-slate-400 mt-0.5">เลือกวันที่ต้องการบันทึก</p>
      </motion.div>

      {isAdmin && (
        <motion.div className="card p-3 mb-5 flex items-center gap-3"
          initial={{ opacity:0 }} animate={{ opacity:1 }}>
          <i className="pi pi-map text-blue-500" />
          <span className="text-sm font-semibold text-slate-600">สาย:</span>
          <Dropdown value={selectedRoute} options={routeOptions}
            onChange={e => setSelectedRoute(e.value)}
            placeholder="เลือกสาย" className="w-56" />
        </motion.div>
      )}

      {!selectedRoute?.route_id ? (
        <EmptyState icon="pi pi-map" title="เลือกสายก่อน" />
      ) : loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_,i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {days.map((d, i) => {
            const dateStr  = toDateStr(d)
            const isToday  = i === 0
            const trip     = tripMap[dateStr]
            const statusKey = trip?.status || "none"
            const s         = STATUS[statusKey]

            return (
              <motion.div key={dateStr}
                className="card cursor-pointer overflow-hidden"
                style={{ borderColor: isToday ? "#3b82f6" : undefined, borderWidth: isToday ? 2 : 1 }}
                initial={{ opacity:0, y:16 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -3, boxShadow: "0 8px 24px rgba(0,0,0,.10)" }}
                whileTap={{ scale: .97 }}
                onClick={() => onSelect({ route: selectedRoute, dateStr, trip })}>

                {/* Color bar top */}
                <div className="h-1.5 w-full" style={{ background: s.color }} />

                <div className="p-4">
                  {/* Date badge */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm ${
                      isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {d.getDate()}
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
                      style={{ background: s.bg, color: s.color }}>
                      <i className={`pi ${s.icon} text-[10px]`} />
                      {s.label}
                    </div>
                  </div>

                  {/* Day name */}
                  <div className="font-bold text-sm text-slate-800 leading-tight">
                    {isToday && <span className="text-blue-600">วันนี้ </span>}
                    {d.toLocaleDateString("th-TH", { weekday:"long" })}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {d.toLocaleDateString("th-TH", { day:"numeric", month:"short", year:"numeric" })}
                  </div>

                  {/* Arrow */}
                  <div className="flex justify-end mt-3">
                    <i className="pi pi-chevron-right text-slate-300 text-xs" />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ─── Step 2: กรอกยอด ─────────────────────── */
function CollectStep({ user, isAdmin, route, dateStr, tripInit, onBack }) {
  const toast = useRef(null)
  const [trip, setTrip]           = useState(tripInit)
  const [borrowers, setBorrowers] = useState([])
  const [details, setDetails]     = useState({})
  const [saved, setSaved]         = useState({})
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState({})
  const [submitting, setSubmitting] = useState(false)

  // lock = collector + submitted/verified
  // admin ยังแก้ไขได้เสมอ
  const isLocked = !isAdmin && (trip?.status === "submitted" || trip?.status === "verified")

  const loadData = useCallback(async () => {
    setLoading(true)
    const [bRes, tRes] = await Promise.all([
      borModel.getBorrowerByRoute({ route_id: route.route_id, trip_date: dateStr }),
      tripModel.getTodayTripByRoute({ route_id: route.route_id, trip_date: dateStr }),
    ])
    setBorrowers(bRes.data || [])
    const currentTrip = tRes.data?.[0] || null
    setTrip(currentTrip)
    if (currentTrip) {
      const dRes = await colModel.getCollectionByTrip({ trip_id: currentTrip.trip_id })
      const map = {}, sv = {}
      ;(dRes.data||[]).forEach(d => { map[d.borrower_id] = d.collected_amount; sv[d.borrower_id] = true })
      setDetails(map); setSaved(sv)
    } else { setDetails({}); setSaved({}) }
    setLoading(false)
  }, [route, dateStr])

  useEffect(() => { loadData() }, [])

  const createTrip = async () => {
    await tripModel.insertTrip({ route_id: route.route_id, trip_date: dateStr, create_by: user?.username })
    await loadData()
  }

  // บันทึกยอดเก็บ — ต้องระบุค่าชัดเจนก่อนเท่านั้น (ไม่บันทึกถ้า null)
  const saveOne = async (b, forceCollected = undefined) => {
    if (!trip) return
    const rawVal  = forceCollected !== undefined ? forceCollected : details[b.borrower_id]
    if (rawVal === null || rawVal === undefined) return  // ยังไม่กรอก → ข้ามไป
    const collected = Number(rawVal)

    setSaving(p => ({ ...p, [b.borrower_id]: true }))
    const res = await colModel.saveCollection({
      trip_id: trip.trip_id, borrower_id: b.borrower_id,
      outstanding_before:    b.outstanding_balance,
      outstanding_after:     Math.max(0, b.outstanding_balance - collected),
      installment_amount:    b.daily_installment,
      collected_amount:      collected,
      missed_count_snapshot: collected === 0 ? (b.missed_count||0)+1 : 0,
      is_cut: 0, create_by: user?.username,
    })
    setSaving(p => ({ ...p, [b.borrower_id]: false }))
    if (res.require) {
      setSaved(p => ({ ...p, [b.borrower_id]: true }))
      const bRes = await borModel.getBorrowerByRoute({ route_id: route.route_id, trip_date: dateStr })
      setBorrowers(bRes.data || [])
      toast.current?.show({
        severity: collected > 0 ? "success" : "warn",
        summary:  collected > 0 ? "บันทึกแล้ว" : "บันทึก — ขาดส่ง",
        detail:   collected > 0
          ? `${b.name}: เก็บได้ ${fmt(collected)} บาท`
          : `${b.name}: บันทึกขาดส่ง (ต่อเนื่อง ${(b.missed_count||0)+1} วัน)`,
        life: 2500,
      })
    }
  }

  // บันทึก "ขาดส่ง" ชัดเจน (บันทึก 0 โดยตั้งใจ)
  const saveMissed = async (b) => {
    setDetails(p => ({ ...p, [b.borrower_id]: 0 }))
    await saveOne(b, 0)
  }

  const submitAll = async () => {
    const notSaved = borrowers.filter(b => !saved[b.borrower_id])
    if (notSaved.length > 0) {
      const { isConfirmed } = await Swal.fire({
        title: "ยังมีรายการที่ยังไม่บันทึก",
        html: `<div class="text-sm text-slate-500 text-left">
          <b>${notSaved.map(b => b.name).join(", ")}</b><br><br>
          ยังไม่ได้กรอกยอด — ต้องการบันทึกเป็น <b class="text-red-500">ขาดส่ง (0 บาท)</b> หรือไม่?<br>
          <span class="text-xs text-slate-400">หรือกดยกเลิกแล้วไปกรอกยอดให้ครบก่อน</span>
        </div>`,
        icon: "warning", showCancelButton: true,
        confirmButtonText: "บันทึกขาดส่ง + ส่งยอด",
        cancelButtonText: "ยกเลิก (กลับไปกรอก)",
        confirmButtonColor: "#ef4444",
      })
      if (!isConfirmed) return
      // บันทึก 0 ให้คนที่ยังไม่กรอก
      for (const b of notSaved) await saveOne(b, 0)
    } else {
      const { isConfirmed } = await Swal.fire({
        title: "ส่งยอดทั้งหมด?",
        html: `<div class="text-sm text-slate-500">หลังกดยืนยัน collector <b>จะแก้ไขไม่ได้อีก</b></div>`,
        icon: "question", showCancelButton: true,
        confirmButtonText: "ส่งยอด", cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#3b82f6",
      })
      if (!isConfirmed) return
    }
    setSubmitting(true)
    const res = await tripModel.submitTrip({ trip_id: trip.trip_id, submit_by: user?.username })
    setSubmitting(false)
    if (res.require) {
      await Swal.fire({ icon:"success", title:"ส่งยอดสำเร็จ!", timer:2000, showConfirmButton:false })
      await loadData()
    }
  }

  const totalInstallment = borrowers.reduce((s,b) => s+(b.daily_installment||0), 0)
  const totalCollected   = borrowers.reduce((s,b) => s+(Number(details[b.borrower_id])||0), 0)
  const totalShortage    = totalInstallment - totalCollected
  const savedCount       = Object.keys(saved).length
  const statusKey        = trip?.status || "none"
  const s                = STATUS[statusKey]

  // แยก dateStr เป็น day/month/year สำหรับ display
  const [dyear, dmonth, dday] = dateStr.split("-")
  const dispDate = new Date(Number(dyear), Number(dmonth)-1, Number(dday))
  const isToday = dateStr === toDateStr(new Date())

  return (
    <div className="p-4 md:p-6 max-w-screen-lg mx-auto">
      <Toast ref={toast} position="top-right" />

      {/* Header */}
      <motion.div className="flex items-center justify-between mb-4"
        initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50 transition-colors"
            style={{ borderColor:"var(--border)" }}>
            <i className="pi pi-arrow-left text-xs text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">การเก็บเงิน</h1>
            <p className="text-sm text-slate-500">สาย {route.route_code} — {route.route_name}</p>
          </div>
        </div>
        {/* ปุ่มส่งยอด: เฉพาะ collector + draft */}
        {trip?.status === "draft" && !isAdmin && (
          <Button label="ส่งยอดทั้งหมด" icon="pi pi-send" className="btn-primary h-9"
            loading={submitting} onClick={submitAll} />
        )}
      </motion.div>

      {/* Date card */}
      <motion.div className="card p-4 mb-4 flex items-center gap-4"
        initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}>
        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-sm shrink-0 ${
          isToday ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
        }`}>
          <span className="text-2xl leading-none">{dispDate.getDate()}</span>
          <span className="text-[10px] font-semibold opacity-70">
            {dispDate.toLocaleDateString("th-TH",{month:"short"})}
          </span>
        </div>
        <div>
          <div className="font-bold text-slate-800">
            {isToday && <span className="text-blue-600 mr-1">วันนี้</span>}
            {dispDate.toLocaleDateString("th-TH",{ weekday:"long" })}
          </div>
          <div className="text-sm text-slate-500">
            {dispDate.toLocaleDateString("th-TH",{ day:"numeric", month:"long", year:"numeric" })}
          </div>
        </div>
        {!isToday && (
          <div className="ml-auto flex items-center gap-1.5 text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1.5 rounded-full">
            <i className="pi pi-history text-xs" />
            ย้อนหลัง
          </div>
        )}
      </motion.div>

      {/* Status bar */}
      {trip && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold mb-4"
          style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}30` }}>
          <i className={`pi ${s.icon} text-base`} />
          <span>
            {statusKey === "verified"  && "ตรวจสอบแล้ว — Admin ยังแก้ไขได้"}
            {statusKey === "submitted" && (isAdmin ? "รอตรวจ — Admin ยังแก้ไขได้" : "ส่งยอดแล้ว — แก้ไขไม่ได้ (เฉพาะ Admin)")}
            {statusKey === "draft"     && `กำลังบันทึก — ${savedCount}/${borrowers.length} คน`}
          </span>
          {isAdmin && trip.status === "submitted" && (
            <button className="ml-auto text-xs bg-green-600 text-white px-3 py-1 rounded-full hover:bg-green-700"
              onClick={async () => {
                await tripModel.verifyTrip({ trip_id: trip.trip_id, verified_by: user?.username })
                Swal.fire({ icon:"success", title:"ตรวจสอบแล้ว", timer:1500, showConfirmButton:false })
                loadData()
              }}>✓ ตรวจสอบแล้ว</button>
          )}
        </motion.div>
      )}

      {loading ? (
        <div className="space-y-3">{[...Array(4)].map((_,i) => <div key={i} className="skeleton h-20 w-full" />)}</div>
      ) : !trip ? (
        <motion.div className="card p-8 flex flex-col items-center gap-4"
          initial={{ opacity:0, scale:.96 }} animate={{ opacity:1, scale:1 }}>
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <i className="pi pi-calendar-plus text-2xl text-blue-500" />
          </div>
          <div className="text-center">
            <p className="font-bold text-slate-700">ยังไม่มีรายการเก็บเงิน</p>
            {borrowers.length > 0 ? (
              <p className="text-sm text-slate-500 mt-1">
                มีผู้กู้ <b className="text-blue-600">{borrowers.length} คน</b> ที่ต้องเก็บเงินวันนี้
                {" "}(รวม <b className="text-green-600">{fmt(borrowers.reduce((s,b)=>s+(b.daily_installment||0),0))}</b> บาท)
              </p>
            ) : (
              <p className="text-sm text-slate-400 mt-1">ไม่มีผู้กู้ที่เริ่มกู้ก่อนวันนี้</p>
            )}
          </div>
          {/* แสดงรายชื่อผู้กู้ preview */}
          {borrowers.length > 0 && (
            <div className="w-full max-w-sm space-y-1.5">
              {borrowers.map(b => (
                <div key={b.borrower_id} className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 text-sm">
                  <span className="font-medium text-slate-700">{b.name}
                    <span className="text-slate-400 ml-2 text-xs">{b.location}</span>
                  </span>
                  <span className="font-bold text-blue-600">{fmt(b.daily_installment)} ฿</span>
                </div>
              ))}
            </div>
          )}
          {!isAdmin && borrowers.length > 0 && (
            <Button label="เปิดรายการเก็บเงิน" icon="pi pi-plus" className="btn-primary" onClick={createTrip} />
          )}
          {!isAdmin && borrowers.length === 0 && (
            <p className="text-xs text-slate-400 text-center">ผู้กู้ในสายนี้ยังไม่เริ่มกู้วันนี้</p>
          )}
        </motion.div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label:"ต้องเก็บ", value:fmt(totalInstallment), color:"#3b82f6" },
              { label:"เก็บได้",  value:fmt(totalCollected),   color:"#10b981" },
              { label:"ขาด",      value:fmt(totalShortage),    color:totalShortage>0?"#ef4444":"#10b981" },
            ].map(({ label, value, color }) => (
              <motion.div key={label} className="card p-3 text-center"
                initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}>
                <div className="text-xs text-slate-500">{label}</div>
                <div className="text-lg font-black" style={{ color }}>{value}</div>
              </motion.div>
            ))}
          </div>

          <div className="card p-3 mb-4">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>ความคืบหน้า</span><span>{savedCount}/{borrowers.length} คน</span>
            </div>
            <ProgressBar collected={totalCollected} total={totalInstallment} />
          </div>

          {/* Borrower list */}
          <div className="space-y-2">
            {borrowers.map((b, i) => {
              const collected = details[b.borrower_id] ?? null
              const isSaved   = saved[b.borrower_id]
              const isSaving  = saving[b.borrower_id]
              const shortage  = b.daily_installment - (Number(collected)||0)
              const pct       = b.daily_installment > 0
                ? Math.min(100, Math.round(((Number(collected)||0)/b.daily_installment)*100)) : 0
              // แสดง input ถ้า: admin เสมอ หรือ collector + draft เท่านั้น
              const canEdit   = isAdmin || !isLocked

              return (
                <motion.div key={b.borrower_id} className="card p-4"
                  initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}
                  transition={{ delay: i*0.025 }}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs text-slate-400 font-mono bg-slate-100 px-1.5 py-0.5 rounded">#{b.seq_no}</span>
                        <span className="font-bold text-slate-800">{b.name}</span>
                        {b.location && <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{b.location}</span>}
                        {isSaved && <i className="pi pi-check-circle text-green-500 text-sm" />}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-1 text-xs text-slate-500">
                        <span>ยอดค้าง <b className="text-orange-600">{fmt(b.outstanding_balance)}</b></span>
                        <span>งวดวันนี้ <b className="text-blue-600">{fmt(b.daily_installment)}</b></span>
                        {Number(collected)>0 && shortage>0 && <span>ขาด <b className="text-red-500">{fmt(shortage)}</b></span>}
                      </div>
                      <div className="flex gap-2 mt-1.5 flex-wrap">
                        {b.missed_count > 0 && (
                          <span className="text-xs bg-red-50 text-red-500 border border-red-100 px-2 py-0.5 rounded-full font-semibold">
                            🔴 ขาดต่อเนื่อง {b.missed_count} วัน
                          </span>
                        )}
                        {b.total_missed_count > 0 && (
                          <span className="text-xs bg-orange-50 text-orange-500 border border-orange-100 px-2 py-0.5 rounded-full">
                            ขาดสะสม {b.total_missed_count} ครั้ง
                          </span>
                        )}
                      </div>
                      {isSaved && <div className="mt-2"><ProgressBar collected={Number(collected)||0} total={b.daily_installment} /></div>}
                    </div>

                    {canEdit ? (
                      <div className="flex flex-col gap-1.5 shrink-0 items-end">
                        <div className="flex items-center gap-2">
                          <InputNumber
                            value={collected}
                            onValueChange={e => setDetails(p => ({
                              ...p,
                              [b.borrower_id]: e.value !== null && e.value !== undefined ? e.value : null
                            }))}
                            mode="decimal" min={0} max={b.outstanding_balance}
                            placeholder="กรอกยอด"
                            inputClassName="w-28 text-right font-bold text-sm"
                          />
                          <Button
                            icon={isSaving ? "pi pi-spin pi-spinner" : "pi pi-save"}
                            className="btn-save shrink-0"
                            disabled={isSaving || collected === null}
                            tooltip="บันทึกยอด" tooltipOptions={{ position:"top" }}
                            onClick={() => saveOne(b)}
                          />
                        </div>
                        {/* ปุ่ม "ขาดส่ง" — กดเพื่อบันทึก 0 โดยตั้งใจ */}
                        {!isSaved && (
                          <button
                            className="text-xs text-red-400 hover:text-red-600 underline underline-offset-2 transition-colors"
                            onClick={() => saveMissed(b)}
                            disabled={isSaving}
                          >
                            บันทึกขาดส่ง
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="text-right shrink-0">
                        <div className="text-lg font-black"
                          style={{ color: pct>=100?"#10b981":pct>0?"#f59e0b":"#ef4444" }}>
                          {fmt(details[b.borrower_id] ?? 0)}
                        </div>
                        <div className="text-xs text-slate-400">บาท</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Submit bar — collector + draft only */}
          {trip?.status === "draft" && !isAdmin && (
            <motion.div className="sticky bottom-4 mt-6"
              initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}>
              <div className="card p-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-blue-50 border-blue-200">
                <div>
                  <p className="text-sm font-bold text-blue-800">พร้อมส่งยอด?</p>
                  <p className="text-xs text-blue-600">บันทึกแล้ว {savedCount}/{borrowers.length} คน — เก็บได้ {fmt(totalCollected)} บาท</p>
                </div>
                <Button label="ส่งยอดทั้งหมด" icon="pi pi-send" className="btn-primary"
                  loading={submitting} onClick={submitAll} />
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}

/* ─── Main ─────────────────────────────────── */
export default function TripView({ SESSION }) {
  const user    = SESSION?.USER
  const isAdmin = !user?.route_id
  const [step, setStep]         = useState("select")
  const [selection, setSelection] = useState(null)

  return (
    <AnimatePresence mode="wait">
      {step === "select" ? (
        <motion.div key="select" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, x:-20 }}>
          <DateSelectStep user={user} isAdmin={isAdmin}
            onSelect={({ route, dateStr, trip }) => {
              setSelection({ route, dateStr, trip })
              setStep("collect")
            }} />
        </motion.div>
      ) : (
        <motion.div key="collect" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:20 }}>
          <CollectStep user={user} isAdmin={isAdmin}
            route={selection.route} dateStr={selection.dateStr} tripInit={selection.trip}
            onBack={() => setStep("select")} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
