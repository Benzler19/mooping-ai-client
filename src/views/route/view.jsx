import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { RouteModel } from "../../models"
import PageHeader from "../../components/customComponent/PageHeader"

const model = new RouteModel()

export default function RouteView({ SESSION }) {
  const history = useHistory()
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch]   = useState("")

  const load = async () => {
    setLoading(true)
    const res = await model.getRouteBy({ params: {} })
    setRows(res.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const remove = (row) =>
    Swal.fire({ title: `ลบสาย ${row.route_name}?`, icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#ef4444" })
      .then(async ({ isConfirmed }) => {
        if (!isConfirmed) return
        const res = await model.deleteRouteById({ route_id: row.route_id })
        if (res.require) { Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false }); load() }
      })

  return (
    <div className="p-4 md:p-6 max-w-screen-lg mx-auto">
      <PageHeader title="จัดการสาย" subtitle="สาย 001 – 009"
        actions={<Button label="เพิ่มสาย" icon="pi pi-plus" className="btn-primary h-9" onClick={() => history.push("/route/insert")} />} />

      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="p-4 border-b" style={{ borderColor: "var(--border)" }}>
          <div className="relative w-full sm:w-64">
            <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
            <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาสาย..." className="w-full pl-9" />
          </div>
        </div>
        <DataTable value={rows} loading={loading} size="small" globalFilter={search} emptyMessage="ไม่มีข้อมูลสาย">
          <Column header="#" body={(_, o) => o.rowIndex + 1} style={{ width: 60 }} />
          <Column field="route_code" header="รหัสสาย" sortable style={{ width: 120 }} />
          <Column field="route_name" header="ชื่อสาย"  sortable />
          <Column header="สถานะ" body={r => (
            <span className={`badge ${r.is_active ? "badge-verified" : "badge-danger"}`}>{r.is_active ? "ใช้งาน" : "ปิด"}</span>
          )} style={{ width: 110 }} />
          <Column header="จัดการ" style={{ width: 110 }} body={row => (
            <div className="flex gap-2">
              <Button size="small" icon="pi pi-pencil" className="btn-edit"   onClick={() => history.push(`/route/update/${row.route_id}`)} />
              <Button size="small" icon="pi pi-trash"  className="btn-delete" onClick={() => remove(row)} />
            </div>
          )} />
        </DataTable>
      </motion.div>
    </div>
  )
}
