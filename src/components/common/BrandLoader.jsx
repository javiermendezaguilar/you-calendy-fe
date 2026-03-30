import React from 'react';
import { Text } from '@mantine/core';
import { HeaderLogo } from '../common/Svgs';

/**
 * BrandLoader
 * A modern, elegant loader with smooth animations and branded design.
 */
const BrandLoader = ({ label = 'Loading', fullscreen = true }) => {
  const containerStyle = fullscreen
    ? { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', flexDirection: 'column', gap: 20 }
    : { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40, flexDirection: 'column', gap: 20 };

  return (
    <div style={containerStyle}>
      {/* Modern animated loader */}
      <div className="yc-modern-loader" aria-label="Loading" role="status">
        {/* Outer pulse ring */}
        <div className="yc-pulse-ring"></div>
        
        {/* Main container with logo */}
        <div className="yc-logo-container">
          <div className="yc-logo-wrapper">
            <HeaderLogo />
          </div>
          
          {/* Floating dots animation */}
          <div className="yc-dots">
            <div className="yc-dot yc-dot-1"></div>
            <div className="yc-dot yc-dot-2"></div>
            <div className="yc-dot yc-dot-3"></div>
          </div>
        </div>
        
        {/* Gradient border spinner */}
        <div className="yc-gradient-spinner"></div>
      </div>

      {label ? (
        <Text size="md" c="#323334" fw={600} style={{ letterSpacing: 0.5, opacity: 0.8 }}>
          {label}
        </Text>
      ) : null}

      {/* Modern CSS animations */}
      <style>{`
        .yc-modern-loader {
          position: relative;
          width: 120px;
          height: 120px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .yc-pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 2px solid rgba(50, 51, 52, 0.1);
          border-radius: 50%;
          animation: yc-pulse 2s ease-in-out infinite;
        }

        .yc-logo-container {
          position: relative;
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
            0 8px 32px rgba(50, 51, 52, 0.12),
            0 2px 8px rgba(50, 51, 52, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.9);
          z-index: 2;
        }

        .yc-logo-wrapper {
          width: 60%;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: yc-logo-float 3s ease-in-out infinite;
        }

        .yc-logo-wrapper svg {
          width: 100%;
          height: auto;
          display: block;
          filter: drop-shadow(0 2px 4px rgba(50, 51, 52, 0.15));
        }

        .yc-dots {
          position: absolute;
          width: 100%;
          height: 100%;
        }

        .yc-dot {
          position: absolute;
          width: 6px;
          height: 6px;
          background: linear-gradient(45deg, #323334, #556B2F);
          border-radius: 50%;
          animation: yc-orbit 2.5s linear infinite;
        }

        .yc-dot-1 { animation-delay: 0s; }
        .yc-dot-2 { animation-delay: -0.8s; }
        .yc-dot-3 { animation-delay: -1.6s; }

        .yc-gradient-spinner {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-radius: 50%;
          background: 
            linear-gradient(90deg, transparent, transparent),
            conic-gradient(from 0deg, transparent 0deg, #323334 90deg, transparent 180deg, #556B2F 270deg, transparent 360deg);
          background-clip: padding-box, border-box;
          background-origin: padding-box, border-box;
          animation: yc-spin 1.5s linear infinite;
        }

        @keyframes yc-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes yc-pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.3;
          }
          50% { 
            transform: scale(1.1);
            opacity: 0.1;
          }
        }

        @keyframes yc-logo-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-2px); }
        }

        @keyframes yc-orbit {
          0% { 
            transform: rotate(0deg) translateX(35px) rotate(0deg);
            opacity: 1;
          }
          50% { 
            opacity: 0.3;
          }
          100% { 
            transform: rotate(360deg) translateX(35px) rotate(-360deg);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default BrandLoader;
