import './App.css'
import { AppShell } from './components/AppShell/AppShell'
import { sampleWebPresencePayload } from './samplePayload'

function App() {
  return (
    <AppShell payload={sampleWebPresencePayload} />
  )
}

export default App
