import DailyIframe from '@daily-co/daily-js'
import { DailyProvider } from '@daily-co/daily-react-hooks'
import React, { useState, useEffect } from 'react'

const DAILY_URL = ''

export default function App() {
  const [callObject, setCallObject] = useState(null)

  useEffect(() => {
    if (!DailyIframe) return

    const newCallObject = DailyIframe.createCallObject()
    setCallObject(newCallObject)
    newCallObject.join({ url: DAILY_URL })
  }, [])

  // Pass the call object as a prop to the DailyProvider
  // and render the app UI that needs access to
  // Daily React Hooks as child components
  return (
    <DailyProvider callObject={callObject}>
      <h1>hello</h1>
    </DailyProvider>
  )
}
