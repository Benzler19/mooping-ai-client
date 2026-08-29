import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { InputText } from "primereact/inputtext"
import { Dropdown } from "primereact/dropdown"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { BorrowerModel, RouteModel } from "../../models"
import PageHeader from "../../components/customComponent/PageHeader"

const bModel = new BorrowerModel()
const rModel = new RouteModel()
const fmt = (v) => (Number(v) || 0).toLocaleString()

export default function BorrowerView({ SESSION }) {
  const history = useHistory()
  const [rows, setRows]             = useState([])
  const [routes, setRoutes]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [search, setSearch]         = useState("")
  const [filterRoute, setFilterRoute] = useState(null)

  const loadRoutes = async () => {
    const res = await rModel.getRouteBy({ params: {} })
    setRoutes([
      { label: "ทุกสาย", value: null },
      ...(res.data || []).map(r => ({ label: `${r.route_code} – ${r.route_name}`, value: r.route_id })),
    ])
  }

  const load = async (route_id = filterRoute) => {
    setLoading(true)
    const filters = route_id ? { route_id } : {}
    const res = await bModel.getBorrowerBy({ params: { filters } })
    setRows(res.data || [])
    setLoading(false)
  }

  useEffect(() => { loadRoutes(); load() }, [])

  const remove = (row) =>
    Swal.fire({ title: `ลบ ${row.name}?`, icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#ef4444" })
      .then(async ({ isConfirmed }) => {
        if (!isConfirmed) return
        await bModel.deleteBorrowerById({ borrower_id: row.borrower_id })
        Swal.fire({ icon: "success", title: "ลบสำเร็จ", timer: 1500, showConfirmButton: false })
        load()
      })

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <PageHeader title="ผู้กู้เงิน" subtitle="จัดการรายชื่อผู้กู้แต่ละสาย"
        actions={<Button label="เพิ่มผู้กู้" icon="pi pi-plus" className="btn-primary h-9" onClick={() => history.push("/borrower/insert")} />} />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <Dropdown value={filterRoute} options={routes} onChange={e => { setFilterRoute(e.value); load(e.value) }}
          placeholder="กรองตามสาย" className="w-52" />
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none" />
          <InputText value={search} onChange={e => setSearch(e.target.value)} placeholder="ค้นหาชื่อ, สถานที่..." className="w-full pl-9" />
        </div>
      </div>

      <motion.div className="card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <DataTable value={rows} loading={loading} size="small" paginator rows={20}
          globalFilter={search} emptyMessage="ไม่มีข้อมูลผู้กู้">
          <Column header="#"            body={(_, o) => o.rowIndex + 1} style={{ width: 60 }} />
          <Column field="route_code"    header="สาย"       sortable style={{ width: 80 }} />
          <Column field="seq_no"        header="ลำดับ"     sortable style={{ width: 80 }} />
          <Column field="name"          header="ชื่อผู้กู้" sortable />
          <Column field="location"      header="สถานที่"   sortable />
          <Column header="ยอดกู้"       body={r => fmt(r.loan_amount)}         style={{ width: 130 }} />
          <Column header="งวด/วัน"      body={r => fmt(r.daily_installment)}    style={{ width: 110 }} />
          <Column header="ยอดค้าง"      body={r => <span className="font-bold text-orange-600">{fmt(r.outstanding_balance)}</span>} style={{ width: 120 }} />
          <Column header="สถานะ"        body={r => (
            <span className={`badge ${r.is_active ? "badge-verified" : "badge-danger"}`}>{r.is_active ? "ใช้งาน" : "ปิด"}</span>
          )} style={{ width: 100 }} />
          <Column header="จัดการ" style={{ width: 110 }} body={row => (
            <div className="flex gap-2">
              <Button size="small" icon="pi pi-pencil" className="btn-edit"   onClick={() => history.push(`/borrower/update/${row.borrower_id}`)} />
              <Button size="small" icon="pi pi-trash"  className="btn-delete" onClick={() => remove(row)} />
            </div>
          )} />
        </DataTable>
      </motion.div>
    </div>
  )
}
