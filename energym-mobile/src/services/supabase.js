import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Ganti dengan URL dan Anon Key dari menu Project Settings -> API di Supabase-mu
const supabaseUrl = 'https://hzxjzksqxrosgnpernih.supabase.co';
const supabaseAnonKey = 'sb_publishable_BZx1BlGXxLPANelKyVE9cg__fsS9f8f';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  realtime: {
    params: {
      eventsPerSecond: 10, 
    },
  },
});