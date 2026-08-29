import React from "react"
import { motion } from "framer-motion"

const Loading = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center z-[9999]"
       style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}>

    {/* Logo animate */}
    <motion.div className="flex flex-col items-center gap-2 mb-10"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}>
      <div className="text-5xl mb-1">🍢</div>
      <div className="text-4xl font-black text-white tracking-tighter">หมูปิ้ง</div>
      <div className="text-base font-medium text-orange-400 tracking-[0.4em] uppercase">Shop</div>
    </motion.div>

    {/* Bar loader */}
    <motion.div className="w-48 h-1 rounded-full overflow-hidden bg-slate-700"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}>
      <motion.div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-orange-300"
        initial={{ width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ duration: 1.5, ease: "easeInOut" }} />
    </motion.div>

    <motion.p className="mt-4 text-sm text-slate-500"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
      กำลังโหลด...
    </motion.p>
  </div>
)

export default Loading
