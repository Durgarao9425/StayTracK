import React from 'react';
import Toast from 'react-native-root-toast';
import { Platform } from 'react-native';

const showToast = (message, type = 'default') => {
    // Enhanced Web Implementation
    if (Platform.OS === 'web') {
        const toast = document.createElement('div');

        // Define colors and icons based on type
        let backgroundColor, icon, borderColor;

        switch (type) {
            case 'success':
                backgroundColor = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
                borderColor = '#059669';
                icon = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
                    </svg>
                `;
                break;
            case 'error':
                backgroundColor = 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)';
                borderColor = '#DC2626';
                icon = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="white"/>
                    </svg>
                `;
                break;
            case 'warning':
                backgroundColor = 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)';
                borderColor = '#D97706';
                icon = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="white"/>
                    </svg>
                `;
                break;
            default:
                backgroundColor = 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)';
                borderColor = '#2563EB';
                icon = `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="white"/>
                    </svg>
                `;
        }

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <div style="flex-shrink: 0; width: 24px; height: 24px;">
                    ${icon}
                </div>
                <span style="font-weight: 600; font-size: 15px; line-height: 1.4;">${message}</span>
            </div>
        `;

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 16px 20px;
            border-radius: 16px;
            border-left: 4px solid ${borderColor};
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            min-width: 320px;
            max-width: 420px;
            animation: slideInRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            backdrop-filter: blur(10px);
        `;

        // Add CSS animations
        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
            @keyframes slideInRight {
                from {
                    transform: translateX(120%) scale(0.8);
                    opacity: 0;
                }
                to {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0) scale(1);
                    opacity: 1;
                }
                to {
                    transform: translateX(120%) scale(0.8);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(styleSheet);

        document.body.appendChild(toast);

        // Auto dismiss with animation
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards';
            setTimeout(() => {
                toast.remove();
                styleSheet.remove();
            }, 400);
        }, 3500);

        return;
    }

    // Enhanced Native Implementation
    let backgroundColor, icon;

    switch (type) {
        case 'success':
            backgroundColor = '#10B981';
            icon = '✓';
            break;
        case 'error':
            backgroundColor = '#EF4444';
            icon = '✕';
            break;
        case 'warning':
            backgroundColor = '#F59E0B';
            icon = '⚠';
            break;
        default:
            backgroundColor = '#3B82F6';
            icon = 'ℹ';
    }

    Toast.show(`${icon}  ${message}`, {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP + 20,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: backgroundColor,
        textColor: '#ffffff',
        opacity: 1,
        containerStyle: {
            borderRadius: 16,
            paddingHorizontal: 20,
            paddingVertical: 16,
            minWidth: 280,
            shadowColor: '#000',
            shadowOffset: {
                width: 0,
                height: 4,
            },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
        },
        textStyle: {
            fontWeight: '700',
            fontSize: 15,
            letterSpacing: 0.2
        }
    });
};

export default showToast;