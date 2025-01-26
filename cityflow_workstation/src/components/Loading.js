import React from 'react';

const Loading = ({ dotSize = 20 }) => {
  const styles = {
    container: {
      position: 'relative',
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingAnimation: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    dot: {
      width: `${dotSize}px`, // Calculate size relative to the container width
      height: `${dotSize}px`,
      borderRadius: '50%',
      backgroundColor: '#666',
      margin: `0 ${dotSize / 2}px`, // Dynamic margin
      animation: 'bounce 1.4s infinite ease-in-out',
    },
    dot1: {
      animationDelay: '0s',
    },
    dot2: {
      animationDelay: '0.2s',
    },
    dot3: {
      animationDelay: '0.4s',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.loadingAnimation}>
        <div style={{ ...styles.dot, ...styles.dot1 }}></div>
        <div style={{ ...styles.dot, ...styles.dot2 }}></div>
        <div style={{ ...styles.dot, ...styles.dot3 }}></div>
      </div>
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% {
              transform: scale(0);
            }
            40% {
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Loading;
