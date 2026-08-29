import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { IngredientModel } from "../../models"
import { Enum } from "../../components/customComponent"

const model = new IngredientModel()
const EMPTY = { ingredient_name: "", unit: "กก.", min_stock: 0, status: 1 }

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

export default function IngredientUpsert({ SESSION, match }) {
  const history = useHistory()
  const id = match?.params?.id
  const isEdit = !!id

  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const init = async () => {
      if (!isEdit) return
      setLoading(true)
      const res = await model.getIngredientById({ ingredient_id: id })
      if (res.require && res.data[0]) setForm(res.data[0])
      setLoading(false)
    }
    init()
  }, [id])

  const save = async () => {
    if (!form.ingredient_name) return Swal.fire("กรุณากรอกข้อมูลให้ครบ", "ต้องระบุชื่อวัตถุดิบ", "warning")
    setSaving(true)
    const payload = { ...form, create_by: SESSION?.USER?.username, update_by: SESSION?.USER?.username }
    const res = isEdit ? await model.updateIngredientById(payload) : await model.insertIngredient(payload)
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false })
      history.push("/ingredient")
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-sm mx-auto">
      <motion.div className="mb-6 flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => history.push("/ingredient")}
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50"
          style={{ borderColor: "var(--border)" }}>
          <i className="pi pi-arrow-left text-xs text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">{isEdit ? "แก้ไขวัตถุดิบ" : "เพิ่มวัตถุดิบใหม่"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{isEdit ? form.ingredient_name : "สต็อกเริ่มต้นจะเพิ่มผ่านหน้ารับซื้อวัตถุดิบ"}</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="card p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
      ) : (
        <motion.div className="card p-5 space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Field label="ชื่อวัตถุดิบ" required>
            <InputText value={form.ingredient_name} onChange={e => f("ingredient_name", e.target.value)}
              placeholder="เช่น เนื้อหมู, ไม้เสียบ, น้ำจิ้ม" className="w-full" />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="หน่วยนับ">
              <Dropdown value={form.unit} options={Enum.unitOptions} onChange={e => f("unit", e.value)} className="w-full" />
            </Field>
            <Field label="จุดสั่งซื้อขั้นต่ำ" >
              <InputNumber value={form.min_stock} onValueChange={e => f("min_stock", e.value ?? 0)}
                mode="decimal" minFractionDigits={0} maxFractionDigits={3} min={0} className="w-full" />
            </Field>
          </div>

          {isEdit && (
            <>
              <div className="grid grid-cols-2 gap-4 p-3 rounded-xl bg-slate-50 border" style={{ borderColor: "var(--border)" }}>
                <div>
                  <p className="text-xs text-slate-400">คงเหลือปัจจุบัน</p>
                  <p className="text-sm font-bold text-slate-700">{Number(form.current_stock || 0).toLocaleString()} {form.unit}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">ต้นทุนเฉลี่ย</p>
                  <p className="text-sm font-bold text-slate-700">฿{Number(form.avg_cost || 0).toLocaleString()}</p>
                </div>
              </div>
              <Field label="สถานะ">
                <Dropdown value={form.status} options={Enum.isActive} onChange={e => f("status", e.value)} className="w-full" />
              </Field>
            </>
          )}

          <div className="flex gap-3 pt-2">
            <Button label="ยกเลิก" className="btn-cancel flex-1" icon="pi pi-times" onClick={() => history.push("/ingredient")} />
            <Button label={isEdit ? "บันทึกการแก้ไข" : "เพิ่มวัตถุดิบ"} className="btn-primary flex-1"
              icon="pi pi-check" loading={saving} onClick={save} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
