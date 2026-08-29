import React, { useState, useEffect } from "react"
import { useHistory } from "react-router-dom"
import { InputText } from "primereact/inputtext"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { Calendar } from "primereact/calendar"
import { Button } from "primereact/button"
import { motion } from "framer-motion"
import Swal from "sweetalert2"
import { ExpenseModel, ExpenseCategoryModel } from "../../models"

const model = new ExpenseModel()
const cModel = new ExpenseCategoryModel()
const dateToStr = (d) => d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}` : null
const strToDate = (s) => s ? new Date(String(s).slice(0, 10)) : new Date()

const Field = ({ label, required, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
      {label}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
  </div>
)

export default function ExpenseUpsert({ SESSION, match }) {
  const history = useHistory()
  const id = match?.params?.id
  const isEdit = !!id

  const [categories, setCategories] = useState([])
  const [expenseDate, setExpenseDate] = useState(new Date())
  const [categoryId, setCategoryId] = useState(null)
  const [amount, setAmount] = useState(0)
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      const cRes = await cModel.getExpenseCategoryBy({})
      setCategories((cRes.data || []).map(c => ({ label: c.category_name, value: c.expense_category_id })))
      if (isEdit) {
        const res = await model.getExpenseById({ expense_id: id })
        const row = res.data?.[0]
        if (row) {
          setExpenseDate(strToDate(row.expense_date))
          setCategoryId(row.expense_category_id)
          setAmount(Number(row.amount))
          setNote(row.note || "")
        }
      }
      setLoading(false)
    }
    init()
  }, [id])

  const addCategory = async () => {
    const { value } = await Swal.fire({
      title: "เพิ่มหมวดหมู่ค่าใช้จ่าย", input: "text", inputPlaceholder: "เช่น ค่าน้ำ, ค่าถุง",
      showCancelButton: true, confirmButtonText: "เพิ่ม", cancelButtonText: "ยกเลิก",
    })
    if (!value) return
    const res = await cModel.insertExpenseCategory({ category_name: value })
    if (res.require) {
      setCategories(p => [...p, { label: value, value: res.data.expense_category_id }])
      setCategoryId(res.data.expense_category_id)
    }
  }

  const save = async () => {
    if (!categoryId || !amount) return Swal.fire("กรุณากรอกข้อมูลให้ครบ", "ต้องระบุหมวดหมู่และจำนวนเงิน", "warning")
    setSaving(true)
    const payload = {
      expense_id: id, expense_date: dateToStr(expenseDate), expense_category_id: categoryId, amount, note,
      create_by: SESSION?.USER?.username,
    }
    const res = isEdit ? await model.updateExpenseById(payload) : await model.insertExpense(payload)
    setSaving(false)
    if (res.require) {
      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", timer: 1200, showConfirmButton: false })
      history.push("/expense")
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด" })
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-sm mx-auto">
      <motion.div className="mb-6 flex items-center gap-3" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
        <button onClick={() => history.push("/expense")}
          className="w-8 h-8 rounded-full bg-white border flex items-center justify-center hover:bg-slate-50"
          style={{ borderColor: "var(--border)" }}>
          <i className="pi pi-arrow-left text-xs text-slate-500" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900">{isEdit ? "แก้ไขค่าใช้จ่าย" : "เพิ่มค่าใช้จ่าย"}</h1>
          <p className="text-xs text-slate-400 mt-0.5">ค่าใช้จ่ายดำเนินงาน (ไม่รวมวัตถุดิบที่ซื้อผ่านหน้ารับซื้อ)</p>
        </div>
      </motion.div>

      {loading ? (
        <div className="card p-6 space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-10 w-full" />)}</div>
      ) : (
        <motion.div className="card p-5 space-y-4" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
          <Field label="วันที่">
            <Calendar value={expenseDate} onChange={e => setExpenseDate(e.value)} dateFormat="dd/mm/yy" showIcon locale="th" className="w-full" />
          </Field>

          <Field label="หมวดหมู่" required>
            <div className="flex gap-2">
              <Dropdown value={categoryId} options={categories} onChange={e => setCategoryId(e.value)}
                placeholder="เลือกหมวดหมู่" className="flex-1" />
              <Button icon="pi pi-plus" className="btn-cancel" onClick={addCategory} />
            </div>
          </Field>

          <Field label="จำนวนเงิน (บาท)" required>
            <InputNumber value={amount} onValueChange={e => setAmount(e.value ?? 0)} mode="decimal" minFractionDigits={2} min={0} className="w-full" />
          </Field>

          <Field label="รายละเอียด">
            <InputText value={note} onChange={e => setNote(e.target.value)} className="w-full" />
          </Field>

          <div className="flex gap-3 pt-2">
            <Button label="ยกเลิก" className="btn-cancel flex-1" icon="pi pi-times" onClick={() => history.push("/expense")} />
            <Button label={isEdit ? "บันทึกการแก้ไข" : "บันทึก"} className="btn-primary flex-1" icon="pi pi-check" loading={saving} onClick={save} />
          </div>
        </motion.div>
      )}
    </div>
  )
}
