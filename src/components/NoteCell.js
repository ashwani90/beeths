const NoteCell = ({ active, onClick }) => (
    <div
      className={`note-cell ${active ? 'active' : ''}`}
      onClick={onClick}
      style={{
        width: '20px',
        height: '20px',
        border: '1px solid #ccc',
        background: active ? '#3f51b5' : 'white',
        cursor: 'pointer',
      }}
    />
  );
  
  export default NoteCell;
  