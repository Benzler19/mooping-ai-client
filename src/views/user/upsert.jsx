import React, { useState, useEffect } from "react"
import { useHistory, useParams } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { UserModel, RoleModel, RouteModel } from "../../models"
import PageHeader from "../../components/customComponent/PageHeader"

const uModel  = new UserModel()
const rModel  = new RoleModel()
const rtModel = new RouteModel()

const EMPTY = {
  user_table_uuid: null,
  username: "", password: "",
  firstname: "", lastname: "",
  role_id: null, route_id: null, is_active: 1,
}

const isActiveOptions = [
  { label: "ใช้งาน",    value: 1 },
  { label: "ไม่ใช้งาน", value: 0 },
]

export default function UserUpsert({ SESSION, match }) {
  const history   = useHistory()
  const { uuid }  = match?.params || {}
  const isEdit    = !!uuid

  const [form, setForm]     = useState(EMPTY)
  const [roles, setRoles]   = useState([])
  const [routes, setRoutes] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const [r, rt] = await Promise.all([
        rModel.getRoleBy({ params: {} }),
        rtModel.getRouteBy({ params: {} }),
      ])
      setRoles((r.data || []).map(x => ({ label: x.role_name, value: x.role_id })))
      setRoutes([
        { label: "ทุกสาย (Admin)", value: null },
        ...(rt.data || []).map(x => ({ label: `${x.route_code} – ${x.route_name}`, value: x.route_id })),
      ])

      if (isEdit) {
        const res = await uModel.getUserById({ user_table_uuid: uuid })
        if (res.require && res.data[0]) setForm({ ...res.data[0], password: "" })
      }
      setLoading(false)
    }
    init()
  }, [uuid])

  const save = async () => {
    if (!form.username || !form.firstname || !form.role_id)
      return Swal.fire("กรุณากรอกข้อมูลให้ครบ", "Username, ชื่อ และสิทธิ์จำเป็นต้องระบุ", "warning")
    if (!isEdit && !form.password)
      return Swal.fire("กรุณากรอกรหัสผ่าน", "", "warning")

    setSaving(true)
    const payload = { ...form, create_by: SESSION?.USER?.username, update_by: SESSION?.USER?.username }
    const res = isEdit
      ? await uModel.updateUserById(payload)
      : await uModel.insertUser(payload)
    setSaving(false)

    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1500, showConfirmButton: false })
      history.push("/user")
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "กรุณาลองใหม่" })
    }
  }

  const fields = [
    {
      label: "ชื่อ *", col: 1,
      node: <InputText value={form.firstname} onChange={e => f("firstname", e.target.value)} placeholder="ชื่อจริง" className="w-full" />,
    },
    {
      label: "สกุล", col: 1,
      node: <InputText value={form.lastname} onChange={e => f("lastname", e.target.value)} placeholder="นามสกุล" className="w-full" />,
    },
    {
      label: "Username *", col: 1,
      node: <InputText value={form.username} onChange={e => f("username", e.target.value)} placeholder="username" className="w-full" disabled={isEdit} />,
    },
    {
      label: isEdit ? "รหัสผ่านใหม่ (เว้นว่าง = ไม่เปลี่ยน)" : "รหัสผ่าน *", col: 1,
      node: <InputText type="password" value={form.password} onChange={e => f("password", e.target.value)} placeholder="••••••••" className="w-full" />,
    },
    {
      label: "สิทธิ์ *", col: 1,
      node: <Dropdown value={form.role_id} options={roles} onChange={e => f("role_id", e.value)} placeholder="เลือกสิทธิ์" className="w-full" />,
    },
    {
      label: "สาย (Collector)", col: 1,
      node: <Dropdown value={form.route_id} options={routes} onChange={e => f("route_id", e.value)} placeholder="เลือกสาย" className="w-full" />,
    },
    {
      label: "สถานะ", col: 1,
      node: <Dropdown value={form.is_active} options={isActiveOptions} onChange={e => f("is_active", e.value)} className="w-full" />,
    },
  ]

  return (
    <div className="p-4 md:p-6 max-w-screen-sm mx-auto">
      <PageHeader
        title={isEdit ? "แก้ไขผู้ใช้งาน" : "เพิ่มผู้ใช้งานใหม่"}
        subtitle={isEdit ? `แก้ไขข้อมูล ${form.firstname || ""}` : "กรอกข้อมูลผู้ใช้งาน"}
      />

      <motion.div className="card p-6" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {fields.map(({ label, node }) => (
              <div key={label} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-slate-600">{label}</label>
                {node}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 mt-8 pt-5 border-t" style={{ borderColor: "var(--border)" }}>
          <Button label="ยกเลิก" className="btn-cancel" icon="pi pi-times"
            onClick={() => history.push("/user")} />
          <Button label={isEdit ? "บันทึกการแก้ไข" : "เพิ่มผู้ใช้งาน"}
            className="btn-primary" icon="pi pi-check"
            loading={saving} onClick={save} />
        </div>
      </motion.div>
    </div>
  )
}
