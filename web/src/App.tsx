import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppShell } from './shell/AppShell';
import { Cockpit } from './cockpit/Cockpit';
import { RequestsPage } from './pages/RequestsPage';
import { OutgoingDocsPage } from './pages/OutgoingDocsPage';
import { YazismalarPage } from './pages/YazismalarPage';
import { ArxivPage } from './pages/ArxivPage';

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/cockpit" replace />} />
            <Route path="/cockpit" element={<Cockpit />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/sened" element={<OutgoingDocsPage />} />
            <Route path="/yazismalar" element={<YazismalarPage />} />
            <Route path="/arxiv" element={<ArxivPage />} />
            <Route path="*" element={<Navigate to="/cockpit" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}
