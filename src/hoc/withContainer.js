function withContainer(WrappedComponent) {
    return function Container(props) {
      return (
        <div style={containerStyle}>
          <WrappedComponent {...props} />
        </div>
      );
    };
  }
  
  export default withContainer;

  const containerStyle = {
    padding: '16px',
    margin: '0 auto',
    maxWidth: '1200px',
    backgroundColor: '#fff',
    color: '#000',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  };
  