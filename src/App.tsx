import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GlobalCanvas } from './components/canvas/GlobalCanvas';
import { Home } from './pages/Home';
import { Sandbox } from './pages/Sandbox';
import { Theory } from './pages/Theory';
import { About } from './pages/About';
import { Navbar } from './components/ui/Navbar';

function App() {
  return (
    <Router>
      <div className="relative w-full h-full flex flex-col">
        <div className="fixed inset-0 w-screen h-screen">
          <GlobalCanvas />
        </div>
        
        <Navbar />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sandbox" element={<Sandbox />} />
          <Route path="/theory" element={<Theory />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
