import { useState, useRef, useCallback } from 'react';
import { fmt, pct } from '../lib/format';
import Head from 'next/head';

const T = {
  bg:"#fafaf8", surf:"#ffffff", alt:"#f5f5f2", bdr:"#e8e8e2", bdrS:"#f0f0eb",
  g900:"#0c2d1e", g800:"#0f3d28", g700:"#145232", g600:"#1a6b40", g500:"#22884f",
  g400:"#3aab6a", g300:"#6bc98f", g200:"#b3e6c8", g100:"#e4f5ec", g50:"#f4fbf7",
  ink:"#111110", ink2:"#3a3a38", ink3:"#6b6b68", ink4:"#9e9e9a", ink5:"#c8c8c2",
  err:"#c0392b",
};

const PLANS = [
  { id:"free",     name:"Free",     price:0,      period:"forever",        commission:12, scans:5,        cta:"Get started free", features:["5 AI scans/month","10 active listings","12% commission","Basic marketplace"] },
  { id:"seller",   name:"Seller",   price:12.99,  period:"per month + VAT",commission:8,  scans:100,      cta:"Start Seller",     features:["100 AI scans/month","200 listings","8% commission","Cross-listing to eBay & Vinted","Priority support"], highlight:true, badge:"Most Popular" },
  { id:"pro",      name:"Pro",      price:39,     period:"per month + VAT",commission:5,  scans:Infinity, cta:"Start Pro",        features:["Unlimited scans","Unlimited listings","5% commission","Warehouse access","Advanced analytics","API access"], badge:"Best Value" },
  { id:"business", name:"Business", price:159,    period:"per month + VAT",commission:3,  scans:Infinity, cta:"Contact sales",    features:["Everything in Pro","Dedicated warehouse","White-label pages","B2B liquidation portal","Custom commission","SLA fulfilment"] },
];

const DISP = [
  {id:"sell",l:"Sell",i:"↗"},{id:"instant",l:"Instant Cash",i:"⚡"},
  {id:"auction",l:"Auction",i:"◎"},{id:"consign",l:"Consign",i:"◈"},
  {id:"donate",l:"Donate",i:"◇"},{id:"recycle",l:"Recycle",i:"↺"},
  {id:"store",l:"Store",i:"▣"},{id:"rent",l:"Rent",i:"◉"},
  {id:"swap",l:"Swap",i:"⇄"},
];

