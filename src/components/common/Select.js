import React from "react";

const containerStyles = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  justifyContent: "start",
  gap: "8px",
  background: "#fff",
  borderRadius: "12px",
  width: "fit-content",
};

const labelStyles = {
  fontSize: "16px",
  fontWeight: "bold",
  color: "#000",
};

const selectStyles = {
  padding: "12px",
  border: "2px solid #000",
  borderRadius: "8px",
  background: "none",
  color: "#000",
  fontSize: "16px",
  cursor: "pointer",
  transition: "all 0.3s ease",
  width: "100%",
};

const optionStyles = {
  color: "#000",
  background: "#fff",
};

const Select = ({ selectedInstrument, setSelectedInstrument, INSTRUMENTS }) => {
  return (
    <div style={containerStyles}>
      <label style={labelStyles}>Select Instrument:</label>
      <select
        value={selectedInstrument}
        onChange={(e) => setSelectedInstrument(e.target.value)}
        style={selectStyles}
      >
        {INSTRUMENTS.map((inst) => (
          <option key={inst} value={inst} style={optionStyles}>
            {inst}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
