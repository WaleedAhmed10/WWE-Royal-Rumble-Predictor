import { NavLink } from 'react-router-dom';
import { IMAGES } from '../constants/images';

export default function Navbar() {
  return (
    <header className="site-header">
      <img src={IMAGES.banner} alt="Royal Rumble 2027" className="site-banner" />
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
