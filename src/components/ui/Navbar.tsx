import { Link, useLocation } from 'react-router-dom';

export const Navbar = () => {
  const location = useLocation();

  const getLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `text-[10px] md:text-xs uppercase tracking-widest font-mono transition-colors ${
      isActive ? 'text-cyan' : 'text-white/50 hover:text-white'
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 p-4 md:p-6 flex flex-col md:flex-row gap-4 justify-between items-center pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-6">
        <Link to="/" className="text-white font-bold tracking-tighter text-lg md:text-xl font-sans">
          SIMULACRA<span className="text-cyan">.</span>
        </Link>
        <a 
          href="https://portfolio.jamilharun.workers.dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden md:inline-block text-[10px] uppercase tracking-widest font-mono text-white/40 hover:text-white transition-colors"
        >
          Portfolio ↗
        </a>
      </div>
      
      <div className="flex gap-4 md:gap-8 pointer-events-auto bg-obsidian/40 backdrop-blur-md px-4 md:px-6 py-2 md:py-3 rounded-full border border-white/10">
        <Link to="/" className={getLinkClass('/')}>Home</Link>
        <Link to="/sandbox" className={getLinkClass('/sandbox')}>Sandbox</Link>
        <Link to="/theory" className={getLinkClass('/theory')}>Theory</Link>
        <Link to="/about" className={getLinkClass('/about')}>About</Link>
      </div>
      
      {/* Mobile portfolio link underneath the main links */}
      <div className="md:hidden pointer-events-auto mt-2">
        <a 
          href="https://portfolio.jamilharun.workers.dev/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[10px] uppercase tracking-widest font-mono text-white/40 hover:text-white transition-colors"
        >
          Portfolio ↗
        </a>
      </div>
    </nav>
  );
};
