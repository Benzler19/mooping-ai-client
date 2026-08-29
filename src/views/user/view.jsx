import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { UserModel } from "../../models"
import PageHeader from "../../components/customComponent/PageHeader"

const uModel = new UserModel()

export default function UserView({ SESSION }) {
  const history = useHistory()
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState("")

  const load = async () => {
    setLoading(true)
    const res = await uModel.getUserBy({ params: {} })
    setRows(res.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const remove = (row) =>
    Swal.fire({
      title: `ลบ ${row.firstname} ${row.lastname || ""}?`,
      text: "ไม่สามารถกู้คืนได้",
      icon: "warning", showCancelButton: true,
      confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return
      const res = await uModel.deleteUserById({ user_table_uuid: row.user_table_uuid })
      if (res.require) {
        Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false })
        load()
      }
    })

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <PageHeader title="ผู้ใช้งาน" subtitle="จัดการ User และกำหนดสาย"
        actions={
          <Button label="เพิ่มผู้ใช้งาน" icon="pi pi-plus" className="btn-primary h-9"
            onClick={() => history.push("/user/insert")} />
        } />

      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative w-full sm:w-72">
            <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <InputText value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, username..." className="w-full" />
          </div>
        </div>

        <DataTable value={rows} loading={loading} size="small" paginator rows={15}
          globalFilter={search} emptyMessage="ไม่มีข้อมูลผู้ใช้งาน">
          <Column header="#"         body={(_, o) => o.rowIndex + 1} style={{ width: 60 }} />
          <Column field="username"   header="Username" sortable />
          <Column field="firstname"  header="ชื่อ"    sortable />
          <Column field="lastname"   header="สกุล"   sortable />
          <Column field="role_name"  header="สิทธิ์"  sortable />
          <Column header="สาย" body={r => r.route_code
            ? <span className="font-medium">{r.route_code} – {r.route_name}</span>
            : <span className="text-slate-400 text-xs">ทุกสาย</span>} />
          <Column header="สถานะ" body={r => (
            <span className={`badge ${r.is_active ? "badge-verified" : "badge-danger"}`}>
              {r.is_active ? "ใช้งาน" : "ปิด"}
            </span>)} />
          <Column header="จัดการ" style={{ width: 110 }} body={row => (
            <div className="flex gap-2">
              <Button size="small" icon="pi pi-pencil" className="btn-edit"
                onClick={() => history.push(`/user/update/${row.user_table_uuid}`)} />
              <Button size="small" icon="pi pi-trash" className="btn-delete"
                onClick={() => remove(row)} />
            </div>)} />
        </DataTable>
      </motion.div>
    </div>
  )
}
