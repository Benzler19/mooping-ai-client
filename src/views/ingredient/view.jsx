import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dialog } from "primereact/dialog"
import { Tag } from "primereact/tag"
import { Toast } from "primereact/toast"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { IngredientModel } from "../../models"
import { PageHeader, EmptyState } from "../../components/customComponent"

const model = new IngredientModel()
const fmt = (v) => (Number(v) || 0).toLocaleString(undefined, { maximumFractionDigits: 3 })

export default function IngredientView({ SESSION }) {
  const history = useHistory()
  const toast = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [adjustTarget, setAdjustTarget] = useState(null)
  const [newStock, setNewStock] = useState(0)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await model.getIngredientBy({ params: {} })
    setData(res.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = (row) => {
    Swal.fire({
      title: `ลบ "${row.ingredient_name}"?`, icon: "warning", showCancelButton: true,
      confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626",
    }).then(async (r) => {
      if (!r.isConfirmed) return
      const res = await model.deleteIngredientById({ ingredient_id: row.ingredient_id })
      if (res.require) { toast.current.show({ severity: "success", summary: "ลบสำเร็จ" }); load() }
      else toast.current.show({ severity: "error", summary: "ลบไม่ได้ อาจถูกใช้ในสูตรอยู่" })
    })
  }

  const openAdjust = (row) => { setAdjustTarget(row); setNewStock(Number(row.current_stock)); setNote("") }

  const submitAdjust = async () => {
    setSaving(true)
    const res = await model.adjustStock({
      ingredient_id: adjustTarget.ingredient_id, new_stock: newStock, note,
      create_by: SESSION?.USER?.username,
    })
    setSaving(false)
    if (res.require) {
      toast.current.show({ severity: "success", summary: "ปรับสต็อกสำเร็จ" })
      setAdjustTarget(null)
      load()
    } else {
      toast.current.show({ severity: "error", summary: "ปรับสต็อกไม่สำเร็จ" })
    }
  }

  const filtered = data.filter(d => (d.ingredient_name || "").toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <Toast ref={toast} />
      <PageHeader
        title="วัตถุดิบ/สต็อก"
        subtitle={`ทั้งหมด ${data.length} รายการ`}
        actions={<Button label="เพิ่มวัตถุดิบ" icon="pi pi-plus" className="btn-primary" onClick={() => history.push("/ingredient/insert")} />}
      />

      <div className="card p-4 mb-4">
        <span className="relative w-full md:w-80 block">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
          <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาวัตถุดิบ..." className="w-full pl-9" />
        </span>
      </div>

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <DataTable value={filtered} loading={loading} stripedRows
          emptyMessage={<EmptyState title="ยังไม่มีวัตถุดิบ" subtitle="กดเพิ่มวัตถุดิบเพื่อเริ่มต้น" />}
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="ingredient_name" header="วัตถุดิบ" sortable />
          <Column field="unit" header="หน่วย" style={{ width: 90 }} />
          <Column header="คงเหลือ" style={{ width: 140 }}
            body={r => {
              const low = Number(r.current_stock) <= Number(r.min_stock)
              return (
                <span className={`font-bold ${low ? "text-red-600" : "text-slate-700"}`}>
                  {fmt(r.current_stock)} {r.unit}
                  {low && <i className="pi pi-exclamation-triangle ml-1.5 text-xs" title="ใกล้หมด" />}
                </span>
              )
            }} />
          <Column header="ต้นทุนเฉลี่ย" style={{ width: 130 }} body={r => `฿${fmt(r.avg_cost)}`} />
          <Column field="min_stock" header="จุดสั่งซื้อขั้นต่ำ" style={{ width: 140 }} body={r => fmt(r.min_stock)} />
          <Column header="สถานะ" style={{ width: 110 }}
            body={r => <Tag value={r.status ? "ใช้งาน" : "ปิด"} severity={r.status ? "success" : "danger"} />} />
          <Column header="" style={{ width: 150 }} body={r => (
            <div className="flex gap-1.5 justify-end">
              <Button icon="pi pi-sync" className="btn-edit" tooltip="ปรับสต็อก" onClick={() => openAdjust(r)} />
              <Button icon="pi pi-pencil" className="btn-edit" onClick={() => history.push(`/ingredient/update/${r.ingredient_id}`)} />
              <Button icon="pi pi-trash" className="btn-delete" onClick={() => remove(r)} />
            </div>
          )} />
        </DataTable>
        </div>
      </motion.div>

      <Dialog header="ปรับปรุงสต็อก" visible={!!adjustTarget} onHide={() => setAdjustTarget(null)} style={{ width: '92vw', maxWidth: 420 }}>
        {adjustTarget && (
          <div className="space-y-4">
            <p className="text-sm text-slate-500">{adjustTarget.ingredient_name} — คงเหลือปัจจุบัน {fmt(adjustTarget.current_stock)} {adjustTarget.unit}</p>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">จำนวนคงเหลือจริง (นับใหม่)</label>
              <InputNumber value={newStock} onValueChange={e => setNewStock(e.value ?? 0)} mode="decimal" minFractionDigits={0} maxFractionDigits={3} min={0} className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">หมายเหตุ</label>
              <InputText value={note} onChange={e => setNote(e.target.value)} placeholder="เช่น นับสต็อกประจำเดือน, ของเสีย" className="w-full" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button label="ยกเลิก" className="btn-cancel flex-1" onClick={() => setAdjustTarget(null)} />
              <Button label="บันทึก" className="btn-primary flex-1" loading={saving} onClick={submitAdjust} />
            </div>
          </div>
        )}
      </Dialog>
    </div>
  )
}
