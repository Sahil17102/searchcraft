const signupForm=document.querySelector('#signupForm');
const captchaCode=document.querySelector('#captchaCode');
const signupMessage=document.querySelector('#signupMessage');
let activeCaptcha='';
function newCaptcha(){activeCaptcha=Math.random().toString(36).slice(2,7).toUpperCase();captchaCode.textContent=activeCaptcha}
newCaptcha();
document.querySelector('#refreshCaptcha').addEventListener('click',newCaptcha);
signupForm.addEventListener('submit',event=>{
  event.preventDefault();
  const data=Object.fromEntries(new FormData(signupForm));
  if(String(data.captcha||'').trim().toUpperCase()!==activeCaptcha){signupMessage.textContent='Captcha code does not match. Please try again.';newCaptcha();return}
  const email=data.email.trim().toLowerCase();
  const accountNo=`SC${String(Date.now()).slice(-8)}`;
  const userCode=String(Math.floor(1000+Math.random()*9000));
  const password=`Sc@${Math.random().toString(36).slice(2,8).toUpperCase()}`;
  const registration={plan:data.plan,fullName:data.fullName.trim(),email,mobile:data.mobile.trim(),company:data.company.trim(),city:data.city.trim(),accountNo,userCode,password,createdAt:new Date().toISOString()};
  localStorage.setItem(`sc_signup:${email}`,JSON.stringify(registration));
  localStorage.setItem('sc_last_user',email);
  document.querySelector('#resultAccount').textContent=accountNo;
  document.querySelector('#resultEmail').textContent=email;
  document.querySelector('#resultUser').textContent=userCode;
  document.querySelector('#resultPassword').textContent=password;
  document.querySelector('#continueLogin').href=`../login/?account=${encodeURIComponent(accountNo)}&email=${encodeURIComponent(email)}&user=${encodeURIComponent(userCode)}`;
  document.querySelector('#signupCard').hidden=true;
  document.querySelector('#credentialsCard').hidden=false;
  scrollTo({top:0,behavior:'smooth'});
});
document.querySelector('#copyCredentials').addEventListener('click',async event=>{
  const text=`SearchCraft Digital login details\nAccount: ${document.querySelector('#resultAccount').textContent}\nEmail: ${document.querySelector('#resultEmail').textContent}\nUser code: ${document.querySelector('#resultUser').textContent}\nTemporary password: ${document.querySelector('#resultPassword').textContent}`;
  try{await navigator.clipboard.writeText(text);event.currentTarget.textContent='Copied successfully ✓'}catch{event.currentTarget.textContent='Copy unavailable — save details manually'}
});
