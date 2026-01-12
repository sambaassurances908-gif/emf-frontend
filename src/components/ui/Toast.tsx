import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, X, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
    stats?: {
        total?: number;
        success?: number;
        errors?: number;
    };
}

interface ToastProps {
    toast: ToastData;
    onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        // Animation d'entrée
        setTimeout(() => setIsVisible(true), 10);

        // Auto-fermeture après la durée spécifiée
        const duration = toast.duration || 5000;
        const timer = setTimeout(() => {
            handleClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [toast.id, toast.duration]);

    const handleClose = () => {
        setIsLeaving(true);
        setTimeout(() => {
            onClose(toast.id);
        }, 300);
    };

    const getIcon = () => {
        switch (toast.type) {
            case 'success':
                return <CheckCircle2 className="h-6 w-6 text-emerald-500" />;
            case 'error':
                return <XCircle className="h-6 w-6 text-red-500" />;
            case 'warning':
                return <AlertCircle className="h-6 w-6 text-amber-500" />;
            case 'info':
                return <Info className="h-6 w-6 text-blue-500" />;
        }
    };

    const getStyles = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-emerald-50 border-emerald-200 shadow-emerald-100';
            case 'error':
                return 'bg-red-50 border-red-200 shadow-red-100';
            case 'warning':
                return 'bg-amber-50 border-amber-200 shadow-amber-100';
            case 'info':
                return 'bg-blue-50 border-blue-200 shadow-blue-100';
        }
    };

    const getProgressColor = () => {
        switch (toast.type) {
            case 'success':
                return 'bg-emerald-500';
            case 'error':
                return 'bg-red-500';
            case 'warning':
                return 'bg-amber-500';
            case 'info':
                return 'bg-blue-500';
        }
    };

    return (
        <div
            className={`
                relative overflow-hidden
                w-96 max-w-[calc(100vw-2rem)]
                border rounded-xl shadow-lg
                transform transition-all duration-300 ease-out
                ${getStyles()}
                ${isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
            `}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                        {getIcon()}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{toast.title}</p>
                        {toast.message && (
                            <p className="mt-1 text-sm text-gray-600">{toast.message}</p>
                        )}

                        {/* Statistiques d'import */}
                        {toast.stats && (
                            <div className="mt-3 flex gap-4 text-sm">
                                {toast.stats.total !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                                        <span className="text-gray-600">
                                            <span className="font-semibold text-gray-800">{toast.stats.total}</span> traité(s)
                                        </span>
                                    </div>
                                )}
                                {toast.stats.success !== undefined && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                        <span className="text-gray-600">
                                            <span className="font-semibold text-emerald-600">{toast.stats.success}</span> créé(s)
                                        </span>
                                    </div>
                                )}
                                {toast.stats.errors !== undefined && toast.stats.errors > 0 && (
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-red-500" />
                                        <span className="text-gray-600">
                                            <span className="font-semibold text-red-600">{toast.stats.errors}</span> erreur(s)
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleClose}
                        className="flex-shrink-0 p-1 rounded-lg hover:bg-white/50 transition-colors"
                    >
                        <X className="h-4 w-4 text-gray-400" />
                    </button>
                </div>
            </div>

            {/* Barre de progression */}
            <div className="h-1 bg-white/50">
                <div
                    className={`h-full ${getProgressColor()} animate-shrink`}
                    style={{
                        animationDuration: `${toast.duration || 5000}ms`,
                    }}
                />
            </div>
        </div>
    );
};

// Conteneur de Toasts
interface ToastContainerProps {
    toasts: ToastData[];
    onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onClose }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
            {toasts.map((toast) => (
                <Toast key={toast.id} toast={toast} onClose={onClose} />
            ))}
        </div>
    );
};

// Hook pour gérer les toasts
export const useToast = () => {
    const [toasts, setToasts] = useState<ToastData[]>([]);

    const addToast = (toast: Omit<ToastData, 'id'>) => {
        const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setToasts((prev) => [...prev, { ...toast, id }]);
        return id;
    };

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    const showSuccess = (title: string, message?: string, stats?: ToastData['stats']) => {
        return addToast({ type: 'success', title, message, stats, duration: 6000 });
    };

    const showError = (title: string, message?: string) => {
        return addToast({ type: 'error', title, message, duration: 8000 });
    };

    const showWarning = (title: string, message?: string, stats?: ToastData['stats']) => {
        return addToast({ type: 'warning', title, message, stats, duration: 6000 });
    };

    const showInfo = (title: string, message?: string) => {
        return addToast({ type: 'info', title, message, duration: 5000 });
    };

    return {
        toasts,
        addToast,
        removeToast,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        ToastContainer: () => <ToastContainer toasts={toasts} onClose={removeToast} />,
    };
};

export default Toast;
