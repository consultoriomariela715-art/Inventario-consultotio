import React, { useState, useEffect } from 'react'
import { Mic, MicOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function VoiceDictation({ onTranscript }) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false)
    }
  }, [])

  const startListening = () => {
    if (!supported) {
      toast.error('Tu navegador no soporta dictado por voz (usa Google Chrome)')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    recognition.lang = 'es-VE'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setListening(true)
      toast('🎙️ Escuchando... Habla ahora', { icon: '👂', duration: 2500 })
    }

    recognition.onresult = (event) => {
      const text = event.results[0][0].transcript
      if (text) {
        onTranscript(text)
        toast.success('Dictado añadido')
      }
    }

    recognition.onerror = (event) => {
      console.error('Error de voz:', event.error)
      setListening(false)
      if (event.error !== 'no-speech') {
        toast.error('Error al capturar audio')
      }
    }

    recognition.onend = () => {
      setListening(false)
    }

    recognition.start()
  }

  if (!supported) return null

  return (
    <button
      type="button"
      onClick={startListening}
      className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
        listening
          ? 'bg-rose-600 text-white animate-pulse'
          : 'bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
      }`}
      title="Dictar diagnóstico con el micrófono"
    >
      {listening ? (
        <>
          <MicOff className="w-3.5 h-3.5" />
          <span>Escuchando...</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>🎙️ Dictar por Voz</span>
        </>
      )}
    </button>
  )
}
