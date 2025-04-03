import "./App.css";
import Ourwedding from "./pages/ourwedding";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewRequest from "./pages/ourwedding/new";
import RevisionRequest from "./pages/ourwedding/revison";
import Login from "./pages/ourwedding/login";
import AdminLogin from "./pages/admin/login";
import AdminSignup from "./pages/admin/signup";
import Dashboard from "./pages/admin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ourwedding" element={<Ourwedding />} />
        <Route path="/ourwedding/login" element={<Login />} />
        <Route path="/ourwedding/new" element={<NewRequest />} />
        <Route path="/ourwedding/revison" element={<RevisionRequest />} />

        {/* 관리자 */}
        <Route path={"/admin/*"} element={<Dashboard />} />
        <Route path={"/admin/login"} element={<AdminLogin />} />
        <Route path={"/admin/signup"} element={<AdminSignup />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
