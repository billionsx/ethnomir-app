// @ts-nocheck
// BillionsX Landing — fully self-contained
// Reads from public views (bx_cases, bx_products, etc.) which point to bx schema
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
  const [casesRes, productsRes, teamRes, testimonialsRes] = await Promise.all([
    supabase.from('bx_cases').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('bx_products').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('bx_team').select('*').eq('is_active', true).order('sort_order'),
    supabase.from('bx_testimonials').select('*').eq('is_active', true).order('sort_order'),
  ]);

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
      testimonials={testimonialsRes.data || []}
    />
  );
}
