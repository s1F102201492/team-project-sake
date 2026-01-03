import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ehxlmhypnwrnxnijrbyi.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoeGxtaHlwbndybnhuaWpyYnlpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTIwMjIsImV4cCI6MjA3NjA4ODAyMn0.sPLPA0kx6BSAT9Bc8OH1Z4NiXwhq301Q9avCKtFh0HU'; // Anon Key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);