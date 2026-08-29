import React from "react"
import { motion } from "framer-motion"

const EmptyState = ({ icon = "pi pi-inbox", title = "ไม่มีข้อมูล", subtitle }) => (
  <motion.div className="flex flex-col items-center justify-center py-16 gap-3"
    initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
    <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-100">
      <i className={`${icon} text-2xl text-slate-400`} />
    </div>
    <p className="font-semibold text-slate-500">{title}</p>
    {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
  </motion.div>
)

export default EmptyState
