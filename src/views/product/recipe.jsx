import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { Dropdown } from "primereact/dropdown"
import { InputNumber } from "primereact/inputnumber"
import { Button } from "primereact/button"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import { ProductModel, RecipeModel, IngredientModel } from "../../models"
import { EmptyState } from "../../components/customComponent"

const pModel = new ProductModel()
const rModel = new RecipeModel()
const iModel = new IngredientModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`

export default function ProductRecipe({ match }) {
  const history = useHistory()
  const id = match?.params?.id

  const [product, setProduct] = useState(null)
  const [ingredients, setIngredients] = useState([])
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      const [pRes, iRes, rRes] = await Promise.all([
        pModel.getProductById({ product_id: id }),
        iModel.getIngredientForRecipe({}),
        rModel.getRecipeByProduct({ product_id: id }),
      ])
      setProduct(pRes.data?.[0] || null)
      setIngredients((iRes.data || []).map(x => ({ label: `${x.ingredient_name} (${x.unit})`, value: x.ingredient_id, avg_cost: x.avg_cost, unit: x.unit })))
      setRows((rRes.data || []).map(x => ({ ingredient_id: x.ingredient_id, quantity_used: Number(x.quantity_used), avg_cost: Number(x.avg_cost) })))
      setLoading(false)
    }
    init()
  }, [id])

  const findIngredient = (ingredient_id) => ingredients.find(i => i.value === ingredient_id)

  const addRow = () => setRows(p => [...p, { ingredient_id: null, quantity_used: 0, avg_cost: 0 }])
  const removeRow = (idx) => setRows(p => p.filter((_, i) => i !== idx))
  const updateRow = (idx, key, value) => setRows(p => p.map((r, i) => {
    if (i !== idx) return r
    if (key === "ingredient_id") return { ...r, ingredient_id: value, avg_cost: findIngredient(value)?.avg_cost || 0 }
    return { ...r, [key]: value }
  }))

  const unitCost = rows.reduce((sum, r) => sum + (Number(r.quantity_used) || 0) * (Number(r.avg_cost) || 0), 0)
  const margin = (Number(product?.sale_price) || 0) - unitCost
  const marginPct = product?.sale_price > 0 ? (margin / product.sale_price) * 100 : 0

  const save = async () => {
    const items = rows.filter(r => r.ingredient_id && r.quantity_used > 0)
      .map(r => ({ ingredient_id: r.ingredient_id, quantity_used: r.quantity_used }))
    setSaving(true)
    const res = await rModel.saveRecipe({ product_id: id, items })
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกสูตรสำเร็จ", timer: 1200, showConfirmButton: false })
      history.push("/product")
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-md mx-auto">
      <motion.div className="mb-6 flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => history.push("/product")}
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50"
          style={{ borderColor: "var(--border)" }}>
          <i className="pi pi-arrow-left text-xs text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">สูตร/ต้นทุนวัตถุดิบ</h1>
          <p className="text-xs text-slate-400 mt-0.5">{product?.product_name} — ขาย {fmt(product?.sale_price)} / {product?.unit}</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="card p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
      ) : (
        <>
          <div className="card p-5 mb-4">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-bold text-slate-600">รายการวัตถุดิบต่อ 1 {product?.unit || "หน่วย"}</span>
              <Button label="เพิ่มวัตถุดิบ" icon="pi pi-plus" className="btn-primary" onClick={addRow} />
            </div>

            {rows.length === 0 ? (
              <EmptyState icon="pi pi-box" title="ยังไม่มีสูตร" subtitle="กดเพิ่มวัตถุดิบเพื่อคำนวณต้นทุน" />
            ) : (
              <div className="space-y-3">
                <AnimatePresence>
                  {rows.map((row, idx) => (
                    <motion.div key={idx} className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}>
                      <Dropdown value={row.ingredient_id} options={ingredients}
                        onChange={e => updateRow(idx, "ingredient_id", e.value)}
                        placeholder="เลือกวัตถุดิบ" className="flex-1" filter />
                      <InputNumber value={row.quantity_used} onValueChange={e => updateRow(idx, "quantity_used", e.value ?? 0)}
                        mode="decimal" minFractionDigits={0} maxFractionDigits={4} min={0}
                        className="w-32" placeholder="จำนวน" />
                      <Button icon="pi pi-trash" className="btn-delete" onClick={() => removeRow(idx)} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>

          <motion.div className="rounded-2xl p-5 border"
            style={{ background: margin >= 0 ? "#f0fdf4" : "#fef2f2", borderColor: margin >= 0 ? "#bbf7d0" : "#fecaca" }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-slate-500">ต้นทุน/หน่วย</p>
                <p className="text-lg font-black text-slate-800">{fmt(unitCost)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">ราคาขาย</p>
                <p className="text-lg font-black text-slate-800">{fmt(product?.sale_price)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500">กำไร/หน่วย</p>
                <p className={`text-lg font-black ${margin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {fmt(margin)} ({marginPct.toFixed(0)}%)
                </p>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 mt-5">
            <Button label="ยกเลิก" className="btn-cancel flex-1" icon="pi pi-times" onClick={() => history.push("/product")} />
            <Button label="บันทึกสูตร" className="btn-primary flex-1" icon="pi pi-check" loading={saving} onClick={save} />
          </div>
        </>
      )}
    </div>
  )
}
