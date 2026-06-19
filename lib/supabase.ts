import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jjsdqnkcrjwgpqhxidid.supabase.co';
const supabaseAnonKey = 'xsb_publishable_Wcx7YcrZ6XX2ATBqv-F8Yw_h0QN7RCd';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});