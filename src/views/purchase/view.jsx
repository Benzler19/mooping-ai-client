import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Toast } from "primereact/toast"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { PurchaseModel } from "../../models"
import { PageHeader, EmptyState } from "../../components/customComponent"

const model = new PurchaseModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
const dfmt = (d) => d ? new Date(d).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "numeric" }) : "-"

export default function PurchaseView() {
  const history = useHistory()
  const toast = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [detailItems, setDetailItems] = useState([])

  const load = async () => {
    setLoading(true)
    const res = await model.getPurchaseBy({ params: { sorter: { field: "purchase_date", order: "DESC" } } })
    setData(res.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const openDetail = async (row) => {
    setDetail(row)
    const res = await model.getPurchaseById({ purchase_id: row.purchase_id })
    setDetailItems(res.data || [])
  }

  const remove = (row) => {
    Swal.fire({
      title: `ลบบิลซื้อวันที่ ${dfmt(row.purchase_date)}?`, text: "จะไม่ปรับสต็อกคืนอัตโนมัติ",
      icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก", confirmButtonColor: "#dc2626",
    }).then(async (r) => {
      if (!r.isConfirmed) return
      const res = await model.deletePurchaseById({ purchase_id: row.purchase_id })
      if (res.require) { toast.current.show({ severity: "success", summary: "ลบสำเร็จ" }); load() }
      else toast.current.show({ severity: "error", summary: "ลบไม่สำเร็จ" })
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <Toast ref={toast} />
      <PageHeader
        title="รับซื้อวัตถุดิบ"
        subtitle="บันทึกบิลซื้อเข้า สต็อกและต้นทุนเฉลี่ยจะอัปเดตอัตโนมัติ"
        actions={<Button label="บันทึกบิลซื้อ" icon="pi pi-plus" className="btn-primary" onClick={() => history.push("/purchase/insert")} />}
      />

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <DataTable value={data} loading={loading} stripedRows
          emptyMessage={<EmptyState title="ยังไม่มีบิลซื้อ" subtitle="กดบันทึกบิลซื้อเพื่อเริ่มต้น" />}
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="purchase_date" header="วันที่ซื้อ" body={r => dfmt(r.purchase_date)} sortable style={{ width: 150 }} />
          <Column field="supplier_name" header="ผู้ขาย" body={r => r.supplier_name || "-"} />
          <Column field="note" header="หมายเหตุ" body={r => r.note || "-"} />
          <Column field="total_amount" header="ยอดรวม" body={r => fmt(r.total_amount)} sortable style={{ width: 140 }} />
          <Column header="" style={{ width: 110 }} body={r => (
            <div className="flex gap-1.5 justify-end">
              <Button icon="pi pi-eye" className="btn-edit" onClick={() => openDetail(r)} />
              <Button icon="pi pi-trash" className="btn-delete" onClick={() => remove(r)} />
            </div>
          )} />
        </DataTable>
        </div>
      </motion.div>

      <Dialog header={`รายการซื้อ — ${dfmt(detail?.purchase_date)}`} visible={!!detail} onHide={() => setDetail(null)} style={{ width: '92vw', maxWidth: 480 }}>
        <div className="space-y-2">
          {detailItems.map((it, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span>{it.ingredient_name} <span className="text-slate-400">({Number(it.quantity).toLocaleString()} {it.unit} × ฿{Number(it.unit_cost).toLocaleString()})</span></span>
              <span className="font-semibold">{fmt(it.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 font-bold text-slate-800">
            <span>รวมทั้งหมด</span><span>{fmt(detail?.total_amount)}</span>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