function Logo({ size=28, color="#fff" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M16 3 A13 13 0 1 1 3 16" stroke={color} strokeWidth="2.2" strokeLinecap="round"/>
      <polygon points="3,10 0,17 8,16" fill={color}/>
      <path d="M10 22 L10 13 L22 22 L22 13" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}


export default function Neutria() {
  const [page, setPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [inv, setInv] = useState([]);
  const [orders, setOrders] = useState([]);
  const [focus, setFocus] = useState(null);
  const [plan, setPlan] = useState(PLANS[0]);
  const [toast, setToast] = useState(null);
  const [checkoutItems, setCheckoutItems] = useState(null);

  const msg = (m, t='ok') => { setToast({m,t}); setTimeout(()=>setToast(null), 4000); };
  const go = p => setPage(p);
  const addCart = item => { setCart(p=>p.find(c=>c.id===item.id)?p:[...p,item]); msg('Added to cart'); };
  const buyNow = item => { setCheckoutItems([item]); setPage('checkout'); };

  const handleCheckout = async (selectedPlan) => {
    if (selectedPlan.id === 'free') { setPlan(selectedPlan); msg('Welcome to Neutria!'); go('dashboard'); return; }
    if (selectedPlan.id === 'business') { msg('Our team will contact you shortly'); return; }
    try {
      const r = await fetch('/api/checkout', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ plan: selectedPlan.id }) });
      const { url } = await r.json();
      if (url) window.location.href = url;
    } catch(e) { msg('Payment setup failed', 'err'); }
  };

  return (
    <>
      <Head>
        <title>Neutria — The reverse of online shopping. AI-powered resale infrastructure.</title>
        <meta name="description" content="Send us your unwanted items. AI photographs, prices, lists, and sells them — you watch from your inventory dashboard."/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <link rel="icon" href="/favicon.ico"/>
      </Head>

      <div style={{minHeight:'100vh',background:T.bg,fontFamily:"Inter,sans-serif",color:T.ink}}>
        <header style={{display:'flex',alignItems:'center',height:60,padding:'0 40px',background:T.surf,borderBottom:`1px solid ${T.bdr}`,position:'sticky',top:0,zIndex:100}}>
          <button onClick={()=>go('home')} style={{display:'flex',alignItems:'center',gap:10,marginRight:48,background:'none',border:'none',cursor:'pointer'}}>
            <div style={{width:32,height:32,background:T.g800,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Logo size={18}/></div>
            <span style={{fontSize:18,fontWeight:400,color:T.ink,letterSpacing:'-0.02em',fontFamily:"'Instrument Serif',serif"}}>Neutria</span>
          </button>
          <nav style={{display:'flex',flex:1,gap:0}}>
            {[['home','Home'],['scanner','Smart Scanner'],['marketplace','Marketplace'],['membership','Membership'],['dashboard','Dashboard'],['partners','For Brands']].map(([id,l])=>(
              <button key={id} onClick={()=>go(id)} style={{padding:'0 14px',height:60,fontSize:13,fontWeight:page===id?600:500,color:page===id?T.g700:T.ink3,borderBottom:page===id?`2px solid ${T.g600}`:'2px solid transparent',border:'none',background:'none',cursor:'pointer'}}>{l}</button>
            ))}
          </nav>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={()=>go('cart')} style={{position:'relative',width:36,height:36,display:'flex',alignItems:'center',justifyContent:'center',color:T.ink2,background:'none',border:'none',cursor:'pointer'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
              {cart.length>0&&<span style={{position:'absolute',top:2,right:2,width:16,height:16,background:T.g600,color:'#fff',borderRadius:'50%',fontSize:9,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center'}}>{cart.length}</span>}
            </button>
            <button onClick={()=>go('scanner')} style={{padding:'8px 20px',background:T.g800,color:'#fff',borderRadius:8,fontSize:13,fontWeight:500,border:'none',cursor:'pointer'}}>Start Selling</button>
          </div>
        </header>

        <main style={{flex:1,animation:'fadeUp .3s ease'}}>
          {page==='home'        && <HomePage go={go} msg={msg}/>}
          {page==='scanner'     && <ScannerPage inv={inv} setInv={setInv} plan={plan} msg={msg}/>}
          {page==='marketplace' && <MarketplacePage addCart={addCart} onItem={i=>{setFocus(i);go('item');}}/>}
          {page==='item'        && focus && <ItemPage item={focus} onBack={()=>go('marketplace')} addCart={addCart} buyNow={buyNow}/>}
          {page==='membership'  && <MembershipPage plan={plan} onSelect={handleCheckout}/>}
          {page==='dashboard'   && <DashboardPage inv={inv} orders={orders} plan={plan} go={go}/>}
          {page==='partners'    && <PartnersPage msg={msg}/>}
          {page==='cart'        && <CartPage cart={cart} setCart={setCart} go={go} onCheckout={items=>{setCheckoutItems(items);go('checkout');}}/>}
          {page==='checkout'    && <CheckoutPage items={checkoutItems||cart} onBack={()=>go('cart')} onPlace={(items,addr,card)=>{setOrders(p=>[...items.map(i=>({id:Math.random().toString(36).slice(2),item:i,status:'confirmed',address:addr,card,placedAt:new Date().toLocaleDateString('en-GB')})),...p]);setCart([]);go('orders');msg('Order placed! ✓');}} go={go}/>}
          {page==='orders'      && <OrdersPage orders={orders} go={go} onOrder={o=>{setFocus(o);go('orderDetail');}}/>}
          {page==='orderDetail' && focus && <OrderDetailPage order={focus} onBack={()=>go('orders')}/>}
        </main>

        {toast&&<div style={{position:'fixed',bottom:24,right:24,padding:'11px 18px',borderRadius:8,fontSize:13,fontWeight:500,zIndex:999,border:'1px solid',animation:'fadeUp .3s ease',maxWidth:340,boxShadow:'0 4px 16px rgba(0,0,0,.06)',background:toast.t==='err'?'#fef2f2':'#f0fdf4',color:toast.t==='err'?T.err:T.g700,borderColor:toast.t==='err'?'#fca5a5':T.g200}}>{toast.m}</div>}
      </div>
    </>
  );
}

// ── HOME PAGE ──────────────────────────────────────────────────────────────
function HomePage({ go, msg }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const joinWaitlist = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg('Please enter a valid email','err'); return; }
    try { await fetch('/api/waitlist',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email})}); } catch(e) {}
    setSubmitted(true);
    msg("You're on the list ✓");
  };

  return (
    <div>
      <section style={{background:T.surf,borderBottom:`1px solid ${T.bdr}`,overflow:'hidden'}}>
        <div style={{maxWidth:1200,margin:'0 auto',padding:'88px 48px',display:'grid',gridTemplateColumns:'1.05fr 1fr',gap:64,alignItems:'center'}}>
          <div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,padding:'5px 14px',background:T.g50,border:`1px solid ${T.g200}`,borderRadius:100,fontSize:12,fontWeight:500,color:T.g700,marginBottom:28}}>
              <span style={{width:6,height:6,borderRadius:'50%',background:T.g500,display:'inline-block'}}/>
              The reverse of online shopping
            </div>
            <h1 style={{fontSize:60,fontWeight:300,letterSpacing:'-0.038em',color:T.ink,lineHeight:1.02,marginBottom:24,fontFamily:"'Instrument Serif',serif"}}>
              Everything you<br/>don't want, <em style={{fontStyle:'italic',color:T.g700}}>gone.</em>
            </h1>
            <p style={{fontSize:17,color:T.ink3,lineHeight:1.65,marginBottom:36,maxWidth:480}}>Amazon brings you stuff. Neutria takes it away — and sells it. Photograph items, send them in, watch them sell from your personal inventory dashboard. No listings. No buyer messages. No post office trips.</p>
            {!submitted ? (
              <div style={{display:'flex',gap:8,marginBottom:18,maxWidth:480}}>
                <input value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==='Enter'&&joinWaitlist()} type="email" placeholder="your@email.com" style={{flex:1,padding:'14px 16px',background:T.bg,border:`1px solid ${T.bdr}`,borderRadius:10,fontSize:14,color:T.ink,fontFamily:'Inter,sans-serif'}}/>
                <button onClick={joinWaitlist} style={{padding:'14px 22px',background:T.g800,color:'#fff',borderRadius:10,fontSize:14,fontWeight:500,border:'none',cursor:'pointer',whiteSpace:'nowrap'}}>Join the waitlist →</button>
              </div>
            ) : (
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'14px 18px',background:T.g50,border:`1px solid ${T.g200}`,borderRadius:10,maxWidth:480,marginBottom:18}}>
                <span style={{color:T.g600,fontWeight:700}}>✓</span>
                <span style={{fontSize:14,color:T.g700,fontWeight:500}}>You're on the list. We'll email you when your invite is ready.</span>
              </div>
            )}
            <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
              {['Free to join','UK-based','All categories'].map(t=><span key={t} style={{fontSize:12,color:T.ink5,fontWeight:500}}>✓ {t}</span>)}
            </div>
          </div>

          <div style={{background:T.alt,borderRadius:16,overflow:'hidden',border:`1px solid ${T.bdr}`,boxShadow:'0 30px 60px -20px rgba(12,45,30,0.18)'}}>
            <div style={{display:'flex',alignItems:'center',gap:6,padding:'12px 16px',background:T.surf,borderBottom:`1px solid ${T.bdr}`}}>
              {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:'50%',background:T.bdr}}/>)}
              <span style={{marginLeft:8,fontSize:11,fontWeight:600,color:T.ink4,fontFamily:"'JetBrains Mono',monospace"}}>my.neutria.co.uk · inventory</span>
            </div>
            <div style={{padding:'18px 18px 14px',background:T.surf,borderBottom:`1px solid ${T.bdrS}`}}>
              <div style={{fontSize:11,fontWeight:700,color:T.g600,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:8}}>Your Inventory</div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
                {[['247','Items'],['£3,420','Sold'],['£8,160','Listed']].map(([v,l])=>(
                  <div key={l}><div style={{fontSize:20,fontWeight:500,color:T.ink,fontFamily:"'Instrument Serif',serif"}}>{v}</div><div style={{fontSize:10,color:T.ink4,fontWeight:500}}>{l}</div></div>
                ))}
              </div>
            </div>
            <div style={{padding:14,display:'flex',flexDirection:'column',gap:8}}>
              {[
                {t:"Vintage Levi's 501 Jeans",s:'In warehouse · listed',p:'£54',b:'⚡ 12 views',e:'👖',c:T.g600},
                {t:'Herman Miller Aeron Chair',s:'Sold · awaiting payout',p:'£530',b:'✓ Sold',e:'🪑',c:T.g700},
                {t:'Sony WH-1000XM4',s:'In warehouse · listed',p:'£145',b:'⚡ 89 views',e:'🎧',c:T.g600},
                {t:'KitchenAid Stand Mixer',s:'In transit to warehouse',p:'pending',b:'In transit',e:'🍰',c:T.ink4},
              ].map((it,i)=>(
                <div key={i} style={{background:T.surf,borderRadius:10,padding:'10px 12px',display:'flex',alignItems:'center',gap:10,border:`1px solid ${T.bdrS}`}}>
                  <span style={{fontSize:22,width:32,textAlign:'center'}}>{it.e}</span>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:T.ink,marginBottom:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.t}</div><div style={{fontSize:10,color:T.ink4}}>{it.s}</div></div>
                  <div style={{textAlign:'right'}}><div style={{fontSize:13,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace"}}>{it.p}</div><div style={{fontSize:9,color:it.c,fontWeight:600,marginTop:1}}>{it.b}</div></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{background:T.bg,padding:'88px 48px',borderBottom:`1px solid ${T.bdr}`}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:56}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g600,marginBottom:14,textTransform:'uppercase'}}>HOW IT WORKS</div>
            <h2 style={{fontSize:46,fontWeight:300,letterSpacing:'-0.03em',color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:16,lineHeight:1.05}}>You scan. We do everything else.</h2>
            <p style={{fontSize:16,color:T.ink3,maxWidth:580,margin:'0 auto',lineHeight:1.7}}>From the photo on your phone to the payout in your account — Neutria handles every step in between.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
            {[
              {n:'01',t:'Scan your items',d:'Photograph anything with our AI scanner. Identifies brand, model, condition, and market value in seconds.'},
              {n:'02',t:'Send them in',d:'Print a free prepaid label. Drop the box at any post office. Items arrive at our UK warehouse.'},
              {n:'03',t:'We list everywhere',d:'Items get listed on Neutria, eBay, Vinted, Depop — automatically. We handle every buyer message and return.'},
              {n:'04',t:'Watch from your dashboard',d:"See what's listed, what's sold, what's viewed. Get paid monthly. Donate anything unsold."},
            ].map(s=>(
              <div key={s.n} style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:14,padding:'28px 24px'}}>
                <div style={{fontSize:11,fontWeight:700,color:T.g600,letterSpacing:'0.1em',fontFamily:"'JetBrains Mono',monospace",marginBottom:16}}>{s.n}</div>
                <h3 style={{fontSize:18,fontWeight:500,color:T.ink,marginBottom:10,letterSpacing:'-0.01em'}}>{s.t}</h3>
                <p style={{fontSize:13,color:T.ink3,lineHeight:1.65}}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{background:T.surf,padding:'88px 48px',borderBottom:`1px solid ${T.bdr}`}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1.1fr',gap:64,alignItems:'center'}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g600,marginBottom:14,textTransform:'uppercase'}}>WHY NEUTRIA</div>
              <h2 style={{fontSize:42,fontWeight:300,letterSpacing:'-0.03em',color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:20,lineHeight:1.1}}>Built for people with stuff — not patience.</h2>
              <p style={{fontSize:15,color:T.ink3,lineHeight:1.75,marginBottom:24}}>Vinted is for one item. eBay takes a week per listing. Depop is for fashion. Selling a houseful of things on these platforms is a part-time job.</p>
              <p style={{fontSize:15,color:T.ink3,lineHeight:1.75}}>Neutria is for when you have <em style={{fontStyle:'italic',color:T.g700}}>fifty</em>. A whole loft. A storage unit. A house you're clearing. A wardrobe you've finally had enough of.</p>
            </div>
            <div style={{background:T.bg,borderRadius:14,border:`1px solid ${T.bdr}`,overflow:'hidden'}}>
              <div style={{padding:'18px 22px',background:T.alt,borderBottom:`1px solid ${T.bdr}`}}>
                <div style={{fontSize:11,fontWeight:700,color:T.ink4,letterSpacing:'0.08em',textTransform:'uppercase'}}>vs other platforms</div>
              </div>
              {[
                ['Time to list 50 items','Vinted: ~8 hours','Neutria: ~15 minutes'],
                ['Buyer messages handled','You','Us'],
                ['Storage of unsold items','Your house','Our warehouse'],
                ['Categories accepted','One per app','All'],
                ['Items left over','Your problem','Auto-donated'],
              ].map(([label,old,ours],i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',padding:'14px 22px',borderBottom:i<4?`1px solid ${T.bdrS}`:'none',fontSize:13,alignItems:'center'}}>
                  <div style={{color:T.ink4,fontWeight:500}}>{label}</div>
                  <div style={{color:T.ink4,textDecoration:'line-through',fontSize:12}}>{old}</div>
                  <div style={{color:T.g700,fontWeight:600}}>✓ {ours}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{background:T.g900,padding:'88px 48px',color:'#fff'}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{display:'grid',gridTemplateColumns:'1.1fr 1fr',gap:64,alignItems:'center'}}>
            <div>
              <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g300,marginBottom:14,textTransform:'uppercase'}}>FOR BRANDS & MARKETPLACES</div>
              <h2 style={{fontSize:42,fontWeight:300,letterSpacing:'-0.03em',color:'#fff',fontFamily:"'Instrument Serif',serif",marginBottom:20,lineHeight:1.1}}>Neutria, embedded in your store.</h2>
              <p style={{fontSize:15,color:T.g200,lineHeight:1.75,marginBottom:20}}>Every retailer is being asked to offer take-back and resale. Building it from scratch costs millions and takes years.</p>
              <p style={{fontSize:15,color:T.g200,lineHeight:1.75,marginBottom:30}}>Neutria is the plug-in. Your customers scan items in your branded app. Items flow into our warehouse infrastructure. Resale revenue lands back in your loyalty program.</p>
              <button onClick={()=>go('partners')} style={{padding:'12px 22px',background:'#fff',color:T.g900,borderRadius:9,fontSize:14,fontWeight:600,border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:8}}>
                See partner options
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              {[
                {t:'White-label scanner',d:'Your brand. Your colours. Our AI underneath.'},
                {t:'Warehouse access',d:'Items routed to UK fulfilment without your ops team lifting a finger.'},
                {t:'Customer loyalty',d:'Resale revenue converts to your store credit.'},
                {t:'ESG reporting',d:'Track diverted-from-landfill metrics. Built-in dashboards.'},
              ].map(b=>(
                <div key={b.t} style={{background:T.g800,borderRadius:12,padding:'22px 20px',border:`1px solid ${T.g700}`}}>
                  <div style={{fontSize:14,fontWeight:600,color:'#fff',marginBottom:8}}>{b.t}</div>
                  <div style={{fontSize:12,color:T.g300,lineHeight:1.6}}>{b.d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section style={{background:T.bg,padding:'88px 48px',borderTop:`1px solid ${T.bdr}`,borderBottom:`1px solid ${T.bdr}`}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g600,marginBottom:14,textTransform:'uppercase'}}>NINE WAYS OUT</div>
          <h2 style={{fontSize:42,fontWeight:300,letterSpacing:'-0.03em',color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:36,lineHeight:1.1}}>Every item has a destination.<br/>You decide which.</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10}}>
            {DISP.map(d=>(
              <div key={d.id} style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:10,padding:'22px 24px',display:'flex',alignItems:'center',gap:14}}>
                <span style={{fontSize:18,color:T.g600,width:22,textAlign:'center'}}>{d.i}</span>
                <span style={{fontSize:15,fontWeight:500,color:T.ink}}>{d.l}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{background:T.g900,padding:'96px 48px',textAlign:'center'}}>
        <h2 style={{fontSize:50,fontWeight:300,color:'#fff',fontFamily:"'Instrument Serif',serif",letterSpacing:'-0.03em',marginBottom:18,lineHeight:1.05}}>Get the stuff out.</h2>
        <p style={{fontSize:17,color:T.g300,marginBottom:36,maxWidth:520,margin:'0 auto 36px'}}>Be first in line when Neutria launches. UK only, free to join.</p>
        <button onClick={()=>window.scrollTo({top:0,behavior:'smooth'})} style={{padding:'15px 34px',background:'#fff',color:T.g900,borderRadius:10,fontSize:15,fontWeight:600,border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:10}}>
          Join the waitlist
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </button>
      </section>
    </div>
  );
}

// ── PARTNERS PAGE (B2B) ────────────────────────────────────────────────────
function PartnersPage({ msg }) {
  const [form, setForm] = useState({name:'',company:'',email:'',message:''});
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!form.name || !form.email || !form.company) { msg('Please complete the required fields','err'); return; }
    try { await fetch('/api/partners',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)}); } catch(e) {}
    setSent(true);
    msg("Thanks — we'll be in touch ✓");
  };

  return (
    <div style={{background:T.bg}}>
      <section style={{background:T.g900,padding:'80px 48px',color:'#fff'}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g300,marginBottom:14,textTransform:'uppercase'}}>NEUTRIA FOR BUSINESS</div>
          <h1 style={{fontSize:54,fontWeight:300,letterSpacing:'-0.035em',color:'#fff',fontFamily:"'Instrument Serif',serif",marginBottom:20,lineHeight:1.05}}>The resale infrastructure<br/>your customers expect.</h1>
          <p style={{fontSize:17,color:T.g200,maxWidth:680,lineHeight:1.65}}>Embed Neutria's AI scanner and warehouse network into your store, app, or marketplace. Your brand. Our pipes.</p>
        </div>
      </section>

      <section style={{padding:'80px 48px',background:T.surf,borderBottom:`1px solid ${T.bdr}`}}>
        <div style={{maxWidth:1200,margin:'0 auto'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g600,marginBottom:14,textTransform:'uppercase'}}>INTEGRATION OPTIONS</div>
          <h2 style={{fontSize:36,fontWeight:300,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:44,letterSpacing:'-0.02em'}}>Three ways to plug in.</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:18}}>
            {[
              {tag:'EMBED',t:'Branded scanner widget',d:'Drop our AI scanner into your customer app or website. White-labeled, fully styled to your brand.',f:['Same-day integration','iOS, Android, web SDK','Brand-styled UI']},
              {tag:'API',t:'Full developer API',d:'Programmatic access to scanning, listing, warehouse intake, and inventory tracking. Build custom workflows.',f:['REST + GraphQL','Webhook events','Sandbox environment']},
              {tag:'PARTNER',t:'Full-service partnership',d:'We build the consumer-facing flow for you. Your logo, your terms, our infrastructure end-to-end.',f:['Dedicated account team','Custom commission structure','SLA & enterprise support']},
            ].map(o=>(
              <div key={o.tag} style={{background:T.bg,border:`1px solid ${T.bdr}`,borderRadius:14,padding:'28px 24px'}}>
                <div style={{fontSize:10,fontWeight:700,color:T.g600,letterSpacing:'0.12em',fontFamily:"'JetBrains Mono',monospace",marginBottom:14}}>{o.tag}</div>
                <h3 style={{fontSize:19,fontWeight:500,color:T.ink,marginBottom:10,letterSpacing:'-0.01em'}}>{o.t}</h3>
                <p style={{fontSize:13,color:T.ink3,lineHeight:1.65,marginBottom:18}}>{o.d}</p>
                <div style={{display:'flex',flexDirection:'column',gap:6}}>
                  {o.f.map(ft=><div key={ft} style={{fontSize:12,color:T.ink2,display:'flex',gap:8}}><span style={{color:T.g600,fontWeight:700}}>✓</span>{ft}</div>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'80px 48px',background:T.bg}}>
        <div style={{maxWidth:1100,margin:'0 auto'}}>
          <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g600,marginBottom:14,textTransform:'uppercase'}}>BUILT FOR</div>
          <h2 style={{fontSize:36,fontWeight:300,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:36,letterSpacing:'-0.02em'}}>Who Neutria powers.</h2>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:14}}>
            {[
              {t:'Retailers',d:'Offer customer take-back without building a logistics arm. M&S, John Lewis, Selfridges-scale brands needing a credible resale story.'},
              {t:'Marketplaces',d:"Add a send-us-your-stuff service to your existing peer-to-peer platform. Capture casual sellers who won't list themselves."},
              {t:'Logistics & couriers',d:'Convert your warehouse capacity into a consumer-facing service. Branded as you, powered by Neutria.'},
              {t:'Charities & councils',d:'White-label our scanner for donation intake. Better triage, more revenue per item, less landfill.'},
            ].map(w=>(
              <div key={w.t} style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:12,padding:'22px 26px'}}>
                <h3 style={{fontSize:17,fontWeight:500,color:T.ink,marginBottom:8,letterSpacing:'-0.01em'}}>{w.t}</h3>
                <p style={{fontSize:13,color:T.ink3,lineHeight:1.65}}>{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{padding:'80px 48px',background:T.surf,borderTop:`1px solid ${T.bdr}`}}>
        <div style={{maxWidth:680,margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:36}}>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g600,marginBottom:14,textTransform:'uppercase'}}>GET IN TOUCH</div>
            <h2 style={{fontSize:36,fontWeight:300,color:T.ink,fontFamily:"'Instrument Serif',serif",letterSpacing:'-0.02em',marginBottom:14}}>Talk to our partnerships team.</h2>
            <p style={{fontSize:14,color:T.ink3,lineHeight:1.65}}>Tell us about your company and what you want to build.</p>
          </div>
          {sent ? (
            <div style={{background:T.g50,border:`1px solid ${T.g200}`,borderRadius:14,padding:'32px',textAlign:'center'}}>
              <div style={{fontSize:36,marginBottom:14}}>✓</div>
              <h3 style={{fontSize:20,fontWeight:500,color:T.ink,marginBottom:8}}>Thanks for reaching out</h3>
              <p style={{fontSize:14,color:T.ink3}}>We've received your message and will respond within 48 hours.</p>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:12}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
                <input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="Your name *" style={{padding:'13px 16px',background:T.bg,border:`1px solid ${T.bdr}`,borderRadius:9,fontSize:14,color:T.ink,fontFamily:'Inter,sans-serif'}}/>
                <input value={form.company} onChange={e=>setForm(p=>({...p,company:e.target.value}))} placeholder="Company *" style={{padding:'13px 16px',background:T.bg,border:`1px solid ${T.bdr}`,borderRadius:9,fontSize:14,color:T.ink,fontFamily:'Inter,sans-serif'}}/>
              </div>
              <input value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} type="email" placeholder="Work email *" style={{padding:'13px 16px',background:T.bg,border:`1px solid ${T.bdr}`,borderRadius:9,fontSize:14,color:T.ink,fontFamily:'Inter,sans-serif'}}/>
              <textarea value={form.message} onChange={e=>setForm(p=>({...p,message:e.target.value}))} placeholder="What are you hoping to build?" rows={5} style={{padding:'13px 16px',background:T.bg,border:`1px solid ${T.bdr}`,borderRadius:9,fontSize:14,color:T.ink,fontFamily:'Inter,sans-serif',resize:'vertical'}}/>
              <button onClick={submit} style={{padding:'14px',background:T.g800,color:'#fff',borderRadius:10,fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>Send message</button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

// ── SCANNER PAGE ───────────────────────────────────────────────────────────
function ScannerPage({ inv, setInv, plan, msg }) {
  const [files, setFiles] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState([]);
  const [progress, setProgress] = useState({step:0,total:0,detail:''});
  const ref = useRef();

  const pick = useCallback(f => {
    const imgs = Array.from(f).filter(x=>x.type.startsWith('image/')).slice(0,30);
    setFiles(p=>[...p,...imgs].slice(0,30));
  }, []);

  const scan = async () => {
    if (!files.length) return;
    setScanning(true);
    const res = [];
    for (let i=0; i<files.length; i++) {
      setProgress({step:i+1,total:files.length,detail:`Analysing item ${i+1} of ${files.length}…`});
      const reader = new FileReader();
      const b64 = await new Promise(r => { reader.onload=()=>r(reader.result.split(',')[1]); reader.readAsDataURL(files[i]); });
      try {
        const r = await fetch('/api/scan', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({imageBase64:b64}) });
        const data = await r.json();
        res.push({ id: Math.random().toString(36).slice(2), fileUrl: URL.createObjectURL(files[i]), disposition: 'sell', ...data });
      } catch(e) {
        res.push({id:Math.random().toString(36).slice(2),fileUrl:URL.createObjectURL(files[i]),title:'Unknown Item',suggested_price:20,condition:'Good',category:'Other',disposition:'sell'});
      }
    }
    setResults(res);
    setScanning(false);
    setFiles([]);
  };

  const publish = () => {
    const items = results.map(r=>({...r,sku:`NTR-${Math.random().toString(36).slice(2,8).toUpperCase()}`,price:r.suggested_price||20,retail:r.retail_price||0,img:'◻',createdAt:new Date().toLocaleDateString('en-GB'),seller:'you',views:0,demandLevel:r.demand||'Medium',luxuryFlag:r.luxury||false,tags:r.tags||[]}));
    setInv(p=>[...items,...p]);
    setResults([]);
    msg(`${items.length} item${items.length>1?'s':''} added to inventory ✓`);
  };

  return (
    <div style={{display:'grid',gridTemplateColumns:'320px 1fr',minHeight:'calc(100vh - 60px)'}}>
      <div style={{background:T.surf,borderRight:`1px solid ${T.bdr}`,padding:'48px 36px'}}>
        <div style={{marginBottom:32}}>
          <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
            <circle cx="16" cy="16" r="14" stroke={T.g200} strokeWidth="1" strokeDasharray="3 2"/>
            <path d="M16 3 A13 13 0 1 1 3 16" stroke={T.g400} strokeWidth="2" strokeLinecap="round"/>
            <polygon points="3,10 0,17 8,16" fill={T.g400}/>
            <circle cx="16" cy="16" r="5" fill={T.g100} stroke={T.g500} strokeWidth="1.5"/>
            <circle cx="16" cy="16" r="2.5" fill={T.g600}/>
          </svg>
        </div>
        <h1 style={{fontSize:28,fontWeight:400,color:T.ink,letterSpacing:'-0.02em',fontFamily:"'Instrument Serif',serif",marginBottom:4}}>Smart Scanner</h1>
        <div style={{fontSize:10,fontWeight:700,color:T.g500,letterSpacing:'0.1em',textTransform:'uppercase',marginBottom:20}}>AI Visual Intelligence</div>
        <p style={{fontSize:13,color:T.ink3,lineHeight:1.75,marginBottom:32}}>Upload photos of any item. Our AI identifies it, prices it, and creates a professional listing automatically.</p>
        <div style={{background:T.g50,border:`1px solid ${T.g100}`,borderRadius:10,padding:'14px 16px',marginBottom:24}}>
          <div style={{fontSize:11,fontWeight:700,color:T.g600,marginBottom:4}}>{plan.name} plan</div>
          <div style={{fontSize:12,color:T.ink3}}>{plan.scans===Infinity?'Unlimited':'Up to '+plan.scans} scans · {plan.commission}% commission</div>
        </div>
        {[['Visual recognition','Brand, model, condition'],['AI pricing','Market-based pricing'],['Auto description','Title, copy, tags'],['Warehouse routing','Direct to Neutria fulfilment']].map(([t,s])=>(
          <div key={t} style={{display:'flex',gap:12,marginBottom:16}}>
            <div style={{width:6,height:6,borderRadius:'50%',background:T.g500,marginTop:5,flexShrink:0}}/>
            <div><div style={{fontSize:13,fontWeight:600,color:T.ink,marginBottom:1}}>{t}</div><div style={{fontSize:12,color:T.ink4}}>{s}</div></div>
          </div>
        ))}
      </div>
      <div style={{background:T.bg,padding:'48px',display:'flex',flexDirection:'column',gap:20}}>
        {scanning ? (
          <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',flex:1,gap:20,minHeight:400}}>
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" style={{animation:'spin 2s linear infinite'}}>
              <path d="M16 3 A13 13 0 1 1 3 16" stroke={T.g500} strokeWidth="2.2" strokeLinecap="round"/>
              <polygon points="3,10 0,17 8,16" fill={T.g500}/>
            </svg>
            <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g600,textTransform:'uppercase'}}>AI Visual Intelligence</div>
            <div style={{fontSize:15,color:T.ink}}>{progress.detail}</div>
            <div style={{width:280,height:3,background:T.bdr,borderRadius:2,overflow:'hidden'}}>
              <div style={{height:'100%',background:T.g600,borderRadius:2,transition:'width .5s',width:`${(progress.step/Math.max(progress.total,1))*100}%`}}/>
            </div>
            <div style={{fontSize:12,color:T.ink4,fontFamily:"'JetBrains Mono',monospace"}}>{progress.step} of {progress.total}</div>
          </div>
        ) : results.length > 0 ? (
          <div>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
              <div>
                <h2 style={{fontSize:20,fontWeight:500,color:T.ink,letterSpacing:'-0.01em'}}>{results.length} item{results.length>1?'s':''} identified</h2>
                <p style={{fontSize:13,color:T.ink4,marginTop:2}}>Review and publish to inventory</p>
              </div>
              <div style={{display:'flex',gap:10}}>
                <button onClick={()=>setResults([])} style={{padding:'9px 16px',background:T.alt,border:`1px solid ${T.bdr}`,borderRadius:8,color:T.ink3,fontSize:13,cursor:'pointer'}}>Rescan</button>
                <button onClick={publish} style={{padding:'9px 20px',background:T.g800,color:'#fff',borderRadius:8,fontSize:13,fontWeight:500,border:'none',cursor:'pointer'}}>Publish all {results.length} items</button>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:16}}>
              {results.map(item=>(
                <div key={item.id} style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:12,overflow:'hidden'}}>
                  <div style={{height:160,background:T.alt,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                    {item.fileUrl&&<img src={item.fileUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
                  </div>
                  <div style={{padding:'14px 16px'}}>
                    <div style={{fontSize:10,color:T.ink5,textTransform:'uppercase',letterSpacing:'0.08em',fontWeight:600,marginBottom:4}}>{item.category}</div>
                    <div style={{fontSize:14,fontWeight:500,color:T.ink,marginBottom:4,lineHeight:1.3}}>{item.title}</div>
                    <div style={{fontSize:12,color:T.ink4,marginBottom:8}}>{item.condition}</div>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:18,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(item.suggested_price)}</span>
                      <select value={item.disposition} onChange={e=>{const d=e.target.value;setResults(p=>p.map(r=>r.id===item.id?{...r,disposition:d}:r));}} style={{fontSize:11,padding:'4px 8px',background:T.alt,border:`1px solid ${T.bdr}`,borderRadius:6,color:T.ink3}}>
                        {DISP.map(d=><option key={d.id} value={d.id}>{d.i} {d.l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div onDrop={e=>{e.preventDefault();pick(e.dataTransfer.files);}} onDragOver={e=>e.preventDefault()} onClick={()=>ref.current?.click()} style={{border:`2px dashed ${T.bdr}`,borderRadius:14,padding:'56px 40px',textAlign:'center',cursor:'pointer',background:T.surf}}>
              <input ref={ref} type="file" multiple accept="image/*" style={{display:'none'}} onChange={e=>pick(e.target.files)}/>
              <div style={{width:52,height:52,border:`1px solid ${T.bdr}`,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={T.ink4} strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              </div>
              <div style={{fontSize:16,fontWeight:500,color:T.ink,marginBottom:6}}>Drop photos here</div>
              <div style={{fontSize:13,color:T.ink4}}>or click to browse · up to 30 items at once</div>
            </div>
            {files.length>0&&(
              <div>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{fontSize:13,fontWeight:600,color:T.g700}}>{files.length} photo{files.length>1?'s':''} selected</span>
                  <button onClick={()=>setFiles([])} style={{fontSize:12,color:T.ink4,padding:'4px 10px',border:`1px solid ${T.bdr}`,borderRadius:6,cursor:'pointer',background:T.surf}}>Clear</button>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(80px,1fr))',gap:8,marginBottom:16}}>
                  {files.map((f,i)=>(
                    <div key={i} style={{position:'relative',borderRadius:8,overflow:'hidden',aspectRatio:'1',background:T.alt}}>
                      <img src={URL.createObjectURL(f)} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>
                      <button onClick={e=>{e.stopPropagation();setFiles(p=>p.filter((_,j)=>j!==i));}} style={{position:'absolute',top:3,right:3,background:'rgba(0,0,0,.5)',color:'#fff',borderRadius:'50%',width:18,height:18,fontSize:11,fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <button onClick={scan} disabled={!files.length} style={{padding:'14px',background:T.g800,color:'#fff',borderRadius:10,fontSize:15,fontWeight:500,border:'none',cursor:'pointer',opacity:files.length?1:0.4}}>
              {files.length?`Scan ${files.length} item${files.length>1?'s':''} with AI`:'Select photos to begin'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── MARKETPLACE ────────────────────────────────────────────────────────────
function MarketplacePage({ addCart, onItem }) {
  const DEMO = [
    {id:'d1',title:"Vintage Levi's 501 Jeans",category:'Clothing',condition:'Good',price:54,retail:95,img:'👖',views:142,demand:'High',luxury:false},
    {id:'d2',title:'Sony WH-1000XM4 Headphones',category:'Electronics',condition:'Excellent',price:145,retail:275,img:'🎧',views:389,demand:'High',luxury:false},
    {id:'d3',title:'KitchenAid Stand Mixer',category:'Home & Kitchen',condition:'Good',price:172,retail:335,img:'🍰',views:211,demand:'Medium',luxury:false},
    {id:'d4',title:"Arc'teryx Beta AR Jacket",category:'Clothing',condition:'Very Good',price:265,retail:585,img:'🧥',views:298,demand:'High',luxury:true},
    {id:'d5',title:'Herman Miller Aeron Chair',category:'Furniture',condition:'Good',price:530,retail:1165,img:'🪑',views:432,demand:'High',luxury:true},
    {id:'d6',title:'Nintendo Switch OLED',category:'Electronics',condition:'Very Good',price:215,retail:275,img:'🎮',views:619,demand:'High',luxury:false},
    {id:'d7',title:'Apple AirPods Pro 2nd Gen',category:'Electronics',condition:'Excellent',price:137,retail:195,img:'🎵',views:841,demand:'High',luxury:false},
    {id:'d8',title:'Rolex Submariner Watch',category:'Jewellery & Watches',condition:'Good',price:4850,retail:7400,img:'⌚',views:1203,demand:'High',luxury:true},
  ];
  const [q,setQ]=useState('');
  const filtered=DEMO.filter(i=>!q||i.title.toLowerCase().includes(q.toLowerCase()));
  return (
    <div style={{maxWidth:1280,margin:'0 auto',padding:'44px 48px'}}>
      <div style={{display:'flex',alignItems:'flex-end',justifyContent:'space-between',marginBottom:28}}>
        <h1 style={{fontSize:30,fontWeight:400,color:T.ink,letterSpacing:'-0.025em',fontFamily:"'Instrument Serif',serif"}}>Marketplace</h1>
        <div style={{position:'relative'}}>
          <svg style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)'}} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.ink5} strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input style={{paddingLeft:36,paddingRight:14,paddingTop:9,paddingBottom:9,background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:8,color:T.ink,fontSize:13,width:240}} placeholder="Search items…" value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:16}}>
        {filtered.map(item=>(
          <div key={item.id} onClick={()=>onItem(item)} style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:12,overflow:'hidden',cursor:'pointer'}}>
            <div style={{height:200,display:'flex',alignItems:'center',justifyContent:'center',background:T.alt,position:'relative'}}>
              <span style={{fontSize:52}}>{item.img}</span>
              {pct(item.price,item.retail)>0&&<div style={{position:'absolute',top:10,right:10,background:T.g800,color:'#fff',fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:5}}>−{pct(item.price,item.retail)}%</div>}
              {item.luxury&&<div style={{position:'absolute',top:10,left:10,background:T.g50,color:T.g700,fontSize:10,fontWeight:600,padding:'3px 8px',borderRadius:5,border:`1px solid ${T.g200}`}}>Luxury</div>}
            </div>
            <div style={{padding:'14px 16px'}}>
              <div style={{fontSize:10,color:T.ink5,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,marginBottom:5}}>{item.category}</div>
              <div style={{fontSize:14,fontWeight:500,color:T.ink,marginBottom:4,lineHeight:1.3}}>{item.title}</div>
              <div style={{fontSize:12,color:T.ink4,marginBottom:12}}>{item.condition}</div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div>
                  <span style={{fontSize:20,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(item.price)}</span>
                  {item.retail>item.price&&<span style={{fontSize:12,color:T.ink5,textDecoration:'line-through',marginLeft:8}}>{fmt(item.retail)}</span>}
                </div>
                <button onClick={e=>{e.stopPropagation();addCart(item);}} style={{width:32,height:32,background:T.g800,color:'#fff',borderRadius:8,fontSize:18,display:'flex',alignItems:'center',justifyContent:'center',border:'none',cursor:'pointer'}}>+</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── ITEM PAGE ──────────────────────────────────────────────────────────────
function ItemPage({ item, onBack, addCart, buyNow }) {
  return (
    <div style={{maxWidth:1000,margin:'0 auto',padding:'40px 48px'}}>
      <button onClick={onBack} style={{color:T.ink4,fontSize:13,cursor:'pointer',background:'none',border:'none',marginBottom:28,display:'block'}}>← Marketplace</button>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:56}}>
        <div style={{background:T.alt,borderRadius:16,height:400,display:'flex',alignItems:'center',justifyContent:'center',fontSize:item.fileUrl?'unset':120,overflow:'hidden'}}>
          {item.fileUrl?<img src={item.fileUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:item.img}
        </div>
        <div style={{paddingTop:8}}>
          <div style={{fontSize:11,color:T.ink5,textTransform:'uppercase',letterSpacing:'0.1em',fontWeight:600,marginBottom:12}}>{item.category}</div>
          <h1 style={{fontSize:30,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:20,lineHeight:1.2}}>{item.title}</h1>
          <div style={{display:'flex',alignItems:'baseline',gap:12,marginBottom:20}}>
            <span style={{fontSize:36,fontWeight:500,color:T.g700,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(item.price)}</span>
            {item.retail>item.price&&<span style={{fontSize:15,color:T.ink5,textDecoration:'line-through'}}>{fmt(item.retail)}</span>}
          </div>
          {item.description&&<p style={{fontSize:14,color:T.ink3,lineHeight:1.8,marginBottom:20}}>{item.description}</p>}
          <button onClick={()=>buyNow(item)} style={{width:'100%',padding:'14px',background:T.g800,color:'#fff',borderRadius:10,fontSize:15,fontWeight:500,border:'none',cursor:'pointer',marginBottom:10}}>Buy now · {fmt(item.price)}</button>
          <button onClick={()=>addCart(item)} style={{width:'100%',padding:'12px',background:T.g50,color:T.g700,borderRadius:10,fontSize:14,fontWeight:500,border:`1px solid ${T.g200}`,cursor:'pointer',marginBottom:12}}>Add to cart</button>
          <p style={{textAlign:'center',color:T.ink5,fontSize:12}}>Free UK delivery · Buyer protection · Tracked shipping</p>
        </div>
      </div>
    </div>
  );
}

// ── MEMBERSHIP ─────────────────────────────────────────────────────────────
function MembershipPage({ plan, onSelect }) {
  const [billing, setBilling] = useState('monthly');
  return (
    <div style={{background:T.bg}}>
      <div style={{background:T.surf,borderBottom:`1px solid ${T.bdr}`,padding:'64px 48px 48px',textAlign:'center'}}>
        <div style={{fontSize:10,fontWeight:700,letterSpacing:'0.14em',color:T.g500,marginBottom:14,textTransform:'uppercase'}}>MEMBERSHIP</div>
        <h1 style={{fontSize:52,fontWeight:300,letterSpacing:'-0.035em',color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:16,lineHeight:1.1}}>Choose your plan.</h1>
        <p style={{fontSize:16,color:T.ink3,maxWidth:440,margin:'0 auto 36px'}}>From casual decluttering to full-scale resale. Every tier includes AI scanning.</p>
        <div style={{display:'inline-flex',background:T.alt,borderRadius:10,padding:4,gap:2}}>
          {['monthly','annual'].map(b=>(
            <button key={b} onClick={()=>setBilling(b)} style={{padding:'8px 20px',borderRadius:7,border:'none',cursor:'pointer',fontSize:13,fontWeight:500,background:billing===b?T.surf:'transparent',color:billing===b?T.ink:T.ink4,boxShadow:billing===b?'0 1px 4px rgba(0,0,0,.08)':'none'}}>
              {b==='monthly'?'Monthly':'Annual'}
              {b==='annual'&&<span style={{marginLeft:8,fontSize:10,fontWeight:700,color:T.g600,background:T.g50,padding:'2px 6px',borderRadius:4}}>−20%</span>}
            </button>
          ))}
        </div>
      </div>
      <div style={{maxWidth:1200,margin:'0 auto',padding:'48px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16}}>
          {PLANS.map(p=>(
            <div key={p.id} style={{background:T.surf,border:`2px solid ${plan.id===p.id?T.g600:T.bdr}`,borderRadius:16,overflow:'hidden',position:'relative'}}>
              {p.badge&&<div style={{position:'absolute',top:16,right:16,fontSize:9,fontWeight:800,background:p.highlight?T.g800:T.g50,color:p.highlight?'#fff':T.g700,padding:'3px 8px',borderRadius:20,letterSpacing:'0.06em'}}>{p.badge}</div>}
              {plan.id===p.id&&<div style={{position:'absolute',top:0,left:0,right:0,height:3,background:T.g600}}/>}
              <div style={{padding:'28px 24px',borderBottom:`1px solid ${T.bdrS}`}}>
                <div style={{fontSize:12,fontWeight:700,color:T.g600,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:8}}>{p.name}</div>
                <div style={{display:'flex',alignItems:'baseline',gap:4,marginBottom:8}}>
                  <span style={{fontSize:40,fontWeight:300,color:T.ink,fontFamily:"'Instrument Serif',serif"}}>{p.price===0?'Free':`£${billing==='annual'?Math.round(p.price*.8):p.price}`}</span>
                  {p.price>0&&<span style={{fontSize:13,color:T.ink4}}>/mo</span>}
                </div>
                <p style={{fontSize:13,color:T.ink4,lineHeight:1.5}}>{p.period}</p>
              </div>
              <div style={{padding:'24px'}}>
                <div style={{display:'flex',flexDirection:'column',gap:10,marginBottom:24}}>
                  {p.features.map((f,i)=>(
                    <div key={i} style={{display:'flex',gap:10}}>
                      <span style={{color:T.g600,fontWeight:700,fontSize:13,flexShrink:0}}>✓</span>
                      <span style={{fontSize:13,color:T.ink2,lineHeight:1.4}}>{f}</span>
                    </div>
                  ))}
                </div>
                <button onClick={()=>onSelect(p)} style={{width:'100%',padding:'11px',background:plan.id===p.id?T.alt:p.highlight?T.g800:T.g900,color:plan.id===p.id?T.ink3:'#fff',border:`1px solid ${plan.id===p.id?T.bdr:p.highlight?T.g800:T.g900}`,borderRadius:9,fontSize:13,fontWeight:600,cursor:'pointer'}}>{plan.id===p.id?'Current plan':p.cta}</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ──────────────────────────────────────────────────────────────
function DashboardPage({ inv, orders, plan, go }) {
  const totalVal = inv.reduce((s,i)=>s+(i.price||0),0);
  return (
    <div style={{maxWidth:1100,margin:'0 auto',padding:'40px 48px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',marginBottom:32}}>
        <div>
          <h1 style={{fontSize:30,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif"}}>Your inventory</h1>
          <p style={{fontSize:13,color:T.ink4,marginTop:4}}>Track everything you've sent in</p>
        </div>
        <button onClick={()=>go('scanner')} style={{padding:'9px 20px',background:T.g800,color:'#fff',borderRadius:8,fontSize:13,fontWeight:500,border:'none',cursor:'pointer'}}>+ Add items</button>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:24}}>
        {[['Items in warehouse',inv.length,''],['Total value',`£${Math.round(totalVal).toLocaleString()}`,''],['Sold this month',orders.length,''],['Plan',plan.name,'']].map(([l,v,u])=>(
          <div key={l} style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:12,padding:'22px 20px'}}>
            <div style={{fontSize:11,fontWeight:500,color:T.ink4,marginBottom:10}}>{l}</div>
            <div style={{fontSize:28,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif"}}>{v}<span style={{fontSize:14,color:T.ink4,marginLeft:6}}>{u}</span></div>
          </div>
        ))}
      </div>
      {inv.length===0?(
        <div style={{textAlign:'center',padding:'64px 0'}}>
          <div style={{fontSize:48,marginBottom:16,opacity:.3}}>◻</div>
          <div style={{fontSize:18,fontWeight:500,color:T.ink,marginBottom:8}}>Nothing here yet</div>
          <p style={{fontSize:14,color:T.ink4,marginBottom:24}}>Scan your first items to get started</p>
          <button onClick={()=>go('scanner')} style={{padding:'10px 22px',background:T.g800,color:'#fff',borderRadius:8,fontSize:13,fontWeight:500,border:'none',cursor:'pointer'}}>Open Scanner →</button>
        </div>
      ):(
        <div style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:12,padding:'24px'}}>
          <div style={{fontSize:11,fontWeight:700,letterSpacing:'0.1em',color:T.g600,textTransform:'uppercase',marginBottom:18}}>Recent inventory</div>
          {inv.slice(0,10).map(item=>(
            <div key={item.id} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom:`1px solid ${T.bdrS}`}}>
              <div style={{width:44,height:44,borderRadius:8,background:T.alt,overflow:'hidden',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                {item.fileUrl?<img src={item.fileUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:22}}>{item.img||'◻'}</span>}
              </div>
              <div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.ink}}>{item.title}</div><div style={{fontSize:11,color:T.ink5,marginTop:1}}>{item.sku} · {item.condition}</div></div>
              <span style={{fontSize:16,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(item.price)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── CART ───────────────────────────────────────────────────────────────────
function CartPage({ cart, setCart, go, onCheckout }) {
  const total = cart.reduce((s,i)=>s+(i.price||0),0);
  return (
    <div style={{maxWidth:760,margin:'0 auto',padding:'48px'}}>
      <h1 style={{fontSize:30,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:8}}>Your cart</h1>
      <p style={{fontSize:13,color:T.ink4,marginBottom:36}}>{cart.length} item{cart.length!==1?'s':''}</p>
      {cart.length===0?(
        <div style={{textAlign:'center',padding:'80px 0'}}>
          <div style={{fontSize:18,fontWeight:500,color:T.ink,marginBottom:8}}>Your cart is empty</div>
          <button onClick={()=>go('marketplace')} style={{padding:'10px 24px',background:T.g800,color:'#fff',borderRadius:8,fontSize:13,fontWeight:500,border:'none',cursor:'pointer',marginTop:16}}>Browse marketplace →</button>
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'1fr 300px',gap:32}}>
          <div>
            {cart.map(item=>(
              <div key={item.id} style={{display:'flex',gap:16,padding:'20px 0',borderBottom:`1px solid ${T.bdrS}`,alignItems:'center'}}>
                <div style={{width:80,height:80,borderRadius:10,background:T.alt,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'}}>
                  {item.fileUrl?<img src={item.fileUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:36}}>{item.img}</span>}
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:15,fontWeight:500,color:T.ink,marginBottom:3}}>{item.title}</div>
                  <div style={{fontSize:12,color:T.ink4}}>{item.condition}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:20,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace",marginBottom:8}}>{fmt(item.price)}</div>
                  <button onClick={()=>setCart(p=>p.filter(c=>c.id!==item.id))} style={{fontSize:12,color:T.ink5,cursor:'pointer',background:'none',border:'none',textDecoration:'underline'}}>Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:14,padding:'24px',height:'fit-content',position:'sticky',top:80}}>
            <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:16}}>Order summary</div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:T.ink3,marginBottom:8}}><span>Subtotal</span><span style={{fontFamily:"'JetBrains Mono',monospace"}}>{fmt(total)}</span></div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:13,color:T.ink3,marginBottom:16}}><span>Delivery</span><span style={{color:T.g600,fontWeight:600}}>Free</span></div>
            <div style={{borderTop:`1px solid ${T.bdrS}`,paddingTop:12,display:'flex',justifyContent:'space-between',fontSize:17,fontWeight:600,color:T.ink,marginBottom:16}}>
              <span>Total</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:T.g700}}>{fmt(total)}</span>
            </div>
            <button onClick={()=>onCheckout(cart)} style={{width:'100%',padding:'13px',background:T.g800,color:'#fff',borderRadius:9,fontSize:14,fontWeight:500,border:'none',cursor:'pointer'}}>Proceed to checkout</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── CHECKOUT ───────────────────────────────────────────────────────────────
function CheckoutPage({ items, onBack, onPlace }) {
  const [step, setStep] = useState(1);
  const [addr, setAddr] = useState({name:'',line1:'',city:'',postcode:'',phone:''});
  const [card, setCard] = useState({number:'',expiry:'',cvc:'',name:''});
  const [placing, setPlacing] = useState(false);
  const total = items?.reduce((s,i)=>s+(i.price||0),0)||0;
  const setA = (k,v) => setAddr(p=>({...p,[k]:v}));
  const setC = (k,v) => setCard(p=>({...p,[k]:v}));
  const addrDone = addr.name&&addr.line1&&addr.city&&addr.postcode;
  const cardDone = card.number.replace(/\s/g,'').length===16&&card.expiry&&card.cvc&&card.name;
  const inp = {background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:9,padding:'11px 13px',color:T.ink,fontSize:13,width:'100%',fontFamily:'Inter,sans-serif'};

  const handlePlace = async () => {
    setPlacing(true);
    await new Promise(r=>setTimeout(r,1200));
    onPlace(items, addr, card.number.slice(-4));
    setPlacing(false);
  };

  return (
    <div style={{minHeight:'calc(100vh - 60px)',background:T.bg}}>
      <div style={{background:T.surf,borderBottom:`1px solid ${T.bdr}`,padding:'16px 48px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <div style={{width:32,height:32,background:T.g800,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center'}}><Logo size={18}/></div>
          <div><div style={{fontSize:14,fontWeight:600,color:T.ink}}>Neutria <span style={{color:T.g600}}>Pay</span></div><div style={{fontSize:10,color:T.ink5,fontWeight:600,letterSpacing:'0.08em'}}>SECURE CHECKOUT</div></div>
        </div>
        <div style={{fontSize:12,color:T.ink4,display:'flex',alignItems:'center',gap:6}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={T.g500} strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          256-bit SSL encrypted
        </div>
      </div>
      <div style={{maxWidth:960,margin:'0 auto',padding:'40px 48px'}}>
        <button onClick={onBack} style={{color:T.ink4,fontSize:13,cursor:'pointer',background:'none',border:'none',marginBottom:28,display:'block'}}>← Back</button>
        <div style={{display:'grid',gridTemplateColumns:'1fr 340px',gap:48}}>
          <div>
            <div style={{display:'flex',gap:0,marginBottom:32,background:T.alt,borderRadius:10,padding:4}}>
              {['Delivery','Payment','Confirm'].map((s,i)=>(
                <button key={i} onClick={()=>i<step-1&&setStep(i+1)} style={{flex:1,padding:'9px',borderRadius:7,border:'none',cursor:i<step-1?'pointer':'default',fontSize:12,fontWeight:step===i+1?600:500,background:step===i+1?T.surf:'transparent',color:step===i+1?T.g700:step>i+1?T.g500:T.ink5,boxShadow:step===i+1?'0 1px 4px rgba(0,0,0,.06)':'none'}}>
                  <span style={{fontSize:10,marginRight:6,fontFamily:"'JetBrains Mono',monospace",fontWeight:700}}>{String(i+1).padStart(2,'0')}</span>{s}
                </button>
              ))}
            </div>
            {step===1&&(
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <h2 style={{fontSize:22,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:4}}>Delivery address</h2>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Full name</div><input style={inp} value={addr.name} onChange={e=>setA('name',e.target.value)} placeholder="Jane Smith"/></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Phone</div><input style={inp} value={addr.phone} onChange={e=>setA('phone',e.target.value)} placeholder="+44 7700 000000"/></div>
                </div>
                <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Address line 1</div><input style={inp} value={addr.line1} onChange={e=>setA('line1',e.target.value)} placeholder="12 High Street"/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Town / City</div><input style={inp} value={addr.city} onChange={e=>setA('city',e.target.value)} placeholder="London"/></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Postcode</div><input style={inp} value={addr.postcode} onChange={e=>setA('postcode',e.target.value.toUpperCase())} placeholder="EC1A 1BB"/></div>
                </div>
                <button onClick={()=>setStep(2)} disabled={!addrDone} style={{padding:'13px',background:T.g800,color:'#fff',borderRadius:9,fontSize:14,fontWeight:500,border:'none',cursor:'pointer',opacity:addrDone?1:0.4,marginTop:8}}>Continue to payment →</button>
              </div>
            )}
            {step===2&&(
              <div style={{display:'flex',flexDirection:'column',gap:14}}>
                <h2 style={{fontSize:22,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:4}}>Payment</h2>
                <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Name on card</div><input style={inp} value={card.name} onChange={e=>setC('name',e.target.value.toUpperCase())} placeholder="JANE SMITH"/></div>
                <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Card number</div><input style={inp} value={card.number} onChange={e=>setC('number',e.target.value.replace(/\D/g,'').replace(/(.{4})/g,'$1 ').trim().slice(0,19))} placeholder="1234 5678 9012 3456" maxLength={19}/></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
                  <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>Expiry</div><input style={inp} value={card.expiry} onChange={e=>setC('expiry',e.target.value.replace(/\D/g,'').replace(/(\d{2})(\d)/,'$1/$2').slice(0,5))} placeholder="MM/YY" maxLength={5}/></div>
                  <div><div style={{fontSize:10,fontWeight:700,color:T.ink5,letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:5}}>CVC</div><input style={inp} value={card.cvc} onChange={e=>setC('cvc',e.target.value.replace(/\D/g,'').slice(0,4))} placeholder="123" maxLength={4} type="password"/></div>
                </div>
                <div style={{display:'flex',gap:10,marginTop:8}}>
                  <button onClick={()=>setStep(1)} style={{flex:1,padding:'12px',background:T.alt,border:`1px solid ${T.bdr}`,borderRadius:9,color:T.ink3,fontSize:13,fontWeight:500,cursor:'pointer'}}>← Back</button>
                  <button onClick={()=>setStep(3)} disabled={!cardDone} style={{flex:2,padding:'12px',background:T.g800,color:'#fff',borderRadius:9,fontSize:14,fontWeight:500,border:'none',cursor:'pointer',opacity:cardDone?1:0.4}}>Review order →</button>
                </div>
              </div>
            )}
            {step===3&&(
              <div style={{display:'flex',flexDirection:'column',gap:16}}>
                <h2 style={{fontSize:22,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:4}}>Review your order</h2>
                <div style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:12,padding:'14px 20px'}}>
                  <div style={{fontSize:13,color:T.ink2,marginBottom:4}}>{addr.name} · {addr.line1}, {addr.city} {addr.postcode}</div>
                  <div style={{fontSize:13,color:T.ink2}}>•••• •••• •••• {card.number.replace(/\s/g,'').slice(-4)}</div>
                </div>
                <button onClick={handlePlace} disabled={placing} style={{padding:'13px',background:T.g800,color:'#fff',borderRadius:9,fontSize:14,fontWeight:600,border:'none',cursor:'pointer'}}>{placing?'Processing…':`Pay ${fmt(total)} · Neutria Pay`}</button>
              </div>
            )}
          </div>
          <div style={{paddingTop:60}}>
            <div style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:14,padding:'20px',position:'sticky',top:80}}>
              <div style={{fontSize:13,fontWeight:600,color:T.ink,marginBottom:14}}>Order summary</div>
              {items?.map(it=>(
                <div key={it.id} style={{display:'flex',gap:10,alignItems:'center',marginBottom:12}}>
                  <div style={{width:44,height:44,borderRadius:8,background:T.alt,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
                    {it.fileUrl?<img src={it.fileUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:20}}>{it.img}</span>}
                  </div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:500,color:T.ink,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{it.title}</div><div style={{fontSize:11,color:T.ink4}}>{it.condition}</div></div>
                  <span style={{fontSize:14,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace",flexShrink:0}}>{fmt(it.price)}</span>
                </div>
              ))}
              <div style={{borderTop:`1px solid ${T.bdrS}`,paddingTop:12,marginTop:4}}>
                <div style={{display:'flex',justifyContent:'space-between',fontSize:15,fontWeight:600,color:T.ink}}><span>Total</span><span style={{fontFamily:"'JetBrains Mono',monospace",color:T.g700}}>{fmt(total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ORDERS ─────────────────────────────────────────────────────────────────
function OrdersPage({ orders, go, onOrder }) {
  return (
    <div style={{maxWidth:760,margin:'0 auto',padding:'48px'}}>
      <h1 style={{fontSize:30,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:8}}>Your orders</h1>
      <p style={{fontSize:13,color:T.ink4,marginBottom:36}}>{orders.length} order{orders.length!==1?'s':''}</p>
      {orders.length===0?(
        <div style={{textAlign:'center',padding:'80px 0'}}>
          <div style={{fontSize:18,fontWeight:500,color:T.ink,marginBottom:8}}>No orders yet</div>
          <button onClick={()=>go('marketplace')} style={{padding:'10px 24px',background:T.g800,color:'#fff',borderRadius:8,fontSize:13,fontWeight:500,border:'none',cursor:'pointer',marginTop:16}}>Browse marketplace →</button>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {orders.map(order=>(
            <div key={order.id} onClick={()=>onOrder(order)} style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:14,padding:'20px 24px',display:'flex',gap:16,alignItems:'center',cursor:'pointer'}}>
              <div style={{width:64,height:64,borderRadius:10,background:T.alt,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
                {order.item?.fileUrl?<img src={order.item.fileUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:28}}>{order.item?.img}</span>}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:15,fontWeight:500,color:T.ink,marginBottom:3}}>{order.item?.title}</div>
                <div style={{fontSize:12,color:T.ink4,marginBottom:6}}>{order.placedAt} · {order.id}</div>
                <span style={{fontSize:11,fontWeight:700,padding:'2px 8px',borderRadius:20,background:T.g50,color:T.g600}}>✓ {order.status}</span>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:18,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(order.item?.price)}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── ORDER DETAIL ───────────────────────────────────────────────────────────
function OrderDetailPage({ order, onBack }) {
  if (!order) return null;
  return (
    <div style={{maxWidth:760,margin:'0 auto',padding:'48px'}}>
      <button onClick={onBack} style={{color:T.ink4,fontSize:13,cursor:'pointer',background:'none',border:'none',marginBottom:28,display:'block'}}>← Orders</button>
      <h1 style={{fontSize:28,fontWeight:400,color:T.ink,fontFamily:"'Instrument Serif',serif",marginBottom:4}}>Order {order.id}</h1>
      <p style={{fontSize:13,color:T.ink4,marginBottom:24}}>Placed {order.placedAt}</p>
      <div style={{background:T.surf,border:`1px solid ${T.bdr}`,borderRadius:14,padding:'20px 24px',display:'flex',gap:16,alignItems:'center'}}>
        <div style={{width:64,height:64,borderRadius:10,background:T.alt,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,overflow:'hidden'}}>
          {order.item?.fileUrl?<img src={order.item.fileUrl} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:28}}>{order.item?.img}</span>}
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:15,fontWeight:500,color:T.ink}}>{order.item?.title}</div>
          <div style={{fontSize:12,color:T.ink4,marginTop:2}}>{order.item?.condition}</div>
        </div>
        <div style={{fontSize:22,fontWeight:600,color:T.g700,fontFamily:"'JetBrains Mono',monospace"}}>{fmt(order.item?.price)}</div>
      </div>
    </div>
  );
}
