import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { Calendar } from "primereact/calendar"
import { Button } from "primereact/button"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { BorrowerModel, RouteModel } from "../../models"

const bModel = new BorrowerModel()
const rModel = new RouteModel()
const EMPTY  = {
  borrower_id: null, route_id: null, name: "", location: "",
  loan_amount: 0, daily_installment: 0, outstanding_balance: 0,
  loan_start_date: null, is_active: 1, is_cut: 0,
}
const activeOpts = [{ label:"ใช้งาน", value:1 }, { label:"ไม่ใช้งาน", value:0 }]
const cutOpts    = [{ label:"ปกติ",   value:0 }, { label:"ตัดออก",   value:1 }]

const Section = ({ icon, label, color="#3b82f6" }) => (
  <div className="flex items-center gap-2 mb-4">
    <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background:`${color}18` }}>
      <i className={`${icon} text-xs`} style={{ color }} />
    </div>
    <span className="text-sm font-bold text-slate-600">{label}</span>
    <div className="flex-1 h-px bg-slate-100" />
  </div>
)

const Field = ({ label, required, hint, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400">{hint}</p>}
  </div>
)

// แปลงทุก format → Date object (รองรับ string, ISO, Date object)
const strToDate = (s) => {
  if (!s) return null
  if (s instanceof Date) return s
  // ตัดเอาแค่ "YYYY-MM-DD" ส่วนแรก (รองรับ "2026-06-05T00:00:00.000Z" ด้วย)
  const dateOnly = String(s).slice(0, 10)
  const [y, m, d] = dateOnly.split("-")
  if (!y || !m || !d) return null
  return new Date(Number(y), Number(m) - 1, Number(d))
}
// แปลง Date object → "YYYY-MM-DD"
const dateToStr = (d) => {
  if (!d) return null
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`
}

export default function BorrowerUpsert({ SESSION, match }) {
  const history = useHistory()
  const id      = match?.params?.id
  const isEdit  = !!id

  const [form, setForm]     = useState(EMPTY)
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const rRes = await rModel.getRouteBy({ params:{} })
      setRoutes((rRes.data||[]).map(r => ({ label:`${r.route_code} – ${r.route_name}`, value:r.route_id })))
      if (isEdit) {
        const res = await bModel.getBorrowerById({ borrower_id: id })
        if (res.require && res.data[0]) setForm(res.data[0])
      }
      setLoading(false)
    }
    init()
  }, [id])

  const onRouteChange = async (route_id) => {
    f("route_id", route_id)
    if (isEdit || !route_id) return
    const res = await bModel.getBorrowerBy({ params:{ filters:{ route_id } } })
    const max = (res.data||[]).reduce((m,b) => Math.max(m, Number(b.seq_no)||0), 0)
    f("seq_no", max+1)
  }

  const save = async () => {
    if (!form.route_id || !form.name)
      return Swal.fire("กรุณากรอกข้อมูลให้ครบ","สาย และชื่อผู้กู้จำเป็นต้องระบุ","warning")
    setSaving(true)
    const payload = {
      ...form,
      loan_start_date: dateToStr(strToDate(form.loan_start_date)),
      create_by: SESSION?.USER?.username,
      update_by: SESSION?.USER?.username,
    }
    const res = isEdit ? await bModel.updateBorrowerById(payload) : await bModel.insertBorrower(payload)
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon:"success", title:"บันทึกสำเร็จ", timer:1500, showConfirmButton:false })
      history.push("/borrower")
    } else {
      Swal.fire({ icon:"error", title:"เกิดข้อผิดพลาด" })
    }
  }

  // strToDate รองรับทุก format แล้ว
  const startDateValue = strToDate(form.loan_start_date)

  return (
    <div className="p-4 md:p-6 max-w-screen-sm mx-auto">
      <motion.div className="mb-6" initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }}>
        <div className="flex items-center gap-3">
          <button onClick={() => history.push("/borrower")}
            className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50"
            style={{ borderColor:"var(--border)" }}>
            <i className="pi pi-arrow-left text-xs text-slate-500" />
          </button>
          <div>
            <h1 className="text-xl font-black text-slate-900">{isEdit ? "แก้ไขผู้กู้" : "เพิ่มผู้กู้ใหม่"}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{isEdit ? `แก้ไขข้อมูล ${form.name}` : "กรอกข้อมูลผู้กู้เงิน"}</p>
          </div>
        </div>
      </motion.div>

      {loading ? (
        <div className="card p-6 space-y-4">
          {[...Array(5)].map((_,i) => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      ) : (
        <motion.div className="space-y-4"
          initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}>

          {/* ── ข้อมูลพื้นฐาน ── */}
          <div className="card p-5">
            <Section icon="pi pi-user" label="ข้อมูลพื้นฐาน" color="#3b82f6" />
            <div className="flex flex-col gap-4">
              <Field label="สาย" required>
                <Dropdown value={form.route_id} options={routes}
                  onChange={e => onRouteChange(e.value)} placeholder="เลือกสาย" className="w-full" />
              </Field>

              {!isEdit && form.route_id && (
                <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:"auto" }}>
                  <Field label="ลำดับในสาย" hint="คำนวณอัตโนมัติ">
                    <div className="flex items-center gap-2 px-4 h-10 rounded-xl border bg-slate-50 text-slate-500 text-sm font-semibold"
                      style={{ borderColor:"var(--border)" }}>
                      <i className="pi pi-hashtag text-xs text-slate-400" />
                      {form.seq_no ?? "—"}
                    </div>
                  </Field>
                </motion.div>
              )}

              <Field label="ชื่อผู้กู้" required hint="ชื่อเล่น หรือชื่อ-นามสกุล">
                <div className="relative">
                  <i className="pi pi-user absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm pointer-events-none" />
                  <InputText value={form.name} onChange={e => f("name",e.target.value)}
                    placeholder="เช่น สาว, ทอย, วนิดา" className="w-full pl-9" />
                </div>
              </Field>

              <Field label="สถานที่">
                <div className="relative">
                  <i className="pi pi-map-marker absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm pointer-events-none" />
                  <InputText value={form.location} onChange={e => f("location",e.target.value)}
                    placeholder="เช่น บ้านค่าย, นิคม, เมือง" className="w-full pl-9" />
                </div>
              </Field>
            </div>
          </div>

          {/* ── ข้อมูลการเงิน ── */}
          <div className="card p-5">
            <Section icon="pi pi-wallet" label="ข้อมูลการเงิน" color="#10b981" />
            <div className="grid grid-cols-2 gap-4">
              <Field label="ยอดเงินกู้" hint="บาท">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">฿</span>
                  <InputNumber value={form.loan_amount}
                    onValueChange={e => f("loan_amount", e.value??0)}
                    mode="decimal" min={0} className="w-full" inputClassName="w-full pl-7" />
                </div>
              </Field>

              <Field label="งวดรายวัน" hint="บาท/วัน">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold pointer-events-none">฿</span>
                  <InputNumber value={form.daily_installment}
                    onValueChange={e => f("daily_installment", e.value??0)}
                    mode="decimal" min={0} className="w-full" inputClassName="w-full pl-7" />
                </div>
              </Field>

              {/* วันที่เริ่มกู้ */}
              <div className="col-span-2">
                <Field label="วันที่เริ่มกู้"
                  hint="ถ้าไม่ระบุ = แสดงในทุกวัน / ถ้าระบุ = แสดงตั้งแต่วันนั้นเป็นต้นไปเท่านั้น">
                  <Calendar
                    value={startDateValue}
                    onChange={e => f("loan_start_date", e.value)}
                    dateFormat="dd/mm/yy"
                    showIcon
                    showButtonBar
                    placeholder="ไม่ระบุ (แสดงทุกวัน)"
                    className="w-full"
                    inputClassName="w-full"
                  />
                </Field>
              </div>

              {/* ระยะเวลาโดยประมาณ */}
              {(form.loan_amount > 0 || form.daily_installment > 0) && (
                <motion.div className="col-span-2 rounded-xl p-4 bg-emerald-50 border border-emerald-100"
                  initial={{ opacity:0 }} animate={{ opacity:1 }}>
                  <div className="flex justify-between text-xs text-emerald-700">
                    <span>ระยะเวลาประมาณ</span>
                    <span className="font-bold">
                      {form.daily_installment > 0
                        ? `${Math.ceil(form.loan_amount / form.daily_installment)} วัน`
                        : "—"}
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* ── สถานะ (edit เท่านั้น) ── */}
          {isEdit && (
            <div className="card p-5">
              <Section icon="pi pi-cog" label="สถานะ" color="#f59e0b" />
              <div className="grid grid-cols-2 gap-4">
                <Field label="ยอดค้างปัจจุบัน" hint="บาท">
                  <InputNumber value={form.outstanding_balance}
                    onValueChange={e => f("outstanding_balance", e.value??0)}
                    mode="decimal" min={0} className="w-full" inputClassName="w-full" />
                </Field>
                <Field label="สถานะบัญชี">
                  <Dropdown value={form.is_active} options={activeOpts}
                    onChange={e => f("is_active",e.value)} className="w-full" />
                </Field>
                <Field label="การตัด" hint="ตัดออก = ไม่ต้องเก็บแล้ว">
                  <Dropdown value={form.is_cut} options={cutOpts}
                    onChange={e => f("is_cut",e.value)} className="w-full" />
                </Field>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button label="ยกเลิก" className="btn-cancel flex-1" icon="pi pi-times"
              onClick={() => history.push("/borrower")} />
            <Button label={isEdit ? "บันทึกการแก้ไข" : "เพิ่มผู้กู้"} className="btn-primary flex-1"
              icon="pi pi-check" loading={saving} onClick={save} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
