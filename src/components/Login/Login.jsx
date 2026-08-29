import React from "react"
import { Button, InputText } from "primereact"
import { AuthConsumer } from "../../role-access/authContext"
import { motion, AnimatePresence } from "framer-motion"

const Login = () => {
  const [state, setState] = React.useState({ username: "", password: "" })

  return (
    <AuthConsumer>
      {({ _handleLogin }) => (
        <AnimatePresence mode="wait">
          <motion.form
            key="login-form"
            onSubmit={(e) => { e.preventDefault(); _handleLogin(state) }}
            className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="bg-white rounded-3xl w-[22rem] shadow-2xl overflow-hidden"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-8 py-8 text-center">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="text-4xl font-black text-white tracking-tight">
                    G-Cash
                  </div>
                  <div className="text-lg font-medium text-slate-300 tracking-widest mt-1">
                    FLOW
                  </div>
                  <div className="mt-2 h-0.5 w-12 bg-blue-400 mx-auto rounded-full" />
                </motion.div>
              </div>

              {/* Form */}
              <motion.div
                className="px-8 py-8 flex flex-col gap-5"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-600">ชื่อผู้ใช้งาน</label>
                  <div className="relative">
                    <i className="pi pi-user absolute left-0 top-2 text-slate-400" />
                    <InputText
                      className="h-9 bg-transparent border-b-2 border-slate-300 outline-none w-full pl-6 focus:border-slate-600 transition-colors"
                      placeholder="Username"
                      unstyled={true}
                      autoComplete="username"
                      onChange={(e) => setState({ ...state, username: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-sm font-semibold text-slate-600">รหัสผ่าน</label>
                  <div className="relative">
                    <i className="pi pi-lock absolute left-0 top-2 text-slate-400" />
                    <input
                      type="password"
                      className="h-9 bg-transparent border-b-2 border-slate-300 outline-none pl-6 w-full focus:border-slate-600 transition-colors"
                      placeholder="Password"
                      autoComplete="current-password"
                      onChange={(e) => setState({ ...state, password: e.target.value })}
                    />
                  </div>
                </div>

                <Button
                  label="เข้าสู่ระบบ"
                  type="submit"
                  className="mt-2 rounded-xl w-full h-10 border-none font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #1e293b, #334155)" }}
                />
              </motion.div>
            </motion.div>
          </motion.form>
        </AnimatePresence>
      )}
    </AuthConsumer>
  )
}

export default Login
