
import { createClient } from '@supabase/supabase-js';

// No ambiente real, essas variáveis viriam de process.env
// Como este é um mockup funcional, definimos placeholders
const supabaseUrl = (window as any).SUPABASE_URL || 'https://aivwdcopudjzrrrbuquf.supabase.co';
const supabaseAnonKey = (window as any).SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpdndkY29wdWRqenJycmJ1cXVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxMDY5ODksImV4cCI6MjA4MjY4Mjk4OX0.Wjw-XG-665La6_8d59H4q1vimREKsN7w5MlE9DduVII';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
