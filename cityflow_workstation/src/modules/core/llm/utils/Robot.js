import React, { useState, useEffect } from 'react';

const Robot = ({ autoSwitch = true, emotion }) => {
  const [status, setStatus] = useState(emotion || 'normal');
  useEffect(() => {
    if (autoSwitch) {
      const states = ['normal', 'thinking', 'happy'];
      let index = 0;
      const timer = setInterval(() => {
        index = (index + Math.floor(Math.random() * 10)) % states.length;
        setStatus(states[index]);
      }, 3000);
      return () => clearInterval(timer);
    }
  }, [autoSwitch]);

  const getEyeStyle = () => {
    const base = {
      width: '12px',
      height: '12px',
      backgroundColor: '#666',
      borderRadius: '50%',
      margin: '4px 0',
    };

    switch (status) {
      case 'thinking':
        return {
          ...base,
          animation: 'eyeThink 2.5s ease-in-out infinite',
        };
      case 'happy':
        return {
          ...base,
          animation: 'eyeHappy 1.2s ease-in-out infinite',
        };
      default:
        return {
          ...base,
          animation: 'eyeBlink 1.5s ease-in-out infinite',
        };
    }
  };

  // 嘴巴样式生成器
  const getMouthStyle = () => {
    const base = {
      width: '20px',
      height: '4px',
      backgroundColor: '#666',
      transition: 'all 0.3s ease',
    };

    switch (status) {
      case 'thinking':
        return {
          ...base,
          borderRadius: '20px',
          transform: 'scaleY(1.5)',
          animation: 'mouthThink 1s ease-in-out infinite',
        };
      case 'happy':
        return {
          ...base,
          height: '8px',
          borderRadius: '0 0 20px 20px',
          transform: 'translateY(-3px)',
          animation: 'mouthHappy 1.2s ease-in-out infinite',
        };
      default:
        return {
          ...base,
          borderRadius: '2px',
          animation: 'mouthNormal 3s ease-in-out infinite',
        };
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.face}>
        <div style={styles.eyesContainer}>
          <div style={getEyeStyle()}></div>
          <div style={getEyeStyle()}></div>
        </div>

        <div style={styles.mouthContainer}>
          <div style={getMouthStyle()}></div>
        </div>
      </div>

      <style>
        {`
          /* 基础动画 */
          @keyframes eyebrowMove {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-4px); }
          }
          @keyframes eyeBlink {
            0%, 100% { transform: scaleY(1); }
            50% { transform: scaleY(0.1); }
          }

          /* 思考状态动画 */
          @keyframes eyeThink {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(0px); }
          }

          /* 开心状态动画 */
          @keyframes eyebrowHappy {
            0%, 100% { transform: translateY(-6px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes eyeHappy {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
            @keyframes mouthNormal {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(0.9); }
          }
          
          @keyframes mouthThink {
            0%, 100% { transform: scaleY(1.5); }
            50% { transform: scaleY(2); }
          }
          
          @keyframes mouthHappy {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
        `}
      </style>
    </div>
  );
};

// 基础样式
const styles = {
  container: {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  face: {
    position: 'relative',
    width: '100px',
    height: '45px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  eyesContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0 20px',
    marginTop: '5px',
  },

  mouthContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '10px',
    padding: '0 10px',
  },
};

export default Robot;
