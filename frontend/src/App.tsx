import { Routes, Route } from 'react-router-dom'
import SdkLandingPage from './pages/SdkLandingPage'
import DashboardPage from './pages/DashboardPage'
import DiscSurveyPage from './pages/DiscSurveyPage'
import ProfileRevealPage from './pages/ProfileRevealPage'
import EmojiTapPage from './pages/EmojiTapPage'

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<SdkLandingPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/onboarding" element={<DiscSurveyPage />} />
            <Route path="/profile" element={<ProfileRevealPage />} />
            <Route path="/tap" element={<EmojiTapPage />} />
        </Routes>
    )
}
