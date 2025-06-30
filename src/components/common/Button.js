import React from "react";

const buttonStyles = {
  display: "inline-block",
  padding: "12px 24px",
  border: "2px solid #000",
  background: "none",
  color: "#000",
  textAlign: "center",
  fontSize: "16px",
  fontWeight: "bold",
  textTransform: "uppercase",
  letterSpacing: "1px",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "all 0.3s ease",
};

const hoverStyles = {
  backgroundColor: "#000",
  color: "#fff",
};

const activeStyles = {
  transform: "scale(0.95)",
};

const Button = ({ label = "Click Me", onClick }) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [isActive, setIsActive] = React.useState(false);

  const combinedStyles = {
    ...buttonStyles,
    ...(isHovered ? hoverStyles : {}),
    ...(isActive ? activeStyles : {}),
  };

  return (
    <button
      onClick={onClick}
      style={combinedStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsActive(true)}
      onMouseUp={() => setIsActive(false)}
    >
      {label}
    </button>
  );
};

export default Button;
