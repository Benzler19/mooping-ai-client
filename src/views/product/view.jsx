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
import { ProductModel } from "../../models"
import { PageHeader, EmptyState } from "../../components/customComponent"

const model = new ProductModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

export default function ProductView() {
  const history = useHistory()
  const toast = useRef(null)
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const load = async () => {
    setLoading(true)
    const res = await model.getProductBy({ params: {} })
    setData(res.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const remove = (row) => {
    Swal.fire({
      title: `ลบ "${row.product_name}"?`, text: "ลบแล้วไม่สามารถกู้คืนได้",
      icon: "warning", showCancelButton: true, confirmButtonText: "ลบ", cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
    }).then(async (r) => {
      if (!r.isConfirmed) return
      const res = await model.deleteProductById({ product_id: row.product_id })
      if (res.require) { toast.current.show({ severity: "success", summary: "ลบสำเร็จ" }); load() }
      else toast.current.show({ severity: "error", summary: "ลบไม่สำเร็จ" })
    })
  }

  const filtered = data.filter(d => (d.product_name || "").toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-4 md:p-6 max-w-screen-xl mx-auto">
      <Toast ref={toast} />
      <PageHeader
        title="เมนูสินค้า"
        subtitle={`ทั้งหมด ${data.length} รายการ`}
        actions={
          <Button label="เพิ่มเมนู" icon="pi pi-plus" className="btn-primary"
            onClick={() => history.push("/product/insert")} />
        }
      />

      <div className="card p-4 mb-4">
        <span className="p-input-icon-left w-full md:w-80 relative">
          <i className="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-sm" />
          <InputText value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ค้นหาชื่อเมนู..." className="w-full pl-9" />
        </span>
      </div>

      <motion.div className="card overflow-hidden" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="overflow-x-auto">
          <DataTable value={filtered} loading={loading} stripedRows
          emptyMessage={<EmptyState title="ยังไม่มีเมนูสินค้า" subtitle="กดปุ่มเพิ่มเมนูเพื่อเริ่มต้น" />}
          paginator rows={10} rowsPerPageOptions={[10, 25, 50]}>
          <Column field="product_name" header="ชื่อเมนู" sortable />
          <Column field="category_name" header="หมวดหมู่" body={r => r.category_name || "-"} />
          <Column field="unit" header="หน่วย" style={{ width: 90 }} />
          <Column field="sale_price" header="ราคาขาย" body={r => fmt(r.sale_price)} sortable style={{ width: 140 }} />
          <Column field="status" header="สถานะ" style={{ width: 110 }}
            body={r => <Tag value={r.status ? "ขายอยู่" : "เลิกขาย"} severity={r.status ? "success" : "danger"} />} />
          <Column header="" style={{ width: 140 }} body={r => (
            <div className="flex gap-1.5 justify-end">
              <Button icon="pi pi-sliders-h" className="btn-edit" tooltip="สูตร/ต้นทุน"
                onClick={() => history.push(`/product/recipe/${r.product_id}`)} />
              <Button icon="pi pi-pencil" className="btn-edit"
                onClick={() => history.push(`/product/update/${r.product_id}`)} />
              <Button icon="pi pi-trash" className="btn-delete" onClick={() => remove(r)} />
            </div>
          )} />
        </DataTable>
        </div>
      </motion.div>
    </div>
  )
}
