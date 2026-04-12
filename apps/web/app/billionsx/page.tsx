// @ts-nocheck
// BillionsX Landing — fully self-contained, reads from bx schema
// Zero dependencies on EthnoMir code
import { createClient } from '@supabase/supabase-js';
import BXLanding from './bx-landing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const metadata = {
  title: 'BillionsX — Маркетинг богатых и очень богатых',
  description: 'Приносим «иксы» денег, создавая архитектуру роста бизнеса как целостную систему.',
  robots: 'noindex,nofollow',
};

export default async function BillionsXPage() {
  // Fetch all data from bx schema
  const [casesRes, productsRes, teamRes] = await Promise.all([
    supabase.schema('bx').from('cases').select('*').eq('is_active', true).order('sort_order'),
    supabase.schema('bx').from('products').select('*').eq('is_active', true).order('sort_order'),
    supabase.schema('bx').from('team').select('*').eq('is_active', true).order('sort_order'),
  ]);

  // Enrich products with case counts
  const cases = casesRes.data || [];
  const products = (productsRes.data || []).map(p => ({
    ...p,
    case_count: cases.filter(c => (c.products || []).includes(p.name)).length,
  }));

  return (
    <BXLanding
      cases={cases}
      products={products}
      team={teamRes.data || []}
    />
  );
}
