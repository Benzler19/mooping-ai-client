import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Tag } from "primereact/tag"
import { Toast } from "primereact/toast"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { UserModel } from "../../models"
import { PageHeader, EmptyState } from "../../components/customComponent"

const model = new UserModel()

export default function UserView() {
  const history = useHistory()
  const toast = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = async () => {
    setLoading(true)
    const res = await model.getUserBy({ params: {} })
    setData(res.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const remove = (row) => {
    Swal.fire({
      title: `ลบผู้ใช้ "${row.username}"?`, icon: "warning", showCancelButton: true,
      confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626",
    }).then(async (r) => {
      if (!r.isConfirmed) return
      const res = await model.deleteUserById({ user_id: row.user_id })
      if (res.require) { toast.current.show({ severity: "success", summary: "ลบสำเร็จ" }); load() }
      else toast.current.show({ severity: "error", summary: "ลบไม่สำเร็จ" })
    })
  }

  const filtered = data.filter(d => (d.username || "").toLowerCase().includes(search.toLowerCase()) || (d.full_name || "").toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <Toast ref={toast} />
      <PageHeader
        title="ผู้ใช้งาน"
        subtitle={`ทั้งหมด ${data.length} คน`}
        actions={<Button label="เพิ่มผู้ใช้งาน" icon="pi pi-plus" className="btn-primary" onClick={() => history.push("/user/insert")} />}
      />

      <div className="card p-4 mb-4">
        <span className="relative w-full md:w-80 block">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
          <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาผู้ใช้งาน..." className="w-full pl-9" />
        </span>
      </div>

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <DataTable value={filtered} loading={loading} stripedRows
          emptyMessage={<EmptyState title="ยังไม่มีผู้ใช้งาน" />}
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="username" header="Username" sortable />
          <Column field="full_name" header="ชื่อ-นามสกุล" sortable />
          <Column header="สถานะ" style={{ width: 110 }}
            body={r => <Tag value={r.status ? "ใช้งาน" : "ปิด"} severity={r.status ? "success" : "danger"} />} />
          <Column header="" style={{ width: 110 }} body={r => (
            <div className="flex gap-1.5 justify-end">
              <Button icon="pi pi-pencil" className="btn-edit" onClick={() => history.push(`/user/update/${r.user_id}`)} />
              <Button icon="pi pi-trash" className="btn-delete" onClick={() => remove(r)} />
            </div>
          )} />
        </DataTable>
        </div>
      </motion.div>
    </div>
  )
}
