import React from 'react';
import { User } from '../db/database';

interface LogViewerProps {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  currentUser?: User;
}

export function LogViewer({ showToast, currentUser }: LogViewerProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Логи</h2>
      <p className="text-gray-500">Функция логирования в разработке</p>
    </div>
  );
}
