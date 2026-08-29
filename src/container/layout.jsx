import React, { useState } from "react"
import { Header, Sidebar, Content } from "./index"
import { AuthConsumer } from "../role-access/authContext"
const Login = React.lazy(() => import("../components/Login/Login"))

function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <AuthConsumer>
      {({ authenticated, user, permissions, _handleLogout }) =>
        authenticated ? (
          <div className="min-h-screen" style={{ background: "var(--surface)" }}>
            <Sidebar
              PERMISSIONS={permissions}
              mobileOpen={mobileOpen}
              handleSidebarToggle={() => setMobileOpen(v => !v)}
            />
            <Header handleSidebarToggle={() => setMobileOpen(v => !v)} />
            <main
              className="transition-all duration-300"
              style={{
                marginLeft: "var(--sidebar-w)",
                paddingTop: "var(--header-h)",
                minHeight: "100vh",
              }}>
              <Content USER={user} PERMISSIONS={permissions} handleLogout={_handleLogout} />
            </main>
          </div>
        ) : (
          <React.Suspense fallback={null}>
            <Login />
          </React.Suspense>
        )
      }
    </AuthConsumer>
  )
}

export default Layout
