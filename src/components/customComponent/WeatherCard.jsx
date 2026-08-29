import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"

// ค่าเริ่มต้นถ้าเบราว์เซอร์ขอตำแหน่งไม่ได้ (กรุงเทพฯ)
const DEFAULT_LOCATION = { lat: 13.7563, lon: 100.5018, name: "กรุงเทพมหานคร" }

// อ้างอิงรหัสสภาพอากาศ WMO ของ Open-Meteo
const WEATHER_INFO = {
  0:  { emoji: "☀️", label: "ท้องฟ้าแจ่มใส" },
  1:  { emoji: "🌤️", label: "แจ่มใสเป็นส่วนใหญ่" },
  2:  { emoji: "⛅", label: "มีเมฆบางส่วน" },
  3:  { emoji: "☁️", label: "มีเมฆมาก" },
  45: { emoji: "🌫️", label: "มีหมอก" },
  48: { emoji: "🌫️", label: "มีหมอกน้ำแข็ง" },
  51: { emoji: "🌦️", label: "ฝนตกปรอยๆ เบา", rain: true },
  53: { emoji: "🌦️", label: "ฝนตกปรอยๆ", rain: true },
  55: { emoji: "🌦️", label: "ฝนตกปรอยๆ หนัก", rain: true },
  61: { emoji: "🌧️", label: "ฝนตกเบา", rain: true },
  63: { emoji: "🌧️", label: "ฝนตกปานกลาง", rain: true },
  65: { emoji: "🌧️", label: "ฝนตกหนัก", rain: true },
  80: { emoji: "🌧️", label: "ฝนเป็นช่วงๆ เบา", rain: true },
  81: { emoji: "🌧️", label: "ฝนเป็นช่วงๆ", rain: true },
  82: { emoji: "🌧️", label: "ฝนเป็นช่วงๆ หนัก", rain: true },
  95: { emoji: "⛈️", label: "พายุฝนฟ้าคะนอง", storm: true },
  96: { emoji: "⛈️", label: "พายุฝนฟ้าคะนองมีลูกเห็บ", storm: true },
  99: { emoji: "⛈️", label: "พายุฝนฟ้าคะนองรุนแรง", storm: true },
}
const getWeatherInfo = (code) => WEATHER_INFO[code] || { emoji: "🌡️", label: "ไม่ทราบสภาพอากาศ" }

const getVerdict = ({ code, precipProb, tempMax }) => {
  const info = getWeatherInfo(code)
  if (info.storm || precipProb >= 70) {
    return { severity: "danger", text: "ฝนตกหนัก/พายุ — วันนี้ขายลำบาก เตรียมที่กำบังหรือเลื่อนออกร้านช้าหน่อย" }
  }
  if (info.rain || precipProb >= 40) {
    return { severity: "warning", text: "มีโอกาสฝนตก — เตรียมผ้าใบหรือร่มกันฝนไว้ด้วย" }
  }
  if (tempMax >= 38) {
    return { severity: "warning", text: "อากาศร้อนจัด — เตรียมน้ำดื่มและร่มบังแดดให้ลูกค้าเยอะๆ" }
  }
  return { severity: "success", text: "อากาศดี ขายได้สบายทั้งวัน" }
}

const SEVERITY_STYLE = {
  success: { bg: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
  warning: { bg: "#fffbeb", border: "#fde68a", text: "#b45309" },
  danger:  { bg: "#fef2f2", border: "#fecaca", text: "#b91c1c" },
}

export default function WeatherCard() {
  const [weather, setWeather] = useState(null)
  const [locationName, setLocationName] = useState(DEFAULT_LOCATION.name)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const load = async ({ lat, lon }) => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=1`
        const res = await fetch(url)
        const json = await res.json()
        setWeather({
          currentTemp: json.current?.temperature_2m,
          code: json.daily?.weather_code?.[0] ?? json.current?.weather_code,
          tempMax: json.daily?.temperature_2m_max?.[0],
          tempMin: json.daily?.temperature_2m_min?.[0],
          precipProb: json.daily?.precipitation_probability_max?.[0] ?? 0,
        })
      } catch (e) {
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocationName("ตำแหน่งปัจจุบัน"); load({ lat: pos.coords.latitude, lon: pos.coords.longitude }) },
        () => load(DEFAULT_LOCATION),
        { timeout: 4000 }
      )
    } else {
      load(DEFAULT_LOCATION)
    }
  }, [])

  if (loading) {
    return <div className="card p-5"><div className="skeleton h-24 w-full" /></div>
  }
  if (error || !weather) {
    return null
  }

  const info = getWeatherInfo(weather.code)
  const verdict = getVerdict({ code: weather.code, precipProb: weather.precipProb, tempMax: weather.tempMax })
  const style = SEVERITY_STYLE[verdict.severity]

  return (
    <motion.div className="card p-5" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold" style={{ color: "var(--text-2)" }}>อากาศวันนี้ · {locationName}</h2>
      </div>

      <div className="flex items-center gap-4 mb-4">
        <div className="text-5xl leading-none">{info.emoji}</div>
        <div>
          <p className="text-2xl font-black" style={{ color: "var(--text-1)" }}>
            {Math.round(weather.currentTemp ?? weather.tempMax)}°C
          </p>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>{info.label}</p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-3)" }}>
            สูงสุด {Math.round(weather.tempMax)}° · ต่ำสุด {Math.round(weather.tempMin)}° · ฝน {weather.precipProb}%
          </p>
        </div>
      </div>

      <div className="rounded-xl px-4 py-3 text-sm font-semibold flex items-start gap-2"
        style={{ background: style.bg, border: `1px solid ${style.border}`, color: style.text }}>
        <i className={`pi ${verdict.severity === "success" ? "pi-check-circle" : "pi-exclamation-triangle"} mt-0.5`} />
        <span>{verdict.text}</span>
      </div>
    </motion.div>
  )
}
