import "./App.css";
import Ourwedding from "./pages/ourwedding";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NewRequest from "./pages/ourwedding/new";
import RevisionRequest from "./pages/ourwedding/revison";
import Login from "./pages/ourwedding/login";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/ourwedding" element={<Ourwedding />} />
        <Route path="/ourwedding/login" element={<Login />} />
        <Route path="/ourwedding/new" element={<NewRequest />} />
        <Route path="/ourwedding/revison" element={<RevisionRequest />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
