import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Wrestlers from './pages/Wrestlers';
import Builder from './pages/Builder';
import Simulate from './pages/Simulate';
import Results from './pages/Results';
import Predictions from './pages/Predictions';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/wrestlers" element={<Wrestlers />} />
        <Route path="/builder" element={<Builder />} />
        <Route path="/simulate" element={<Simulate />} />
        <Route path="/results" element={<Results />} />
        <Route path="/predictions" element={<Predictions />} />
      </Routes>
      <footer>
        <p>WWE Royal Rumble Predictor - MERN Stack + AI | Fan Project | Not affiliated with WWE</p>
      </footer>
    </>
  );
}
