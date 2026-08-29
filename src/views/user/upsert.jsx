import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { UserModel } from "../../models"
import { Enum } from "../../components/customComponent"

const model = new UserModel()
const EMPTY = { username: "", password: "", full_name: "", status: 1 }

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

export default function UserUpsert({ SESSION, match }) {
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
      const res = await model.getUserById({ user_id: id })
      if (res.require && res.data[0]) setForm({ ...res.data[0], password: "" })
      setLoading(false)
    }
    init()
  }, [id])

  const save = async () => {
    if (!form.username || !form.full_name) return Swal.fire("กรุณากรอกข้อมูลให้ครบ", "ต้องระบุ Username และชื่อ-นามสกุล", "warning")
    if (!isEdit && !form.password) return Swal.fire("กรุณากรอกรหัสผ่าน", "", "warning")

    setSaving(true)
    const payload = { ...form, create_by: SESSION?.USER?.username, update_by: SESSION?.USER?.username }
    const res = isEdit ? await model.updateUserById({ ...payload, user_id: id }) : await model.insertUser(payload)
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false })
      history.push("/user")
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-sm mx-auto">
      <motion.div className="mb-6 flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => history.push("/user")}
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50"
          style={{ borderColor: "var(--border)" }}>
          <i className="pi pi-arrow-left text-xs text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">{isEdit ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{isEdit ? form.full_name : "กรอกข้อมูลผู้ใช้งานที่จะเข้าระบบ"}</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="card p-6 space-y-4">{[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
      ) : (
        <motion.div className="card p-5 space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Field label="ชื่อ-นามสกุล" required>
            <InputText value={form.full_name} onChange={e => f("full_name", e.target.value)} className="w-full" />
          </Field>

          <Field label="Username" required>
            <InputText value={form.username} onChange={e => f("username", e.target.value)} disabled={isEdit} className="w-full" />
          </Field>

          <Field label={isEdit ? "รหัสผ่านใหม่ (เว้นว่าง = ไม่เปลี่ยน)" : "รหัสผ่าน"} required={!isEdit}>
            <InputText type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder="••••••••" className="w-full" />
          </Field>

          {isEdit && (
            <Field label="สถานะ">
              <Dropdown value={form.status} options={Enum.isActive} onChange={e => f("status", e.value)} className="w-full" />
            </Field>
          )}

          <div className="flex gap-3 pt-2">
            <Button label="ยกเลิก" className="btn-cancel flex-1" icon="pi pi-times" onClick={() => history.push("/user")} />
            <Button label={isEdit ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้งาน"} className="btn-primary flex-1" icon="pi pi-check" loading={saving} onClick={save} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
