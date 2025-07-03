// Renders tick marks (every beat or second) above the piano roll
const renderTimeAxis = (maxTime) => {
    const interval = 0.5; // 1 second or beat
    const ticks = [];
    for (let t = 0; t <= maxTime; t += interval) {
      ticks.push(
        <div
          key={t}
          style={{
            position: 'absolute',
            left: `${t * 100}px`,
            top: 0,
            width: '1px',
            height: '100%',
            backgroundColor: '#ccc',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              left: '-5px',
              fontSize: '10px',
              color: '#666',
            }}
          >
            {t}s
          </div>
        </div>
      );
    }
    return ticks;
  };
  
  export default renderTimeAxis;