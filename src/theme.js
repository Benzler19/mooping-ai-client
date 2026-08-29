// จัดการโหมด Light/Dark ทั้งแอป — สลับ PrimeReact theme จริง (ไม่ใช่แค่สีพื้นหลัง)
// เพื่อให้ Dropdown/Calendar/Dialog ที่ render เป็น portal ดูถูกต้องด้วย
import darkThemeUrl from "primereact/resources/themes/lara-dark-amber/theme.css?url"

const STORAGE_KEY = "theme"
const DARK_LINK_ID = "prime-dark-theme"

export function getInitialTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === "dark" || saved === "light") return saved
  } catch (e) { /* ignore */ }
  return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

export function applyTheme(mode) {
  const isDark = mode === "dark"
  document.documentElement.classList.toggle("dark", isDark)

  let link = document.getElementById(DARK_LINK_ID)
  if (isDark) {
    if (!link) {
      link = document.createElement("link")
      link.id = DARK_LINK_ID
      link.rel = "stylesheet"
      link.href = darkThemeUrl
      document.head.appendChild(link)
    }
  } else if (link) {
    link.remove()
  }

  try { localStorage.setItem(STORAGE_KEY, mode) } catch (e) { /* ignore */ }
}

export function toggleTheme() {
  const next = document.documentElement.classList.contains("dark") ? "light" : "dark"
  applyTheme(next)
  return next
}
