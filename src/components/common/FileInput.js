import React from "react";

const inputStyles = {
  display: "block",
  padding: "12px 16px",
  border: "2px solid #000",
  borderRadius: "8px",
  background: "none",
  color: "#000",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  textAlign: "center",
};

const hoverStyles = {
  background: "#000",
  color: "#fff",
};

const containerStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  gap: "16px",
  background: "#fff",
  borderRadius: "12px",
  width: "fit-content",
  margin: "auto",
};

const FileInput = ({ handleFileUpload }) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const combinedStyles = {
    ...inputStyles,
    ...(isHovered ? hoverStyles : {}),
  };

  return (
    <div style={containerStyles}>
      <input
        type="file"
        accept=".mid"
        onChange={handleFileUpload}
        style={combinedStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
    </div>
  );
};

export default FileInput;
