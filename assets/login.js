const loginForm=document.querySelector('#loginForm');
const tabs=[...document.querySelectorAll('.auth-tabs button')];
const passwordFields=document.querySelector('#passwordFields');
const otpFields=document.querySelector('#otpFields');
const message=document.querySelector('#loginMessage');
let mode='otp',demoOtp='',timer;
tabs.forEach(tab=>tab.addEventListener('click',()=>{mode=tab.dataset.mode;tabs.forEach(x=>x.classList.toggle('active',x===tab));passwordFields.hidden=mode!=='password';otpFields.hidden=mode!=='otp';message.textContent='';loginForm.querySelector('.primary-btn span').textContent=mode==='otp'?'Verify code & sign in':'Sign in securely';}));
document.querySelector('#showPassword').addEventListener('click',e=>{const input=document.querySelector('#password');input.type=input.type==='password'?'text':'password';e.currentTarget.textContent=input.type==='password'?'Show':'Hide'});
document.querySelector('#forgotBtn').addEventListener('click',()=>{mode='otp';tabs[0].click();message.textContent='Use OTP to recover access securely.'});
const loginParams=new URLSearchParams(location.search),prefillEmail=loginParams.get('email');
if(prefillEmail)document.querySelector('#identity').value=prefillEmail;
if(loginParams.get('mode')==='password')tabs[1].click();
document.querySelector('#sendOtp').addEventListener('click',()=>{
  const identity=document.querySelector('#identity').value.trim();
  if(!validEmail(identity)){message.textContent='Enter a valid registered email address first.';return}
  demoOtp=String(Math.floor(100000+Math.random()*900000));document.querySelector('#otpLabel').hidden=false;const preview=document.querySelector('#codePreview');preview.hidden=false;preview.querySelector('strong').textContent=demoOtp;document.querySelector('#otp').value='';document.querySelector('#otp').focus();
  message.textContent='Code generated successfully.';let left=60;clearInterval(timer);const out=document.querySelector('#otpTimer');out.textContent='01:00';timer=setInterval(()=>{left--;out.textContent=`00:${String(left).padStart(2,'0')}`;if(left<=0){clearInterval(timer);out.textContent='Expired'}},1000);
});
loginForm.addEventListener('submit',e=>{
  e.preventDefault();const identity=document.querySelector('#identity').value.trim();
  if(!validEmail(identity)){message.textContent='Please enter a valid email address.';return}
  const enteredPassword=document.querySelector('#password').value;
  if(mode==='password'&&enteredPassword.length<4){message.textContent='Enter a valid password (minimum 4 characters).';return}
  if(mode==='password'){
    let registered=null;try{registered=JSON.parse(localStorage.getItem(`sc_signup:${identity.toLowerCase()}`)||'null')}catch{registered=null}
    if(registered&&registered.password!==enteredPassword){message.textContent='The temporary password is incorrect.';return}
  }
  if(mode==='otp'&&(!demoOtp||document.querySelector('#otp').value!==demoOtp)){message.textContent='Enter the valid 6-digit OTP shown above.';return}
  const userId=identity.toLowerCase();
  const seenKey=`sc_login_seen:${userId}`;
  sessionStorage.setItem('sc_auth','1');sessionStorage.setItem('sc_user',userId);sessionStorage.setItem('sc_first_login',localStorage.getItem(`sc_profile:${userId}`)?'0':'1');localStorage.setItem('sc_last_user',userId);localStorage.setItem(seenKey,'1');message.textContent='Signed in. Opening your workspace…';loginForm.querySelector('.primary-btn').classList.add('loading');setTimeout(()=>location.href='../panel/',550);
});
function validEmail(value){return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)}
