import "./App.css";
import Ourwedding from "./pages/ourwedding";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewRequest from "./pages/ourwedding/new";
import RevisionRequest from "./pages/ourwedding/revison";
import Login from "./pages/ourwedding/login";
import AdminLogin from "./pages/admin/login";
import AdminSignup from "./pages/admin/signup";
import Dashboard from "./pages/admin";
import RevisionForm from "./pages/ourwedding/revison/form";
import Taility from "./pages/taility";
import TailityLogin from "./pages/taility/login";
import TailityNewRequest from "./pages/taility/new";
import TailityRevisionRequest from "./pages/taility/revison";
import TailityRevisionForm from "./pages/taility/revison/form";
import WorkerDashboard from "./pages/worker";
import SubmitResult from "./pages/ourwedding/components/common/Result";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ourwedding" element={<Ourwedding />} />
        <Route path="/ourwedding/login" element={<Login />} />
        <Route path="/ourwedding/new" element={<NewRequest />} />
        <Route path="/ourwedding/revison" element={<RevisionRequest />} />
        <Route path="/ourwedding/revison/form" element={<RevisionForm />} />

        <Route path="/taility" element={<Taility />} />
        <Route path="/taility/login" element={<TailityLogin />} />
        <Route path="/taility/new" element={<TailityNewRequest />} />
        <Route path="/taility/revison" element={<TailityRevisionRequest />} />
        <Route path="/taility/revison/form" element={<TailityRevisionForm />} />

        <Route path="/result/ourwedding" element={<SubmitResult />} />

        {/* 관리자 */}
        <Route path={"/admin/*"} element={<Dashboard />} />
        <Route path={"/admin/login"} element={<AdminLogin />} />
        <Route path={"/admin/signup"} element={<AdminSignup />} />

        {/* 작업자 */}
        <Route path={"/worker/*"} element={<WorkerDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
