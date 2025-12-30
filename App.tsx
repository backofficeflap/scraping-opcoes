
import React, { useState, useRef, useCallback } from 'react';
import { DropZone } from './components/DropZone';
import { LoadingBar } from './components/LoadingBar';
import { supabase } from './supabase';
import { AppStatus } from './types';

const App: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AppStatus>('IDLE');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (selected.name.endsWith('.xlsx') || selected.name.endsWith('.xls')) {
        setFile(selected);
        setStatus('READY');
        setErrorMsg(null);
      } else {
        alert('Por favor, selecione um arquivo Excel válido.');
      }
    }
  };

  const openFileSelector = () => {
    if (status === 'PROCESSING') return;
    fileInputRef.current?.click();
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,
        resolve(base64.split(',')[1]);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const startProcessing = async () => {
    if (!file || status === 'PROCESSING') return;

    setStatus('PROCESSING');
    setErrorMsg(null);

    try {
      const base64Data = await fileToBase64(file);

      const { data, error } = await supabase.functions.invoke('process-excel', {
        body: { 
          file: base64Data, 
          fileName: file.name 
        },
      });

      if (error) throw error;

      if (data && data.fileBase64) {
        // Converter base64 de volta para blob e baixar
        const byteCharacters = atob(data.fileBase64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `processado_${file.name}`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);

        setStatus('SUCCESS');
      } else {
        throw new Error('A resposta da função não continha dados de arquivo.');
      }
    } catch (err: any) {
      console.error('Erro no processamento:', err);
      setErrorMsg(err.message || 'Erro desconhecido ao processar planilha.');
      setStatus('ERROR');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Main Logo/Header Area */}
        <div className="mb-10 text-center">
          <div className="inline-block p-4 bg-orange-100 rounded-2xl mb-4">
            <i className="fas fa-file-invoice text-orange-600 text-4xl"></i>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Conversor de Planilhas
          </h1>
          <p className="text-gray-500 mt-2">Processamento de dados e scraping automatizado</p>
        </div>

        {/* Drop Zone */}
        <DropZone 
          onFileSelect={(f) => { setFile(f); setStatus('READY'); }} 
          selectedFileName={file ? file.name : null}
          isProcessing={status === 'PROCESSING'}
        />

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".xlsx, .xls"
          className="hidden"
        />

        {/* Control Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={openFileSelector}
            disabled={status === 'PROCESSING'}
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center min-w-[160px]"
          >
            <i className="fas fa-search mr-2"></i>
            buscar
          </button>

          <button
            onClick={startProcessing}
            disabled={status !== 'READY' || status === 'PROCESSING'}
            className={`
              px-8 py-3 font-bold rounded-xl shadow-lg transition-all transform flex items-center justify-center min-w-[160px]
              ${status === 'READY' 
                ? 'bg-green-500 hover:bg-green-600 text-white hover:scale-105 active:scale-95' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
            `}
          >
            <i className="fas fa-play mr-2"></i>
            iniciar
          </button>
        </div>

        {/* Feedback Area */}
        <div className="mt-6 text-center w-full flex flex-col items-center">
          <LoadingBar isLoading={status === 'PROCESSING'} />

          {status === 'IDLE' && (
            <p className="text-gray-400 flex items-center">
              <span className="relative flex h-2 w-2 mr-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gray-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-400"></span>
              </span>
              Aguardando arquivo...
            </p>
          )}

          {status === 'SUCCESS' && (
            <div className="bg-green-100 text-green-800 p-4 rounded-xl flex items-center animate-bounce mt-4">
              <i className="fas fa-check-circle mr-2 text-xl"></i>
              Processamento concluído! O download iniciará em instantes.
            </div>
          )}

          {status === 'ERROR' && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 mt-4 max-w-md">
              <div className="font-bold flex items-center mb-1">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Ops! Ocorreu um erro
              </div>
              <p className="text-sm">{errorMsg}</p>
              <button 
                onClick={() => setStatus('READY')}
                className="mt-2 text-xs underline font-semibold hover:text-red-900"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="mt-auto pt-12 text-gray-400 text-sm flex items-center gap-6">
          <div className="flex items-center">
            <i className="fas fa-shield-halved mr-2"></i>
            Seguro & Privado
          </div>
          <div className="flex items-center">
            <i className="fas fa-bolt mr-2"></i>
            Processamento Cloud
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
