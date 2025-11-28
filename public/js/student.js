async function loadProfile(){
  const res = await fetch('/api/students');
  if (!res.ok){ window.location = '/'; return; }
  const arr = await res.json();
  const p = document.getElementById('profile');
  if (!arr.length) p.innerText = 'No profile found.';
  else {
    const s = arr[0];
    p.innerHTML = `<p><strong>Name:</strong> ${s.name}</p><p><strong>Roll:</strong> ${s.roll}</p><p><strong>Class:</strong> ${s.class||''}</p><p><strong>Email:</strong> ${s.email||''}</p><p>${s.notes||''}</p>`;
  }
}

document.getElementById('logout').addEventListener('click', async ()=>{
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location = '/';
});

loadProfile();