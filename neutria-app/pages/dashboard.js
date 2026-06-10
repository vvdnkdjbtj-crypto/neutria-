// pages/dashboard.js
// Live inventory dashboard — pulls real items from /api/inventory (Shopify).

import { useState, useEffect } from 'react';
import { money } from '../lib/format';

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/inventory')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setItems(data.items || []);
        }
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const totalValue = items.reduce((sum, i) => sum + Number(i.price || 0), 0);
  const live = items.filter((i) => i.status === 'active').length;

  const badge = (status) => {
    const map = {
      active: { bg: '#e6f4ea', fg: '#1e7e34', label: 'Live' },
      draft: { bg: '#fff4e5', fg: '#9a6700', label: 'Draft' },
      archived: { bg: '#f1f1f1', fg: '#666', label: 'Archived' },
    };
    const s = map[status] || map.archived;
    return (
      <span style={{ background: s.bg, color: s.fg, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>
        {s.label}
      </span>
    );
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: 880, margin: '0 auto', padding: '40px 20px', color: '#1a1a1a' }}>
      <p style={{ fontSize: 13, letterSpacing: 1, color: '#2f5d3a', textTransform: 'uppercase', marginBottom: 4 }}>
        my.neutria.co.uk · inventory
      </p>
      <h1 style={{ fontSize: 28, margin: '0 0 24px' }}>Your Inventory</h1>

      <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap' }}>
        <div><div style={{ fontSize: 26, fontWeight: 700 }}>{items.length}</div><div style={{ color: '#666', fontSize: 13 }}>Items</div></div>
        <div><div style={{ fontSize: 26, fontWeight: 700 }}>{live}</div><div style={{ color: '#666', fontSize: 13 }}>Live</div></div>
        <div><div style={{ fontSize: 26, fontWeight: 700 }}>{money(totalValue)}</div><div style={{ color: '#666', fontSize: 13 }}>Total value</div></div>
      </div>

      {loading && <p>Loading your inventory…</p>}
      {error && <p style={{ color: '#b00020' }}>Couldn’t load inventory: {error}</p>}

      {!loading && !error && items.map((item) => (
        <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderBottom: '1px solid #eee' }}>
          <div style={{ width: 56, height: 56, borderRadius: 8, background: '#f5f5f5', overflow: 'hidden', flexShrink: 0 }}>
            {item.image && <img src={item.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>{item.title}</div>
            <div style={{ color: '#888', fontSize: 13 }}>{item.category}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700 }}>{money(item.price)}</div>
            <div style={{ marginTop: 4 }}>{badge(item.status)}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
