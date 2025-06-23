import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={{ padding: '1rem', background: '#eee' }}>
      <Link to="/" style={{ marginRight: '1rem' }}>Home</Link>
      <Link to="/demo">Create Music</Link>
      <Link to="/visualizer">Music Editor</Link>
      {/* <Link to="/instrument">Instrument</Link> */}
      <Link to="/player">Simple Midi Player</Link>
    </nav>
  );
}