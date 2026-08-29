const accessMenu = ({ PERMISSIONS }) => {
  const menuItems = []

  const _check = (name) => {
    if (!Array.isArray(PERMISSIONS)) return false
    return PERMISSIONS.some((p) => p.menu_name_en === name && p.permission_view === 1)
  }

  if (_check("home")) {
    menuItems.push({ name: "หน้าหลัก",    icon: "pi pi-home",         to: "/"           })

    if (_check("route"))     menuItems.push({ name: "สาย",             icon: "pi pi-map",          to: "/route"      })
    if (_check("borrower"))  menuItems.push({ name: "ผู้กู้เงิน",     icon: "pi pi-users",        to: "/borrower"   })
    if (_check("trip"))      menuItems.push({ name: "การเก็บเงิน",    icon: "pi pi-wallet",       to: "/trip"       })
    if (_check("verify"))    menuItems.push({ name: "ตรวจสอบ",        icon: "pi pi-check-circle", to: "/verify"     })
    if (_check("permission"))menuItems.push({ name: "สิทธิ์การใช้งาน",icon: "pi pi-key",          to: "/permission" })
    if (_check("user"))      menuItems.push({ name: "ผู้ใช้งาน",      icon: "pi pi-user",         to: "/user"       })
  }

  return { menuItems }
}

export default accessMenu
