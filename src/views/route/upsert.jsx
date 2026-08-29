import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { RouteModel } from "../../models"
import PageHeader from "../../components/customComponent/PageHeader"

const model = new RouteModel()
const EMPTY = { route_id: null, route_code: "", route_name: "", is_active: 1 }
const activeOpts = [{ label: "ใช้งาน", value: 1 }, { label: "ไม่ใช้งาน", value: 0 }]

export default function RouteUpsert({ SESSION, match }) {
  const history  = useHistory()
  const id       = match?.params?.id
  const isEdit   = !!id
  const [form, setForm]     = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    model.getRouteById({ route_id: id }).then(res => {
      if (res.require && res.data[0]) setForm(res.data[0])
      setLoading(false)
    })
  }, [id])

  const save = async () => {
    if (!form.route_code || !form.route_name) return Swal.fire("กรุณากรอกข้อมูลให้ครบ", "", "warning")
    setSaving(true)
    const payload = { ...form, create_by: SESSION?.USER?.username, update_by: SESSION?.USER?.username }
    const res = isEdit ? await model.updateRouteById(payload) : await model.insertRoute(payload)
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false })
      history.push("/route")
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-sm mx-auto">
      <PageHeader title={isEdit ? "แก้ไขสาย" : "เพิ่มสายใหม่"} subtitle={isEdit ? `แก้ไขสาย ${form.route_code}` : "กรอกข้อมูลสาย"} />
      <motion.div className="card p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div> : (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">รหัสสาย * <span className="text-slate-400 font-normal">(3 ตัวอักษร เช่น 001)</span></label>
              <InputText value={form.route_code} maxLength={3} placeholder="001" onChange={e => f("route_code", e.target.value)} className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">ชื่อสาย *</label>
              <InputText value={form.route_name} placeholder="เช่น สาย 001" onChange={e => f("route_name", e.target.value)} className="w-full" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-slate-600">สถานะ</label>
              <Dropdown value={form.is_active} options={activeOpts} onChange={e => f("is_active", e.value)} className="w-full" />
            </div>
          </div>
        )}
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
          <Button label="ยกเลิก" className="btn-cancel" icon="pi pi-times" onClick={() => history.push("/route")} />
          <Button label={isEdit ? "บันทึกการแก้ไข" : "เพิ่มสาย"} className="btn-primary" icon="pi pi-check" loading={saving} onClick={save} />
        </div>
      </motion.div>
    </div>
  )
}
