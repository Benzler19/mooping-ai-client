const accessMenu = () => {
  const menuItems = [
    { name: "หน้าหลัก",       icon: "pi pi-home",        to: "/"          },
    { name: "ขายสินค้า",      icon: "pi pi-shopping-cart", to: "/sale"    },
    { name: "เมนูสินค้า",     icon: "pi pi-list",        to: "/product"   },
    { name: "วัตถุดิบ/สต็อก", icon: "pi pi-box",         to: "/ingredient" },
    { name: "รับซื้อวัตถุดิบ", icon: "pi pi-truck",      to: "/purchase"  },
    { name: "ค่าใช้จ่าย",     icon: "pi pi-wallet",      to: "/expense"   },
    { name: "รายงานสรุปผล",   icon: "pi pi-chart-line",  to: "/report"    },
    { name: "ผู้ใช้งาน",      icon: "pi pi-user",        to: "/user"      },
  ]

  return { menuItems }
}

export default accessMenu
