import React, { useState, useEffect, useRef } from "react"
import { useHistory } from "react-router-dom"
import { DataTable } from "primereact/datatable"
import { Column } from "primereact/column"
import { Button } from "primereact/button"
import { Dialog } from "primereact/dialog"
import { Tag } from "primereact/tag"
import { Toast } from "primereact/toast"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { SaleOrderModel } from "../../models"
import { PageHeader, EmptyState } from "../../components/customComponent"

const model = new SaleOrderModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
const dtfmt = (d) => d ? new Date(d).toLocaleString("th-TH", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "-"

export default function SaleHistory() {
  const history = useHistory()
  const toast = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState(null)
  const [detailItems, setDetailItems] = useState([])

  const load = async () => {
    setLoading(true)
    const res = await model.getSaleOrderBy({ params: { sorter: { field: "order_datetime", order: "DESC" } } })
    setData(res.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const openDetail = async (row) => {
    const res = await model.getSaleOrderWithDetails({ order_id: row.order_id })
    if (res.require) { setDetail(res.data.order); setDetailItems(res.data.details) }
  }

  const cancelOrder = (row) => {
    Swal.fire({
      title: `ยกเลิกบิล ${row.order_no}?`, text: "วัตถุดิบจะถูกคืนกลับสต็อกทั้งหมด",
      icon: "warning", showCancelButton: true, confirmButtonText: "ยกเลิกบิล", cancelButtonText: "ปิด", confirmButtonColor: "#dc2626",
    }).then(async (r) => {
      if (!r.isConfirmed) return
      const res = await model.cancelSaleOrder({ order_id: row.order_id })
      if (res.require) { toast.current.show({ severity: "success", summary: "ยกเลิกบิลสำเร็จ" }); load() }
      else toast.current.show({ severity: "error", summary: "ยกเลิกไม่สำเร็จ" })
    })
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <Toast ref={toast} />
      <PageHeader
        title="ประวัติการขาย"
        subtitle={`ทั้งหมด ${data.length} บิล`}
        actions={<Button label="ไปหน้าขาย" icon="pi pi-arrow-left" className="btn-cancel" onClick={() => history.push("/sale")} />}
      />

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <DataTable value={data} loading={loading} stripedRows
          emptyMessage={<EmptyState title="ยังไม่มีบิลขาย" />}
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="order_no" header="เลขบิล" sortable style={{ width: 160 }} />
          <Column field="order_datetime" header="วันเวลา" body={r => dtfmt(r.order_datetime)} sortable style={{ width: 160 }} />
          <Column field="net_amount" header="ยอดสุทธิ" body={r => fmt(r.net_amount)} sortable style={{ width: 130 }} />
          <Column field="payment_method" header="ช่องทาง" body={r => r.payment_method === "cash" ? "เงินสด" : r.payment_method === "transfer" ? "โอน" : "อื่นๆ"} style={{ width: 100 }} />
          <Column field="status" header="สถานะ" style={{ width: 120 }}
            body={r => <Tag value={r.status === "paid" ? "สำเร็จ" : "ยกเลิก"} severity={r.status === "paid" ? "success" : "danger"} />} />
          <Column header="" style={{ width: 110 }} body={r => (
            <div className="flex gap-1.5 justify-end">
              <Button icon="pi pi-eye" className="btn-edit" onClick={() => openDetail(r)} />
              {r.status === "paid" && <Button icon="pi pi-times" className="btn-delete" onClick={() => cancelOrder(r)} />}
            </div>
          )} />
        </DataTable>
        </div>
      </motion.div>

      <Dialog header={`บิล ${detail?.order_no || ""}`} visible={!!detail} onHide={() => setDetail(null)} style={{ width: '92vw', maxWidth: 480 }}>
        <div className="space-y-2">
          {detailItems.map((it, i) => (
            <div key={i} className="flex justify-between text-sm py-2 border-b" style={{ borderColor: "var(--border)" }}>
              <span>{it.product_name} <span className="text-slate-400">× {it.quantity}</span></span>
              <span className="font-semibold">{fmt(it.subtotal)}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-sm text-slate-500">
            <span>ส่วนลด</span><span>-{fmt(detail?.discount)}</span>
          </div>
          <div className="flex justify-between font-bold text-slate-800">
            <span>ยอดสุทธิ</span><span>{fmt(detail?.net_amount)}</span>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
