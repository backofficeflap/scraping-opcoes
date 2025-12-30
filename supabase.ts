
import { createClient } from '@supabase/supabase-js';

// No ambiente real, essas variáveis viriam de process.env
// Como este é um mockup funcional, definimos placeholders
const supabaseUrl = (window as any).SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseAnonKey = (window as any).SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
