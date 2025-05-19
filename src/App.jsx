import "./App.css";
import { Route, Routes, MemoryRouter } from "react-router-dom";

import PrimaryLayout from "./layouts/primary-layout";
import HomePage from "./pages/home-page";

function App({ mapboxAccessToken }) {
  return (
    <Routes>
      <Route element={<PrimaryLayout />}>
        <Route
          path="/"
          element={<HomePage mapboxAccessToken={mapboxAccessToken} />}
        />
        {/* Add other routes here if needed, passing props accordingly */}
      </Route>
    </Routes>
  );
}

export default App;
