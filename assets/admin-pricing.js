/* Advanced plan and pricing control center. */
(function(){
  const configGroup=adminV2Groups.find(g=>g[0]==='Configuration');
  if(configGroup&&!configGroup[1].includes('Plan Management')) configGroup[1].splice(4,0,'Plan Management');

  const defaults={
    plans:[
      {name:'Basic',code:'BASIC',model:'Both',monthly:0,minRecharge:500,discount:0,users:2,status:'Active'},
      {name:'Gold',code:'GOLD',model:'Both',monthly:999,minRecharge:2500,discount:5,users:8,status:'Active'},
      {name:'Platinum',code:'PLATINUM',model:'Both',monthly:2499,minRecharge:5000,discount:10,users:20,status:'Active'},
      {name:'Diamond',code:'DIAMOND',model:'Both',monthly:4999,minRecharge:10000,discount:15,users:50,status:'Active'}
    ],
    b2cZones:[
      {code:'A',name:'Local',description:'Within pickup city',status:'Active'},
      {code:'B',name:'Regional',description:'Within state / adjoining region',status:'Active'},
      {code:'C',name:'Metro',description:'Major metro routes',status:'Active'},
      {code:'D',name:'National',description:'Rest of India',status:'Active'},
      {code:'E',name:'Special',description:'NE, J&K and special locations',status:'Active'}
    ],
    b2bZones:[
      {code:'N',name:'North',description:'North India',status:'Active'},
      {code:'W',name:'West',description:'West India',status:'Active'},
      {code:'S',name:'South',description:'South India',status:'Active'},
      {code:'E',name:'East',description:'East India',status:'Active'},
      {code:'NE',name:'North East',description:'North East India',status:'Active'}
    ],
    b2cRates:[
      {courier:'Delhivery B2C Surface',provider:'Delhivery',plan:'Basic',mode:'Surface',other:0,slabs:[{from:0,to:500},{from:500,to:1000},{from:1000,to:2000},{from:2000,to:5000},{from:5000,to:'∞'}],base:35},
      {courier:'FShip Surface',provider:'FShip',plan:'Basic',mode:'Surface',other:0,slabs:[{from:0,to:500},{from:500,to:1000},{from:1000,to:2000},{from:2000,to:5000},{from:5000,to:'∞'}],base:38},
      {courier:'Blue Dart Express',provider:'Blue Dart',plan:'Gold',mode:'Express',other:18,slabs:[{from:0,to:500},{from:500,to:1000},{from:1000,to:2000}],base:52}
    ],
    b2bRates:[
      {courier:'Delhivery B2B LTL',plan:'Basic',origin:'N',destination:'N',rate:40,rto:32,divisor:5000},
      {courier:'Delhivery B2B LTL',plan:'Basic',origin:'N',destination:'W',rate:50,rto:40,divisor:5000},
      {courier:'Delhivery B2B LTL',plan:'Basic',origin:'N',destination:'S',rate:60,rto:48,divisor:5000},
      {courier:'Delhivery B2B LTL',plan:'Basic',origin:'W',destination:'N',rate:50,rto:40,divisor:5000},
      {courier:'DTDC Cargo',plan:'Gold',origin:'W',destination:'S',rate:48,rto:39,divisor:4500}
    ],
    pincodes:[
      {pincode:'110001',city:'New Delhi',state:'Delhi',zone:'N',oda:'No',status:'Active'},
      {pincode:'400001',city:'Mumbai',state:'Maharashtra',zone:'W',oda:'No',status:'Active'},
      {pincode:'560001',city:'Bengaluru',state:'Karnataka',zone:'S',oda:'No',status:'Active'},
      {pincode:'781001',city:'Guwahati',state:'Assam',zone:'NE',oda:'Yes',status:'Active'}
    ]
  };
  Object.keys(defaults).forEach(k=>adminData[k]=read('sc_admin_'+k,defaults[k]));
  const persist=k=>saveAdmin('sc_admin_'+k,adminData[k]);
  const planNames=()=>adminData.plans.filter(p=>p.status==='Active').map(p=>p.name);
  const zoneName=(type,code)=>(adminData[type==='B2C'?'b2cZones':'b2bZones'].find(z=>z.code===code)||{name:code}).name;

  function actionButtons(kind,index){return `<div class="table-actions"><button data-edit-${kind}="${index}">Edit</button><button class="danger-outline" data-delete-${kind}="${index}">Delete</button></div>`}
  function pricingTable(headers,rows){return `<div class="admin-table-wrap"><table class="data-table admin-table"><thead><tr>${headers.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(row=>`<tr>${row.map(cell=>`<td>${cell}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${headers.length}"><div class="empty-admin"><b>No records found</b>Add a record to get started.</div></td></tr>`}</tbody></table></div>`}
  function planManagementV3(){
    const rows=adminData.plans;
    $('#adminContent').innerHTML=pageHead('CONFIGURATION','Plan Management','Create subscription plans and control which B2B/B2C rate cards sellers can use.',`<button class="button ghost" id="exportPlans">Export plans</button><button class="button" id="addPlan">+ Add plan</button>`)+
    `<section class="plan-card-grid">${rows.map((p,i)=>`<article class="plan-card ${p.status==='Inactive'?'muted':''}"><div><span>${esc(p.code)}</span><button class="switch ${p.status==='Active'?'on':''}" data-plan-toggle="${i}" aria-label="Toggle ${esc(p.name)}"></button></div><h3>${esc(p.name)}</h3><strong>${money(p.monthly)}<small>/month</small></strong><ul><li>${esc(p.model)} shipping</li><li>${p.discount}% rate discount</li><li>${p.users} team members</li><li>Min. recharge ${money(p.minRecharge)}</li></ul><div>${actionButtons('plan',i)}</div></article>`).join('')}</section>`+
    `<article class="admin-card recent-card"><div class="admin-card-head"><div><small>PLAN DIRECTORY</small><b>Pricing and access rules</b></div><span>${rows.length} plans</span></div>${pricingTable(['PLAN','MODEL','MONTHLY FEE','MIN RECHARGE','DISCOUNT','TEAM LIMIT','STATUS','ACTION'],rows.map((p,i)=>[esc(p.name),esc(p.model),money(p.monthly),money(p.minRecharge),p.discount+'%',p.users,esc(p.status),`<button class="small-action secondary" data-edit-plan="${i}">Edit</button>`]))}</article>`;
    $('#addPlan').onclick=()=>planEditorV3();
    $('#exportPlans').onclick=()=>download('seller-plans.csv',[['Plan','Code','Model','Monthly Fee','Minimum Recharge','Discount','Team Limit','Status'],...rows.map(p=>Object.values(p))]);
    $$('[data-edit-plan]').forEach(b=>b.onclick=()=>planEditorV3(rows[+b.dataset.editPlan],+b.dataset.editPlan));
    $$('[data-plan-toggle]').forEach(b=>b.onclick=()=>{const p=rows[+b.dataset.planToggle];p.status=p.status==='Active'?'Inactive':'Active';persist('plans');auditV2('Changed plan status','Plans',`${p.name}: ${p.status}`);planManagementV3()});
    $$('[data-delete-plan]').forEach(b=>b.onclick=()=>{const i=+b.dataset.deletePlan;if(!confirm(`Delete ${rows[i].name} plan?`))return;rows.splice(i,1);persist('plans');planManagementV3()});
  }
  function planEditorV3(value,index){
    modalFormV2(value?'Edit plan':'Add plan',[['Plan name','name'],['Plan code','code'],['Applicable model','model','select',['Both','B2C','B2B']],['Monthly fee','monthly','number'],['Minimum recharge','minRecharge','number'],['Rate discount %','discount','number'],['Team member limit','users','number'],['Status','status','select',['Active','Inactive']]],d=>{const rec={...d,monthly:+d.monthly,minRecharge:+d.minRecharge,discount:+d.discount,users:+d.users};if(index===undefined)adminData.plans.push(rec);else adminData.plans[index]=rec;persist('plans');auditV2(index===undefined?'Created plan':'Updated plan','Plans',rec.name);planManagementV3()},value||{model:'Both',status:'Active',monthly:0,minRecharge:500,discount:0,users:2});
  }

  function pricingManagementV3(type,tab){
    tab=tab||(type==='B2C'?'Zones':'Zones');
    const tabs=type==='B2C'?['Zones','Pricing','Weight Slabs','Additional Charges','Quote Calculator']:['Zones','Pincodes','Rate Matrix','Additional Charges','Quote Calculator'];
    $('#adminContent').innerHTML=pageHead('CONFIGURATION',`${type} Pricing Management`,`Manage ${type} zones, plans, rates, surcharges and serviceability from one place.`)+`<article class="admin-card pricing-shell"><div class="pricing-tabs">${tabs.map(t=>`<button class="${t===tab?'active':''}" data-price-tab="${t}">${t}</button>`).join('')}</div><div id="pricingPane"></div></article>`;
    $$('[data-price-tab]').forEach(b=>b.onclick=()=>pricingManagementV3(type,b.dataset.priceTab));
    const pane=$('#pricingPane');
    if(tab==='Zones') renderZonesV3(type,pane);
    else if(tab==='Pricing'||tab==='Rate Matrix') renderRatesV3(type,pane);
    else if(tab==='Weight Slabs') renderSlabOverviewV3(pane);
    else if(tab==='Pincodes') renderPincodesV3(pane);
    else if(tab==='Additional Charges') renderChargesInlineV3(type,pane);
    else renderQuoteV3(type,pane);
  }
  function renderZonesV3(type,pane){
    const key=type==='B2C'?'b2cZones':'b2bZones',rows=adminData[key];
    pane.innerHTML=`<div class="pricing-title"><div><small>${type} CONFIGURATION</small><h2>${type} Zones</h2><p>Manage geographic zones used in rate calculation.</p></div><button class="button" id="addZoneV3">+ Add zone</button></div><div class="pricing-toolbar"><input id="zoneSearchV3" placeholder="Search code, name or description"><span>${rows.length} total · ${rows.filter(z=>z.status==='Active').length} active</span></div><div id="zoneTableV3">${zoneTable()}</div>`;
    function zoneTable(list=rows){return pricingTable(['CODE','NAME','DESCRIPTION','STATUS','ACTION'],list.map(z=>{const i=rows.indexOf(z);return [`<b>${esc(z.code)}</b>`,esc(z.name),esc(z.description),`<button class="switch ${z.status==='Active'?'on':''}" data-zone-toggle="${i}"></button>`,actionButtons('zone',i)]}))}
    const bind=()=>{$$('[data-zone-toggle]').forEach(b=>b.onclick=()=>{const z=rows[+b.dataset.zoneToggle];z.status=z.status==='Active'?'Inactive':'Active';persist(key);renderZonesV3(type,pane)});$$('[data-edit-zone]').forEach(b=>b.onclick=()=>zoneEditorV3(type,rows[+b.dataset.editZone],+b.dataset.editZone));$$('[data-delete-zone]').forEach(b=>b.onclick=()=>{const i=+b.dataset.deleteZone;if(!confirm(`Delete zone ${rows[i].code}?`))return;rows.splice(i,1);persist(key);renderZonesV3(type,pane)})};bind();
    $('#addZoneV3').onclick=()=>zoneEditorV3(type);
    $('#zoneSearchV3').oninput=e=>{const q=e.target.value.toLowerCase();$('#zoneTableV3').innerHTML=zoneTable(rows.filter(z=>Object.values(z).join(' ').toLowerCase().includes(q)));bind()};
  }
  function zoneEditorV3(type,value,index){const key=type==='B2C'?'b2cZones':'b2bZones';modalFormV2(value?'Edit zone':'Add zone',[['Zone code','code'],['Zone name','name'],['Description','description'],['Status','status','select',['Active','Inactive']]],d=>{if(index===undefined)adminData[key].push(d);else adminData[key][index]=d;persist(key);auditV2(index===undefined?'Created zone':'Updated zone',`${type} Pricing`,d.code);closeModal();pricingManagementV3(type,'Zones')},value||{status:'Active'})}

  function renderRatesV3(type,pane){
    const key=type==='B2C'?'b2cRates':'b2bRates',rows=adminData[key];
    pane.innerHTML=`<div class="pricing-title"><div><small>${type} RATE ENGINE</small><h2>${type==='B2C'?'Courier Pricing':'Zone Rate Matrix'}</h2><p>${type==='B2C'?'Configure plan-wise weight slabs and forward/RTO/COD rates.':'Configure per-kg lane rates, RTO and volumetric divisor.'}</p></div><div class="admin-filters"><button class="button ghost" id="importPricingV3">Import CSV</button><button class="button ghost" id="exportPricingV3">Export</button><button class="button" id="addPricingV3">+ Add rate</button></div></div><div class="pricing-toolbar"><input id="rateSearchV3" placeholder="Search courier, provider, plan or zone"><select id="ratePlanV3"><option value="">All plans</option>${planNames().map(x=>`<option>${esc(x)}</option>`).join('')}</select><span>${rows.length} rates</span></div><div id="ratesTableV3">${ratesTable()}</div>`;
    function ratesTable(list=rows){return type==='B2C'?pricingTable(['COURIER','PROVIDER','PLAN','MODE','WEIGHT SLABS','OTHER CHARGE','ACTION'],list.map(r=>{const i=rows.indexOf(r);return [esc(r.courier),`<span class="rate-tag blue">${esc(r.provider)}</span>`,`<span class="rate-tag gold">${esc(r.plan)}</span>`,`<span class="rate-tag green">${esc(r.mode)}</span>`,`<div class="slab-chips">${r.slabs.map(s=>`<i>${s.from}g–${s.to}g</i>`).join('')}</div>`,money(r.other),actionButtons('rate',i)]})):pricingTable(['ORIGIN ZONE','DESTINATION ZONE','PLAN','RATE/KG','RTO RATE/KG','VOL. DIVISOR','COURIER','ACTION'],list.map(r=>{const i=rows.indexOf(r);return [`${esc(r.origin)} - ${esc(zoneName(type,r.origin))}`,`${esc(r.destination)} - ${esc(zoneName(type,r.destination))}`,esc(r.plan),money(r.rate),money(r.rto),r.divisor,esc(r.courier),actionButtons('rate',i)]}))}
    const bind=()=>{$$('[data-edit-rate]').forEach(b=>b.onclick=()=>type==='B2C'?b2cRateEditorV3(rows[+b.dataset.editRate],+b.dataset.editRate):b2bRateEditorV3(rows[+b.dataset.editRate],+b.dataset.editRate));$$('[data-delete-rate]').forEach(b=>b.onclick=()=>{const i=+b.dataset.deleteRate;if(!confirm('Delete this rate card?'))return;rows.splice(i,1);persist(key);renderRatesV3(type,pane)})};bind();
    const filter=()=>{const q=$('#rateSearchV3').value.toLowerCase(),p=$('#ratePlanV3').value;$('#ratesTableV3').innerHTML=ratesTable(rows.filter(r=>(!q||Object.values(r).join(' ').toLowerCase().includes(q))&&(!p||r.plan===p)));bind()};
    $('#rateSearchV3').oninput=filter;$('#ratePlanV3').onchange=filter;
    $('#addPricingV3').onclick=()=>type==='B2C'?b2cRateEditorV3():b2bRateEditorV3();
    $('#importPricingV3').onclick=()=>importModalV2(`${type} pricing`);
    $('#exportPricingV3').onclick=()=>download(`${type.toLowerCase()}-pricing.csv`,type==='B2C'?[['Courier','Provider','Plan','Mode','Slabs','Other charge'],...rows.map(r=>[r.courier,r.provider,r.plan,r.mode,r.slabs.map(s=>`${s.from}-${s.to}`).join('|'),r.other])]:[['Courier','Plan','Origin','Destination','Rate/kg','RTO rate/kg','Volumetric divisor'],...rows.map(r=>Object.values(r))]);
  }

  function b2bRateEditorV3(value,index){
    const zones=adminData.b2bZones;
    modalFormV2(value?'Edit B2B zone rate':'Add B2B zone rate',[['Courier','courier','select',adminData.couriers.map(c=>c.name+' B2B LTL')],['Plan','plan','select',planNames()],['Origin zone','origin','select',zones.map(z=>z.code)],['Destination zone','destination','select',zones.map(z=>z.code)],['Rate/kg (₹)','rate','number'],['RTO rate/kg (₹)','rto','number'],['Volumetric divisor','divisor','number']],d=>{const r={...d,rate:+d.rate,rto:+d.rto,divisor:+d.divisor};if(index===undefined)adminData.b2bRates.push(r);else adminData.b2bRates[index]=r;persist('b2bRates');auditV2(index===undefined?'Added B2B rate':'Updated B2B rate','B2B Pricing',`${r.origin} → ${r.destination}`);pricingManagementV3('B2B','Rate Matrix')},value||{plan:'Basic',origin:'N',destination:'N',rate:40,rto:32,divisor:5000});
  }
  function b2cRateEditorV3(value,index){
    const v=value||{courier:'Delhivery B2C Surface',provider:'Delhivery',plan:'Basic',mode:'Surface',other:0,slabs:[{from:0,to:500},{from:500,to:1000},{from:1000,to:2000},{from:2000,to:5000},{from:5000,to:'∞'}],base:35};
    const zones=adminData.b2cZones;
    modal(`<div class="matrix-modal"><small class="live-pill">B2C PRICING</small><h2 class="modal-title">${value?'Edit':'Add'} courier rate card</h2><p class="modal-copy">Configure courier, plan, weight slabs and zone-wise FWD / RTO / COD rates.</p><form id="b2cRateForm"><div class="matrix-top"><label>Courier<input name="courier" value="${esc(v.courier)}" required></label><label>Service provider<input name="provider" value="${esc(v.provider)}" required></label><label>Plan<select name="plan">${planNames().map(p=>`<option ${p===v.plan?'selected':''}>${esc(p)}</option>`).join('')}</select></label><label>Mode<select name="mode">${['Surface','Express','Air'].map(p=>`<option ${p===v.mode?'selected':''}>${p}</option>`).join('')}</select></label><label>Other charge<input name="other" type="number" value="${v.other}"></label></div><section class="slab-editor"><div class="pricing-title compact"><div><h3>Weight Slabs</h3><p>Define ranges in grams. Last slab can remain open-ended.</p></div><button type="button" class="small-action primary" id="addSlabV3">+ Add slab</button></div><div id="slabRowsV3">${v.slabs.map((s,i)=>slabRow(s,i)).join('')}</div></section><section><div class="pricing-title compact"><div><h3>Zone Rates by Plan</h3><p>Each slab has forward, RTO, COD ₹ and COD % controls.</p></div></div><div class="matrix-scroll"><table class="matrix-table"><thead><tr><th>ZONE</th>${v.slabs.map((s,i)=>`<th>SLAB ${i+1}<small>${s.from}–${s.to} g</small></th>`).join('')}</tr></thead><tbody>${zones.map((z,zi)=>`<tr><td><b>${z.code}</b> ${esc(z.name)}</td>${v.slabs.map((s,si)=>{const f=Math.round(v.base*(zi+1)*(si+1)),cell=(v.matrix||{})[`${zi}-${si}`]||{fwd:f,rto:Math.round(f*.8),cod:40,codPct:2};return `<td><div class="matrix-inputs" data-matrix-cell="${zi}-${si}"><label>FWD<input name="fwd" type="number" value="${cell.fwd}"></label><label>RTO<input name="rto" type="number" value="${cell.rto}"></label><label>COD ₹<input name="cod" type="number" value="${cell.cod}"></label><label>COD %<input name="codPct" type="number" value="${cell.codPct}"></label></div></td>`}).join('')}</tr>`).join('')}</tbody></table></div></section><div class="admin-actions"><button type="button" class="button ghost" data-close-matrix>Cancel</button><button class="button" type="submit">Save changes</button></div></form></div>`);
    const form=$('#b2cRateForm');
    $('[data-close-matrix]').onclick=closeModal;
    $('#addSlabV3').onclick=()=>{const host=$('#slabRowsV3'),i=host.children.length;host.insertAdjacentHTML('beforeend',slabRow({from:i?500*i:0,to:(i+1)*500},i));bindSlabRemove()};
    function bindSlabRemove(){$$('[data-remove-slab]').forEach(b=>b.onclick=()=>b.closest('.slab-row').remove())}bindSlabRemove();
    form.onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(form)),slabs=$$('.slab-row',form).map(row=>({from:+row.querySelector('[name="slabFrom"]').value,to:row.querySelector('[name="slabTo"]').value||'∞'})),matrix={};$$('[data-matrix-cell]',form).forEach(cell=>matrix[cell.dataset.matrixCell]={fwd:+cell.querySelector('[name="fwd"]').value,rto:+cell.querySelector('[name="rto"]').value,cod:+cell.querySelector('[name="cod"]').value,codPct:+cell.querySelector('[name="codPct"]').value});const rec={courier:d.courier,provider:d.provider,plan:d.plan,mode:d.mode,other:+d.other,slabs,base:v.base,matrix};if(index===undefined)adminData.b2cRates.push(rec);else adminData.b2cRates[index]=rec;persist('b2cRates');auditV2(index===undefined?'Added B2C rate card':'Updated B2C rate card','B2C Pricing',rec.courier);closeModal();pricingManagementV3('B2C','Pricing')};
  }
  function slabRow(s,i){return `<div class="slab-row"><b>S${i+1}</b><label>From <input name="slabFrom" type="number" value="${s.from}"></label><span>–</span><label>To <input name="slabTo" value="${s.to==='∞'?'':s.to}" placeholder="Open ended"></label><button type="button" data-remove-slab="${i}">×</button></div>`}

  function renderSlabOverviewV3(pane){const slabs=adminData.b2cRates.flatMap(r=>r.slabs).reduce((a,s)=>{const k=s.from+'-'+s.to;if(!a.some(x=>x.from+'-'+x.to===k))a.push(s);return a},[]);pane.innerHTML=`<div class="pricing-title"><div><small>WEIGHT CONFIGURATION</small><h2>Weight Slab Library</h2><p>Reusable slabs currently available across B2C rate cards.</p></div><button class="button" id="manageSlabs">Edit in rate card</button></div><div class="slab-library">${slabs.map((s,i)=>`<div><span>S${i+1}</span><b>${s.from} g – ${s.to} g</b><small>${adminData.b2cRates.filter(r=>r.slabs.some(x=>x.from===s.from&&x.to===s.to)).length} rate cards</small></div>`).join('')}</div>`;$('#manageSlabs').onclick=()=>pricingManagementV3('B2C','Pricing')}
  function renderPincodesV3(pane){const rows=adminData.pincodes;pane.innerHTML=`<div class="pricing-title"><div><small>B2B SERVICEABILITY</small><h2>Pincode Mapping</h2><p>Map pincodes to B2B zones and ODA rules.</p></div><div class="admin-filters"><button class="button ghost" id="importPins">Import CSV</button><button class="button" id="addPin">+ Add pincode</button></div></div>${simpleTable(['PINCODE','CITY','STATE','ZONE','ODA','STATUS'],rows.map(r=>[r.pincode,r.city,r.state,r.zone,r.oda,r.status]))}`;$('#importPins').onclick=()=>importModalV2('B2B pincode mapping');$('#addPin').onclick=()=>modalFormV2('Add pincode',[['Pincode','pincode'],['City','city'],['State','state'],['Zone','zone','select',adminData.b2bZones.map(z=>z.code)],['ODA','oda','select',['No','Yes']],['Status','status','select',['Active','Inactive']]],d=>{rows.push(d);persist('pincodes');pricingManagementV3('B2B','Pincodes')},{oda:'No',status:'Active'})}
  function renderChargesInlineV3(type,pane){pane.innerHTML=`<div class="pricing-title"><div><small>${type} SURCHARGES</small><h2>Additional Charges</h2><p>Fuel, COD, ODA, RTO and handling calculations applied after freight.</p></div><button class="button" id="openCharges">Manage all charges</button></div>${simpleTable(['CODE','CHARGE','APPLIES TO','METHOD','VALUE','MINIMUM','STATUS'],adminData.charges.map(c=>[c.code,c.name,c.applies,c.method,c.value,money(c.min),c.status]))}`;$('#openCharges').onclick=()=>adminNavigate('Additional Charges')}
  function renderQuoteV3(type,pane){pane.innerHTML=`<div class="pricing-title"><div><small>RATE PREVIEW</small><h2>${type} Quote Calculator</h2><p>Test configured plans, zones and surcharges before assigning them to sellers.</p></div></div><form class="quote-grid" id="quoteFormV3"><label>Plan<select name="plan">${planNames().map(x=>`<option>${x}</option>`).join('')}</select></label><label>Origin pincode<input name="origin" maxlength="6" required></label><label>Destination pincode<input name="destination" maxlength="6" required></label><label>Chargeable weight (kg)<input name="weight" type="number" step=".1" required></label><label>Payment<select name="payment"><option>Prepaid</option><option>COD</option></select></label><label>Invoice value<input name="value" type="number" value="1000"></label><button class="button">Calculate quote</button></form><div id="quoteResultV3"></div>`;$('#quoteFormV3').onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget)),base=type==='B2C'?75:Math.max(120,+d.weight*48);$('#quoteResultV3').innerHTML=`<div class="quote-result"><div><small>FREIGHT</small><b>${money(base)}</b></div><div><small>FUEL</small><b>${money(base*.18)}</b></div><div><small>${d.payment==='COD'?'COD':'HANDLING'}</small><b>${money(d.payment==='COD'?40:10)}</b></div><div class="total"><small>ESTIMATED TOTAL</small><b>${money(base*1.18+(d.payment==='COD'?40:10))}</b></div></div>`}}

  const previousNavigate=adminNavigate;
  adminNavigate=function(page,keep=false){
    if(page==='Plan Management'||page==='B2C Pricing'||page==='B2B Pricing'){
      $('#pageCrumb').textContent=page;$$('[data-v2-page]').forEach(b=>b.classList.toggle('active',b.dataset.v2Page===page));$('#sidebar').classList.remove('open');
      if(page==='Plan Management')planManagementV3();else pricingManagementV3(page.startsWith('B2C')?'B2C':'B2B');
      if(!keep)history.replaceState(null,'',`#${encodeURIComponent(page)}`);scrollTo(0,0);return;
    }
    previousNavigate(page,keep);
  };
  renderV2Nav();
  const current=decodeURIComponent(location.hash.slice(1)||'Dashboard');
  if(['Plan Management','B2C Pricing','B2B Pricing'].includes(current))adminNavigate(current,true);
})();
