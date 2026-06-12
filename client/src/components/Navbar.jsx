import { NavLink } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="site-logo">🎪 ROYAL RUMBLE 2026</div>
      <nav>
        <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>Home</NavLink>
        <NavLink to="/wrestlers" className={({ isActive }) => isActive ? 'active' : ''}>Wrestlers</NavLink>
        <NavLink to="/builder" className={({ isActive }) => isActive ? 'active' : ''}>Builder</NavLink>
        <NavLink to="/predictions" className={({ isActive }) => isActive ? 'active' : ''}>AI Predict</NavLink>
        <NavLink to="/simulate" className={({ isActive }) => isActive ? 'active' : ''}>Simulate</NavLink>
        <NavLink to="/results" className={({ isActive }) => isActive ? 'active' : ''}>Results</NavLink>
      </nav>
    </header>
  );
}
