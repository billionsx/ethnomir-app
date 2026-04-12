'use client';
// @ts-nocheck
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import BXLanding from './bx-landing';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ewnoqkoojobyqqxpvzhj.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3bm9xa29vam9ieXFxeHB2emhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTM5ODcsImV4cCI6MjA4ODQ4OTk4N30.Ba73m2qMU_h1r1aNTAaakMb-br9381k0rqVWw8Eg6tg'
);

export default function BillionsXPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    Promise.all([
      supabase.from('bx_cases').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('bx_products').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('bx_team').select('*').eq('is_active', true).order('sort_order'),
      supabase.from('bx_testimonials').select('*').eq('is_active', true).order('sort_order'),
    ]).then(([casesRes, productsRes, teamRes, testimonialsRes]) => {
      const cases = casesRes.data || [];
      const products = (productsRes.data || []).map(p => ({
        ...p,
        case_count: cases.filter(c => (c.products || []).includes(p.name)).length,
      }));
      setData({ cases, products, team: teamRes.data || [], testimonials: testimonialsRes.data || [] });
    });
  }, []);

  if (!data) return (
    <div style={{width:'100%',height:'100dvh',display:'flex',alignItems:'center',justifyContent:'center',background:'#fff'}}>
      <div style={{fontFamily:"-apple-system,'SF Pro Display',sans-serif",fontSize:42,fontWeight:800,color:'#000',letterSpacing:'-0.02em'}}>Billions X</div>
    </div>
  );

  return <BXLanding cases={data.cases} products={data.products} team={data.team} testimonials={data.testimonials} />;
}
