import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import SeConnecter from "./pages/SeConnecter";
import SEnregister from "./pages/SEnregister";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<SeConnecter />} />
      <Route path="/register" element={<SEnregister />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
