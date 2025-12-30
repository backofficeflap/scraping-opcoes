
export type AppStatus = 'IDLE' | 'READY' | 'PROCESSING' | 'SUCCESS' | 'ERROR';

export interface ProcessResponse {
  data?: string; // Base64 do arquivo processado
  error?: string;
  message?: string;
}
