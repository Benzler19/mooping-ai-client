import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { Button } from "primereact/button"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { ProductModel, CategoryModel } from "../../models"
import { Enum } from "../../components/customComponent"

const pModel = new ProductModel()
const cModel = new CategoryModel()
const EMPTY = { category_id: null, product_name: "", unit: "ไม้", sale_price: 0, status: 1 }

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

export default function ProductUpsert({ match }) {
  const history = useHistory()
  const id = match?.params?.id
  const isEdit = !!id

  const [form, setForm] = useState(EMPTY)
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const f = (k, v) => setForm(p => ({ ...p, [k]: v }))

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const cRes = await cModel.getCategoryBy({ params: {} })
      setCategories((cRes.data || []).map(c => ({ label: c.category_name, value: c.category_id })))
      if (isEdit) {
        const res = await pModel.getProductById({ product_id: id })
        if (res.require && res.data[0]) setForm(res.data[0])
      }
      setLoading(false)
    }
    init()
  }, [id])

  const addCategory = async () => {
    const { value } = await Swal.fire({
      title: "เพิ่มหมวดหมู่ใหม่", input: "text", inputPlaceholder: "เช่น หมูปิ้ง, เครื่องดื่ม",
      showCancelButton: true, confirmButtonText: "เพิ่ม", cancelButtonText: "ยกเลิก",
    })
    if (!value) return
    const res = await cModel.insertCategory({ category_name: value })
    if (res.require) {
      setCategories(p => [...p, { label: value, value: res.data.category_id }])
      f("category_id", res.data.category_id)
    }
  }

  const save = async () => {
    if (!form.product_name) return Swal.fire("กรุณากรอกข้อมูลให้ครบ", "ต้องระบุชื่อเมนู", "warning")
    setSaving(true)
    const res = isEdit ? await pModel.updateProductById(form) : await pModel.insertProduct(form)
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false })
      history.push("/product")
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-sm mx-auto">
      <motion.div className="mb-6 flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => history.push("/product")}
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50"
          style={{ borderColor: "var(--border)" }}>
          <i className="pi pi-arrow-left text-xs text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">{isEdit ? "แก้ไขเมนู" : "เพิ่มเมนูใหม่"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{isEdit ? form.product_name : "กรอกข้อมูลสินค้าที่ขาย"}</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="card p-6 space-y-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}
        </div>
      ) : (
        <motion.div className="card p-5 space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Field label="ชื่อเมนู" required>
            <InputText value={form.product_name} onChange={e => f("product_name", e.target.value)}
              placeholder="เช่น หมูปิ้ง, คอหมูย่าง" className="w-full" />
          </Field>

          <Field label="หมวดหมู่">
            <div className="flex gap-2">
              <Dropdown value={form.category_id} options={categories} onChange={e => f("category_id", e.value)}
                placeholder="เลือกหมวดหมู่" className="flex-1" showClear />
              <Button icon="pi pi-plus" className="btn-cancel" onClick={addCategory} />
            </div>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="หน่วยขาย">
              <Dropdown value={form.unit} options={Enum.unitOptions} onChange={e => f("unit", e.value)} className="w-full" />
            </Field>
            <Field label="ราคาขาย (บาท)">
              <InputNumber value={form.sale_price} onValueChange={e => f("sale_price", e.value ?? 0)}
                mode="decimal" minFractionDigits={2} min={0} className="w-full" />
            </Field>
          </div>

          {isEdit && (
            <Field label="สถานะ">
              <Dropdown value={form.status} options={Enum.isActive} onChange={e => f("status", e.value)} className="w-full" />
            </Field>
          )}

          <div className="flex gap-3 pt-2">
            <Button label="ยกเลิก" className="btn-cancel flex-1" icon="pi pi-times" onClick={() => history.push("/product")} />
            <Button label={isEdit ? "บันทึกการแก้ไข" : "เพิ่มเมนู"} className="btn-primary flex-1"
              icon="pi pi-check" loading={saving} onClick={save} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
