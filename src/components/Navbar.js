import React, { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [hovered, setHovered] = useState(null);

  const styles = {
    navbar: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '1rem',
      background: '#000',
      borderBottom: '2px solid #333',
    },
    navLink: (isHovered) => ({
      margin: '0 1rem',
      color: isHovered ? '#ccc' : '#fff',
      textDecoration: 'none',
      fontSize: '1.2rem',
      fontWeight: '500',
      transition: 'color 0.3s ease',
    }),
  };

  return (
    <nav style={styles.navbar}>
      {['/', '/demo', '/visualizer', '/player'].map((path, index) => (
        <Link
          key={index}
          to={path}
          style={styles.navLink(hovered === index)}
          onMouseEnter={() => setHovered(index)}
          onMouseLeave={() => setHovered(null)}
        >
          {['Home', 'Create Music', 'Music Editor', 'Simple Midi Player'][index]}
        </Link>
      ))}
    </nav>
  );
}
