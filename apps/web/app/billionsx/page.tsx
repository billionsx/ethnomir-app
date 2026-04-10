'use client';
// @ts-nocheck
import dynamic from 'next/dynamic';
const Main = dynamic(() => import('../page').then(m => ({ default: m.BXStandalone })), { ssr: false });
export default function BillionsXPage() { return <Main />; }
// v2
