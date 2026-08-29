import React from "react"
import { motion } from "framer-motion"

const PageHeader = ({ title, subtitle, actions }) => (
  <motion.div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6"
    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
    <div>
      <h1 className="text-xl font-black" style={{ color: "var(--text-1)" }}>{title}</h1>
      {subtitle && <p className="text-sm mt-0.5" style={{ color: "var(--text-3)" }}>{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
  </motion.div>
)

export default PageHeader
