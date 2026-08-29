import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Toast } from "primereact/toast"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { ExpenseModel } from "../../models"
import { PageHeader, EmptyState } from "../../components/customComponent"

const model = new ExpenseModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
const dfmt = (d) => d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "-"

export default function ExpenseView() {
  const history = useHistory()
  const toast = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await model.getExpenseBy({ params: { sorter: { field: "expense_date", order: "DESC" } } })
    setData(res.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const remove = (row) => {
    Swal.fire({
      title: "ลบรายการนี้?", icon: "warning", showCancelButton: true,
      confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626",
    }).then(async (r) => {
      if (!r.isConfirmed) return
      const res = await model.deleteExpenseById({ expense_id: row.expense_id })
      if (res.require) { toast.current.show({ severity: "success", summary: "ลบสำเร็จ" }); load() }
      else toast.current.show({ severity: "error", summary: "ลบไม่สำเร็จ" })
    })
  }

  const total = data.reduce((sum, d) => sum + Number(d.amount || 0), 0)

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <Toast ref={toast} />
      <PageHeader
        title="ค่าใช้จ่าย"
        subtitle={`รวมทั้งหมด ${fmt(total)}`}
        actions={<Button label="เพิ่มค่าใช้จ่าย" icon="pi pi-plus" className="btn-primary" onClick={() => history.push("/expense/insert")} />}
      />

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <DataTable value={data} loading={loading} stripedRows
          emptyMessage={<EmptyState title="ยังไม่มีค่าใช้จ่าย" />}
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="expense_date" header="วันที่" body={r => dfmt(r.expense_date)} sortable style={{ width: 150 }} />
          <Column field="category_name" header="หมวดหมู่" />
          <Column field="note" header="รายละเอียด" body={r => r.note || "-"} />
          <Column field="amount" header="จำนวนเงิน" body={r => fmt(r.amount)} sortable style={{ width: 140 }} />
          <Column header="" style={{ width: 110 }} body={r => (
            <div className="flex gap-1.5 justify-end">
              <Button icon="pi pi-pencil" className="btn-edit" onClick={() => history.push(`/expense/update/${r.expense_id}`)} />
              <Button icon="pi pi-trash" className="btn-delete" onClick={() => remove(r)} />
            </div>
          )} />
        </DataTable>
        </div>
      </motion.div>
    </div>
  )
}
