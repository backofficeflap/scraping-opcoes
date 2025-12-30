
import React, { useState, useCallback } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  selectedFileName: string | null;
  isProcessing: boolean;
}

export const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, selectedFileName, isProcessing }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (isProcessing) return;
    setIsDragging(true);
  }, [isProcessing]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (isProcessing) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        onFileSelect(file);
      } else {
        alert('Por favor, insira apenas arquivos Excel (.xlsx ou .xls)');
      }
    }
  }, [onFileSelect, isProcessing]);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative w-full max-w-2xl h-64 border-2 border-dashed rounded-xl 
        flex flex-col items-center justify-center transition-all duration-200
        ${isDragging ? 'border-orange-500 bg-orange-50 scale-[1.02]' : 'border-gray-300 bg-white'}
        ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-orange-400'}
      `}
    >
      <div className="text-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          {selectedFileName ? 'Arquivo selecionado!' : 'Por favor, insira a planilha.'}
        </h2>
        <p className="text-gray-500 text-lg">
          {selectedFileName ? selectedFileName : 'Ou arraste o arquivo aqui'}
        </p>
        
        {selectedFileName && (
          <div className="mt-4 inline-flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full text-sm font-medium">
            <i className="fas fa-file-excel mr-2"></i>
            Excel pronto para processar
          </div>
        )}
      </div>
    </div>
  );
};
