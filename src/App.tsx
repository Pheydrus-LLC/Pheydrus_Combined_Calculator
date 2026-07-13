import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components';
import {
  HomePage,
  CalculatorPage,
  ResultsPage,
  InvisibleForcesReportPage,
  InvisibleForcesResultsPage,
  InvisibleForcesDemoPage,
} from './views';
import {
  TransitsPage,
  LifePathPage,
  NumerologyPage,
  WordNumerologyPage,
  AdvancedNumerologyPage,
  NatalChartPage,
  RelocationPage,
  FengShuiPage,
  AstrocartographyPage,
  BusinessEnergyBlueprintPage,
  RewriteYourPastPage,
  BarbaultWorksheetPage,
} from './views/standalone';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Internal admin tool */}
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="calculator" element={<CalculatorPage />} />
          <Route path="results" element={<ResultsPage />} />
        </Route>
        {/* Client-facing assessment (no layout shell) */}
        <Route path="client" element={<InvisibleForcesReportPage />} />
        <Route path="client/results" element={<InvisibleForcesResultsPage />} />
        <Route path="client/demo" element={<InvisibleForcesDemoPage />} />
        {/* Standalone calculator pages (no layout shell) */}
        <Route path="transits" element={<TransitsPage />} />
        <Route path="life-path" element={<LifePathPage />} />
        <Route path="numerology" element={<NumerologyPage />} />
        <Route path="numerology/word" element={<WordNumerologyPage />} />
        <Route path="numerology/aw" element={<AdvancedNumerologyPage />} />
        <Route path="astro" element={<NatalChartPage />} />
        <Route path="relocation" element={<RelocationPage />} />
        <Route path="feng-shui" element={<FengShuiPage />} />
        <Route path="astrocartography" element={<AstrocartographyPage />} />
        <Route path="pheydrus-HD" element={<BusinessEnergyBlueprintPage />} />
        <Route path="rewrite-your-past" element={<RewriteYourPastPage />} />
        <Route path="once-in-a-century-upgrade" element={<BarbaultWorksheetPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
