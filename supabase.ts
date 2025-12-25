
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zcukmhiztvwcnvxgrhou.supabase.co';
const supabaseKey = 'sb_publishable_HWWCMswON8b6PjESMZcXiA_73am-_S5';

export const supabase = createClient(supabaseUrl, supabaseKey);
