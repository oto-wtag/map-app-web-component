import "./App.css";
import { Route, Routes, MemoryRouter } from "react-router-dom";
import { Button } from "./components/ui/button";

import PrimaryLayout from "./layouts/primary-layout";
import HomePage from "./pages/home-page";
import CalendarPage from "./pages/calendar-page";

function App({ mapboxAccessToken }) {
  return (
    <Routes>
      <Route element={<PrimaryLayout />}>
        <Route
          path="/"
          element={<HomePage mapboxAccessToken={mapboxAccessToken} />}
        />
        <Route path="/calendar" element={<CalendarPage />} />
        {/* Add other routes here if needed, passing props accordingly */}
      </Route>
    </Routes>
  );
}

export default App;
