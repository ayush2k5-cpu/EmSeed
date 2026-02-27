import { Routes, Route, Navigate } from 'react-router-dom'

// Screens are added by G on dev/g branch
// import Onboarding from './screens/Onboarding'
// import Compose from './screens/Compose'
// import Pulse from './screens/Pulse'
// import KillSwitch from './screens/KillSwitch'

export default function App() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans">
      <Routes>
        <Route path="/" element={<Navigate to="/compose" replace />} />
        {/* Routes registered by G */}
      </Routes>
    </div>
  )
}
