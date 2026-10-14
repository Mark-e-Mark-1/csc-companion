import { HashRouter, Route, Routes } from "react-router"
import { ErrorBoundary } from "./components/ErrorBoundary.tsx"
import { Shell } from "./components/Shell.tsx"
import { ConditionDetail } from "./pages/ConditionDetail.tsx"
import { Conditions } from "./pages/Conditions.tsx"
import { Home } from "./pages/Home.tsx"
import { Intake } from "./pages/Intake.tsx"
import { Lens } from "./pages/Lens.tsx"
import { NotFound } from "./pages/NotFound.tsx"
import { Practice } from "./pages/Practice.tsx"
import { PracticeCase } from "./pages/PracticeCase.tsx"
import { Screener } from "./pages/Screener.tsx"
import { SearchPage } from "./pages/SearchPage.tsx"
import { Training } from "./pages/Training.tsx"
import { TrainingDetail } from "./pages/TrainingDetail.tsx"

export default function App() {
  return (
    <ErrorBoundary>
      <HashRouter>
        <Shell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/screener" element={<Screener />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/development" element={<Lens />} />
            <Route path="/development/:stageId/:paceId" element={<Lens />} />
            <Route path="/conditions" element={<Conditions />} />
            <Route path="/conditions/:id" element={<ConditionDetail />} />
            <Route path="/training" element={<Training />} />
            <Route path="/training/:id" element={<TrainingDetail />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/practice/:id" element={<PracticeCase />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Shell>
      </HashRouter>
    </ErrorBoundary>
  )
}
