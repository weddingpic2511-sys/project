async function loadStudents(){
  const res = await fetch('/api/students');
  if (!res.ok){ if (res.status === 401) return window.location = '/'; }
  const arr = await res.json();
  const tbody = document.querySelector('#studentsTable tbody');
  tbody.innerHTML = '';
  arr.forEach(s => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${s.name}</td><td>${s.roll}</td><td>${s.class||''}</td><td>${s.email||''}</td>`;
    tbody.appendChild(tr);
  });
}

document.getElementById('createForm').addEventListener('submit', async (e)=>{
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());
  const res = await fetch('/api/students', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(data) });
  const j = await res.json();
  if (!res.ok) return alert(j.message||'Error');
  e.target.reset();
  loadStudents();
});

document.getElementById('logout').addEventListener('click', async ()=>{
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location = '/';
});

loadStudents();