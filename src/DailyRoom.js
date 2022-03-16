import React from 'react'

import { DailyProvider } from '@daily-co/daily-react-hooks'
import DailyIframe from '@daily-co/daily-js'

function DailyRoom(props) {
  // Create an instance of the Daily call object
  const co = DailyIframe.createCallObject()

  return <DailyProvider callObject={co}>{props.children}</DailyProvider>
}

export default DailyRoom
