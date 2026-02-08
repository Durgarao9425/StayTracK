import React from 'react';
import Toast from 'react-native-root-toast';
import { Platform } from 'react-native';

const showToast = (message, type = 'default') => {
    // Web implementation
    if (Platform.OS === 'web') {
        const toast = document.createElement('div');
        let backgroundColor = '#333';
        if (type === 'success') backgroundColor = '#10B981';
        if (type === 'error') backgroundColor = '#EF4444';
        if (type === 'warning') backgroundColor = '#F59E0B';

        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${backgroundColor};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            font-weight: 500;
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 12px;
        `;

        // Add icon based on type
        let icon = '';
        if (type === 'success') icon = '✅';
        if (type === 'error') icon = '❌';
        if (type === 'warning') icon = '⚠️';

        toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;

        // Add style for animation
        const styleSheet = document.createElement("style");
        styleSheet.innerHTML = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(styleSheet);

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => {
                toast.remove();
                styleSheet.remove();
            }, 300);
        }, 3000);

        return;
    }

    // Native implementation
    let backgroundColor = '#333';
    if (type === 'success') backgroundColor = '#10B981';
    if (type === 'error') backgroundColor = '#EF4444';
    if (type === 'warning') backgroundColor = '#F59E0B';

    Toast.show(message, {
        duration: Toast.durations.LONG,
        position: Toast.positions.TOP,
        shadow: true,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: backgroundColor,
        textColor: '#ffffff',
        opacity: 1,
        textStyle: { fontWeight: 'bold' }
    });
};

export default showToast;
