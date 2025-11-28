const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = { username: fd.get('username'), password: fd.get('password') };
  const res = await fetch('/api/auth/register-admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  const j = await res.json();
  if (!res.ok) { msg.innerText = j.message || 'Error'; return; }
  msg.innerText = j.message || 'Admin created';
  form.reset();
});
