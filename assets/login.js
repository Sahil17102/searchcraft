const loginForm=document.querySelector('#loginForm');
const message=document.querySelector('#loginMessage');
const loginParams=new URLSearchParams(location.search);
const superAdmin={accountNo:'SC00000001',email:'admin@searchcraftdigital.com',userCode:'0001',password:'SearchCraft@2026'};
document.querySelector('#accountNo').value=loginParams.get('account')||'';
document.querySelector('#identity').value=loginParams.get('email')||'';
document.querySelector('#userCode').value=loginParams.get('user')||'';

document.querySelector('#showPassword').addEventListener('click',event=>{
  const input=document.querySelector('#password');
  input.type=input.type==='password'?'text':'password';
  event.currentTarget.textContent=input.type==='password'?'Show':'Hide';
});

loginForm.addEventListener('submit',event=>{
  event.preventDefault();
  const accountNo=document.querySelector('#accountNo').value.trim().toUpperCase();
  const identity=document.querySelector('#identity').value.trim().toLowerCase();
  const userCode=document.querySelector('#userCode').value.trim();
  const password=document.querySelector('#password').value;
  if(!/^SC\d{8}$/.test(accountNo)){message.textContent='Enter the Account Number shown after sign up.';return}
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identity)){message.textContent='Enter your registered Login Email.';return}
  if(!/^\d{4}$/.test(userCode)){message.textContent='Enter your 4-digit User Code.';return}
  let registered=null;
  try{registered=JSON.parse(localStorage.getItem(`sc_signup:${identity}`)||'null')}catch{registered=null}
  let workspaceUsers=[];
  try{workspaceUsers=JSON.parse(localStorage.getItem(`sc_workspace_users:${accountNo}`)||'[]')||[]}catch{workspaceUsers=[]}
  const workspaceUser=workspaceUsers.find(user=>user.email===identity&&user.ref===userCode&&user.password===password&&user.active!==false);
  const primaryMatch=registered&&registered.accountNo===accountNo&&registered.userCode===userCode&&registered.password===password;
  const superAdminMatch=accountNo===superAdmin.accountNo&&identity===superAdmin.email&&userCode===superAdmin.userCode&&password===superAdmin.password;
  if(!primaryMatch&&!workspaceUser&&!superAdminMatch){message.textContent=registered||workspaceUsers.length?'Account Number, User Code or Temporary Password is incorrect.':'No account found. Please complete Free Sign Up first.';return}
  sessionStorage.setItem('sc_auth','1');
  sessionStorage.setItem('sc_user',identity);
  sessionStorage.setItem('sc_role',superAdminMatch?'ADMIN':(workspaceUser?.group||'ADMIN'));
  sessionStorage.setItem('sc_display_name',superAdminMatch?'Super Admin':(workspaceUser?.userName||registered.fullName||'Workspace User'));
  sessionStorage.setItem('sc_first_login',superAdminMatch||workspaceUser?'0':(localStorage.getItem(`sc_profile:${identity}`)?'0':'1'));
  if(workspaceUser&&!localStorage.getItem(`sc_profile:${identity}`))localStorage.setItem(`sc_profile:${identity}`,JSON.stringify({fullName:workspaceUser.userName,email:workspaceUser.email,mobile:workspaceUser.mobile,designation:workspaceUser.group,company:workspaceUser.company||'SearchCraft Workspace'}));
  localStorage.setItem('sc_last_user',identity);
  localStorage.setItem(`sc_login_seen:${identity}`,'1');
  message.textContent='Login verified. Opening your workspace…';
  loginForm.querySelector('.primary-btn').classList.add('loading');
  setTimeout(()=>location.href=superAdminMatch?'../admin/':'../panel/',500);
});
