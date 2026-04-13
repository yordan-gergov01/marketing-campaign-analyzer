import { Routes, Route } from 'react-router-dom'
import TopBar from './TopBar'
import DashboardPage from '../../pages/DashboardPage'
import CopyGeneratorPage from '../../pages/CopyGeneratorPage'
import MediaPlanPage from '../../pages/MediaPlanPage'

 function Layout() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <TopBar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/copy" element={<CopyGeneratorPage />} />
          <Route path="/media-plan" element={<MediaPlanPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default Layout; 