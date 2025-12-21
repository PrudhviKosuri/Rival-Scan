import { BrowserRouter, Routes, Route } from "react-router-dom"
import SplineLanding from "@/pages/SplineLanding"
import TestPage from "@/pages/TestPage"
import AnalysisInputPage from "@/pages/AnalysisInputPage"
import OverviewPage from "@/pages/OverviewPage"
import OfferingsPage from "@/pages/OfferingsPage"
import MarketSignalsPage from "@/pages/MarketSignalsPage"
import SentimentPage from "@/pages/SentimentPage"
import DocumentationPage from "@/pages/DocumentationPage"
import AlertsPage from "@/pages/AlertsPage"
import ConditionalLayout from "@/components/ConditionalLayout"
import { Toaster } from "@/components/ui/toaster"
import SalaarChat from "@/components/SalaarChat"

function App() {
  return (
    <BrowserRouter>
      <ConditionalLayout>
        <Routes>
          <Route path="/" element={<SplineLanding />} />
          <Route path="/analysis" element={<AnalysisInputPage />} />
          <Route path="/overview" element={<OverviewPage />} />
          <Route path="/offerings" element={<OfferingsPage />} />
          <Route path="/market-signals" element={<MarketSignalsPage />} />
          <Route path="/sentiment" element={<SentimentPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/alerts/:jobId" element={<AlertsPage />} />
          <Route path="/test" element={<TestPage />} />
        </Routes>
        <SalaarChat />
        <Toaster />
      </ConditionalLayout>
    </BrowserRouter>
  )
}

export default App
