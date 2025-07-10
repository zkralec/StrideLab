import logo from './logo.svg';
import './App.css';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AthleteSignup from "./pages/AthleteSignup";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
      <Router>
  <Routes>
    <Route path="/signup" element={<AthleteSignup />} />
    <Route path="/dashboard" element={<div>Dashboard coming soon...</div>} />
  </Routes>
</Router>
    </div>
  );
}

export default App;
