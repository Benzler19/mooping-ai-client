import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { Calendar } from "primereact/calendar"
import { Button } from "primereact/button"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import { PurchaseModel, SupplierModel, IngredientModel } from "../../models"
import { EmptyState } from "../../components/customComponent"

const model = new PurchaseModel()
const sModel = new SupplierModel()
const iModel = new IngredientModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
const dateToStr = (d) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : null

export default function PurchaseUpsert({ SESSION }) {
  const history = useHistory()
  const [suppliers, setSuppliers] = useState([])
  const [ingredients, setIngredients] = useState([])
  const [purchaseDate, setPurchaseDate] = useState(new Date())
  const [supplierId, setSupplierId] = useState(null)
  const [note, setNote] = useState("")
  const [rows, setRows] = useState([{ ingredient_id: null, quantity: 0, unit_cost: 0 }])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const [sRes, iRes] = await Promise.all([
        sModel.getSupplierBy({ params: {} }),
        iModel.getIngredientForRecipe({}),
      ])
      setSuppliers((sRes.data || []).map(s => ({ label: s.supplier_name, value: s.supplier_id })))
      setIngredients((iRes.data || []).map(i => ({ label: `${i.ingredient_name} (${i.unit})`, value: i.ingredient_id })))
    }
    init()
  }, [])

  const addRow = () => setRows(p => [...p, { ingredient_id: null, quantity: 0, unit_cost: 0 }])
  const removeRow = (idx) => setRows(p => p.filter((_, i) => i !== idx))
  const updateRow = (idx, key, value) => setRows(p => p.map((r, i) => i === idx ? { ...r, [key]: value } : r))

  const total = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unit_cost) || 0), 0)

  const addSupplier = async () => {
    const { value } = await Swal.fire({
      title: "เพิ่มผู้ขายใหม่", input: "text", inputPlaceholder: "ชื่อผู้ขาย/ร้านค้า",
      showCancelButton: true, confirmButtonText: "เพิ่ม", cancelButtonText: "ยกเลิก",
    })
    if (!value) return
    const res = await sModel.insertSupplier({ supplier_name: value })
    if (res.require) {
      setSuppliers(p => [...p, { label: value, value: res.data.supplier_id }])
      setSupplierId(res.data.supplier_id)
    }
  }

  const save = async () => {
    const items = rows.filter(r => r.ingredient_id && r.quantity > 0)
    if (items.length === 0) return Swal.fire("กรุณากรอกข้อมูลให้ครบ", "ต้องมีรายการวัตถุดิบอย่างน้อย 1 รายการ", "warning")
    setSaving(true)
    const res = await model.insertPurchase({
      purchase_date: dateToStr(purchaseDate), supplier_id: supplierId, note, items,
      create_by: SESSION?.USER?.username,
    })
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกบิลซื้อสำเร็จ", timer: 1200, showConfirmButton: false })
      history.push("/purchase")
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-md mx-auto">
      <motion.div className="mb-6 flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => history.push("/purchase")}
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50"
          style={{ borderColor: "var(--border)" }}>
          <i className="pi pi-arrow-left text-xs text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">บันทึกบิลซื้อวัตถุดิบ</h1>
          <p className="text-xs text-slate-400 mt-0.5">สต็อกและต้นทุนเฉลี่ยจะอัปเดตทันทีที่บันทึก</p>
        </div>
      </motion.div>

      <motion.div className="card p-5 space-y-4 mb-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">วันที่ซื้อ</label>
            <Calendar value={purchaseDate} onChange={e => setPurchaseDate(e.value)} dateFormat="dd/mm/yy" showIcon locale="th" className="w-full" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">ผู้ขาย</label>
            <div className="flex gap-2">
              <Dropdown value={supplierId} options={suppliers} onChange={e => setSupplierId(e.value)}
                placeholder="เลือกผู้ขาย (ไม่บังคับ)" className="flex-1" showClear filter />
              <Button icon="pi pi-plus" className="btn-cancel" onClick={addSupplier} />
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">หมายเหตุ</label>
          <InputText value={note} onChange={e => setNote(e.target.value)} className="w-full" />
        </div>
      </motion.div>

      <motion.div className="card p-5" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold text-slate-600">รายการวัตถุดิบที่ซื้อ</span>
          <Button label="เพิ่มรายการ" icon="pi pi-plus" className="btn-primary" onClick={addRow} />
        </div>

        {rows.length === 0 ? <EmptyState title="ยังไม่มีรายการ" /> : (
          <div className="space-y-3">
            <AnimatePresence>
              {rows.map((row, idx) => (
                <motion.div key={idx} className="flex items-center gap-2"
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}>
                  <Dropdown value={row.ingredient_id} options={ingredients} onChange={e => updateRow(idx, "ingredient_id", e.value)}
                    placeholder="วัตถุดิบ" className="flex-1" filter />
                  <InputNumber value={row.quantity} onValueChange={e => updateRow(idx, "quantity", e.value ?? 0)}
                    mode="decimal" maxFractionDigits={3} min={0} placeholder="จำนวน" className="w-28" />
                  <InputNumber value={row.unit_cost} onValueChange={e => updateRow(idx, "unit_cost", e.value ?? 0)}
                    mode="decimal" minFractionDigits={2} min={0} placeholder="ราคา/หน่วย" className="w-32" />
                  <span className="w-24 text-right text-sm font-semibold text-slate-600">{fmt((row.quantity || 0) * (row.unit_cost || 0))}</span>
                  <Button icon="pi pi-trash" className="btn-delete" onClick={() => removeRow(idx)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <div className="flex justify-end mt-4 pt-4 border-t" style={{ borderColor: "var(--border)" }}>
          <div className="text-right">
            <p className="text-xs text-slate-400">ยอดรวมทั้งบิล</p>
            <p className="text-2xl font-black text-slate-800">{fmt(total)}</p>
          </div>
        </div>
      </motion.div>

      <div className="flex gap-3 mt-5">
        <Button label="ยกเลิก" className="btn-cancel flex-1" icon="pi pi-times" onClick={() => history.push("/purchase")} />
        <Button label="บันทึกบิลซื้อ" className="btn-primary flex-1" icon="pi pi-check" loading={saving} onClick={save} />
      </div>
    </div>
  )
}
