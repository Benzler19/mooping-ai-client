import React, { useState, useEffect, useMemo } from "react"
import { useHistory } from "react-router-dom"
import { Button } from "primereact/button"
import { InputNumber } from "primereact/inputnumber"
import { Dropdown } from "primereact/dropdown"
import { Dialog } from "primereact/dialog"
import { motion, AnimatePresence } from "framer-motion"
import Swal from "sweetalert2"
import { ProductModel, SaleOrderModel } from "../../models"
import { EmptyState } from "../../components/customComponent"
import { paymentMethod } from "../../components/customComponent/Enum"

const pModel = new ProductModel()
const sModel = new SaleOrderModel()
const fmt = (v) => `฿${(Number(v) || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
const today = () => new Date().toISOString().slice(0, 10)

export default function SalePos({ SESSION }) {
  const history = useHistory()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [category, setCategory] = useState("ทั้งหมด")
  const [cart, setCart] = useState([])
  const [discount, setDiscount] = useState(0)
  const [payment, setPayment] = useState("cash")
  const [saving, setSaving] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await pModel.getProductForSale({})
    setProducts(res.data || [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  const categories = useMemo(() => ["ทั้งหมด", ...new Set(products.map(p => p.category_name || "อื่นๆ"))], [products])
  const shownProducts = category === "ทั้งหมด" ? products : products.filter(p => (p.category_name || "อื่นๆ") === category)

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(c => c.product_id === product.product_id)
      if (existing) return prev.map(c => c.product_id === product.product_id ? { ...c, quantity: c.quantity + 1 } : c)
      return [...prev, { ...product, quantity: 1 }]
    })
  }
  const updateQty = (product_id, qty) => {
    if (qty <= 0) return setCart(prev => prev.filter(c => c.product_id !== product_id))
    setCart(prev => prev.map(c => c.product_id === product_id ? { ...c, quantity: qty } : c))
  }
  const removeItem = (product_id) => setCart(prev => prev.filter(c => c.product_id !== product_id))
  const clearCart = () => { setCart([]); setDiscount(0) }

  const itemCount = cart.reduce((sum, c) => sum + c.quantity, 0)
  const subtotal = cart.reduce((sum, c) => sum + Number(c.sale_price) * c.quantity, 0)
  const net = Math.max(0, subtotal - (Number(discount) || 0))

  const checkout = async () => {
    if (cart.length === 0) return
    const result = await Swal.fire({
      title: "ยืนยันการขาย?", text: `ยอดสุทธิ ${fmt(net)}`,
      icon: "question", showCancelButton: true, confirmButtonText: "ยืนยันขาย", cancelButtonText: "ยกเลิก", confirmButtonColor: "#ea580c",
    })
    if (!result.isConfirmed) return

    setSaving(true)
    const res = await sModel.insertSaleOrder({
      order_date: today(), discount, payment_method: payment,
      items: cart.map(c => ({ product_id: c.product_id, quantity: c.quantity, unit_price: c.sale_price })),
      create_by: SESSION?.USER?.username,
    })
    setSaving(false)

    if (res.require) {
      await Swal.fire({ icon: "success", title: "ขายสำเร็จ 🎉", text: `เลขบิล ${res.data.order_no}`, timer: 1800, showConfirmButton: false })
      clearCart()
      setCartOpen(false)
    } else {
      Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ตรวจสอบวัตถุดิบ/สต็อกอีกครั้ง" })
    }
  }

  const CartBody = () => (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-600">รายการขาย ({cart.length})</h2>
        {cart.length > 0 && <button onClick={clearCart} className="text-xs text-red-500 font-semibold hover:underline">ล้างตะกร้า</button>}
      </div>

      {cart.length === 0 ? (
        <EmptyState icon="pi pi-shopping-cart" title="ยังไม่มีรายการ" subtitle="แตะเมนูเพื่อเพิ่ม" />
      ) : (
        <div className="space-y-3 max-h-[38vh] overflow-y-auto pr-1">
          <AnimatePresence>
            {cart.map(item => (
              <motion.div key={item.product_id} className="flex items-center gap-2"
                initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, height: 0 }}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">{item.product_name}</p>
                  <p className="text-xs text-slate-400">{fmt(item.sale_price)} × {item.quantity}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-sm font-bold transition-transform">−</button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                    className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 text-sm font-bold transition-transform">+</button>
                </div>
                <span className="w-16 text-right text-sm font-bold text-slate-700 shrink-0">{fmt(item.sale_price * item.quantity)}</span>
                <button onClick={() => removeItem(item.product_id)} className="text-slate-300 hover:text-red-500 p-1">
                  <i className="pi pi-times text-xs" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <div className="border-t mt-4 pt-4 space-y-3" style={{ borderColor: "var(--border)" }}>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">ยอดรวม</span>
          <span className="font-semibold">{fmt(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500">ส่วนลด</span>
          <InputNumber value={discount} onValueChange={e => setDiscount(e.value ?? 0)} mode="decimal" min={0} className="w-28" inputClassName="text-right" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm text-slate-500">ช่องทางชำระ</span>
          <Dropdown value={payment} options={paymentMethod} onChange={e => setPayment(e.value)} className="w-36" />
        </div>
        <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: "var(--border)" }}>
          <span className="font-bold text-slate-700">ยอดสุทธิ</span>
          <span className="text-2xl font-black" style={{ color: "var(--accent)" }}>{fmt(net)}</span>
        </div>
        <Button label="ยืนยันการขาย" icon="pi pi-check" className="btn-primary w-full" style={{ height: 46 }}
          disabled={cart.length === 0} loading={saving} onClick={checkout} />
      </div>
    </>
  )

  return (
    <div className="p-4 md:p-6 pb-28 lg:pb-6 max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5">
      {/* ─── เลือกสินค้า ─── */}
      <div>
        <div className="flex items-center justify-between mb-4 gap-2">
          <div>
            <h1 className="text-xl font-black text-slate-900">ขายสินค้า</h1>
            <p className="text-xs text-slate-400 mt-0.5 hidden sm:block">แตะเมนูเพื่อเพิ่มลงบิล</p>
          </div>
          <Button label="ประวัติ" icon="pi pi-history" className="btn-cancel shrink-0" onClick={() => history.push("/sale/history")} />
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors shrink-0"
              style={category === c
                ? { background: "var(--accent)", color: "#fff" }
                : { background: "#fff", color: "var(--text-2)", border: "1.5px solid var(--border)" }}>
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-28 w-full rounded-2xl" />)}
          </div>
        ) : shownProducts.length === 0 ? (
          <EmptyState icon="pi pi-shopping-bag" title="ยังไม่มีเมนูขาย" subtitle="ไปเพิ่มเมนูสินค้าก่อน" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {shownProducts.map(p => (
              <motion.button key={p.product_id} onClick={() => addToCart(p)}
                whileTap={{ scale: 0.96 }}
                className="card card-hover p-4 text-left">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-2" style={{ background: "#fff7ed" }}>
                  <i className="pi pi-circle-fill text-xs" style={{ color: "var(--accent)" }} />
                </div>
                <p className="text-sm font-bold text-slate-800 leading-tight">{p.product_name}</p>
                <p className="text-xs text-slate-400 mt-1">/{p.unit}</p>
                <p className="text-base font-black mt-2" style={{ color: "var(--accent)" }}>{fmt(p.sale_price)}</p>
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* ─── ตะกร้า: การ์ดข้างหน้าจอ (desktop/tablet แนวนอน) ─── */}
      <motion.div className="hidden lg:block card p-5 h-fit sticky top-6" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}>
        <CartBody />
      </motion.div>

      {/* ─── ตะกร้า: bottom sheet (มือถือ/แท็บเล็ตแนวตั้ง) ─── */}
      <AnimatePresence>
        {itemCount > 0 && !cartOpen && (
          <motion.button onClick={() => setCartOpen(true)}
            initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
            className="lg:hidden fixed bottom-4 left-4 right-4 z-[7] rounded-2xl px-5 py-4 flex items-center justify-between shadow-xl"
            style={{ background: "var(--accent)" }}>
            <span className="text-white font-bold text-sm flex items-center gap-2">
              <i className="pi pi-shopping-cart" /> {itemCount} รายการ
            </span>
            <span className="text-white font-black text-base">{fmt(net)} · ดูตะกร้า</span>
          </motion.button>
        )}
      </AnimatePresence>

      <Dialog visible={cartOpen} onHide={() => setCartOpen(false)} position="bottom"
        header="ตะกร้าสินค้า" className="lg:hidden" style={{ width: "100vw", maxWidth: "100vw", margin: 0 }}>
        <CartBody />
      </Dialog>
    </div>
  )
}
