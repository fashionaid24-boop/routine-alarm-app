const STORAGE_KEY = 'daily-routine-items';
const defaultRoutines = [
  { id: 1, name: '물 2잔 마시기', time: '08:00', note: '잠에서 깬 뒤 물 한 잔으로 하루를 시작해요.', color: 'mint', done: false },
  { id: 2, name: '스트레칭 10분', time: '09:30', note: '가볍게 몸을 풀고 집중력을 높여보세요.', color: 'lavender', done: false },
  { id: 3, name: '점심 산책하기', time: '12:30', note: '', color: 'peach', done: false },
  { id: 4, name: '독서 20분', time: '21:00', note: '', color: 'blue', done: false }
];
let routines = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultRoutines;
let activeFilter = 'all';
const $ = (selector) => document.querySelector(selector);

function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(routines)); }
function formatTime(time) { return new Date(`2000-01-01T${time}`).toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true }); }
function render() {
  const list = $('#routineList');
  const visible = routines.filter(item => activeFilter === 'all' || (activeFilter === 'done' ? item.done : !item.done)).sort((a,b) => a.time.localeCompare(b.time));
  list.innerHTML = visible.map(item => `<article class="routine-item ${item.done ? 'done' : ''}">
    <button class="check" data-action="toggle" data-id="${item.id}" aria-label="${item.done ? '완료 취소' : '완료 처리'}">${item.done ? '✓' : ''}</button>
    <span class="routine-dot ${item.color}"></span><div class="routine-main"><div class="routine-name">${escapeHtml(item.name)}</div>${item.note ? `<small class="routine-note">${escapeHtml(item.note)}</small>` : ''}</div>
    <time class="routine-time">${formatTime(item.time)}</time><button class="delete-button" data-action="delete" data-id="${item.id}" aria-label="루틴 삭제">×</button></article>`).join('');
  $('#emptyState').classList.toggle('hidden', visible.length !== 0);
  const done = routines.filter(item => item.done).length, total = routines.length, percent = total ? Math.round(done / total * 100) : 0;
  $('#completedCount').textContent = `${done} / ${total}`; $('#completionRate').textContent = `${percent}%`; $('#progressText').textContent = `${percent}%`; $('#progressBar').style.width = `${percent}%`;
  $('#encouragement').textContent = !total ? '루틴을 추가하고 오늘을 시작해보세요.' : percent === 100 ? '오늘의 루틴을 모두 해냈어요. 정말 멋져요!' : `${total - done}개의 루틴이 남아있어요. 천천히 해내봐요.`;
  $('#streakValue').textContent = `${percent === 100 ? 1 : 0}일`;
}
function escapeHtml(text) { return text.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function showToast(message) { const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); setTimeout(() => toast.classList.remove('show'), 2200); }
function renderCalendar() {
  const now = new Date(), start = new Date(now); start.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  const labels = ['월','화','수','목','금','토','일'];
  $('#weekCalendar').innerHTML = labels.map((label, i) => { const d = new Date(start); d.setDate(start.getDate() + i); const isToday = d.toDateString() === now.toDateString(); return `<div class="day ${isToday ? 'today' : ''}"><span>${label}</span><span class="day-number">${d.getDate()}</span></div>`; }).join('');
  $('#dateLabel').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
}
function openDialog() { $('#routineDialog').showModal(); $('#routineName').focus(); }
$('#addButton').addEventListener('click', openDialog); $('#emptyAddButton').addEventListener('click', openDialog);
$('#closeDialog').addEventListener('click', () => $('#routineDialog').close()); $('#cancelButton').addEventListener('click', () => $('#routineDialog').close());
$('#routineForm').addEventListener('submit', (event) => { event.preventDefault(); routines.push({ id: Date.now(), name: $('#routineName').value.trim(), time: $('#routineTime').value, note: $('#routineNote').value.trim(), color: $('#routineColor').value, done: false }); save(); render(); $('#routineForm').reset(); $('#routineDialog').close(); showToast('새 루틴을 추가했어요.'); });
$('#routineList').addEventListener('click', (event) => { const button = event.target.closest('[data-action]'); if (!button) return; const id = Number(button.dataset.id); if (button.dataset.action === 'toggle') { const item = routines.find(r => r.id === id); item.done = !item.done; save(); render(); showToast(item.done ? '루틴을 완료했어요! ✨' : '완료를 취소했어요.'); } else { routines = routines.filter(r => r.id !== id); save(); render(); showToast('루틴을 삭제했어요.'); } });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { document.querySelector('.filter.active').classList.remove('active'); button.classList.add('active'); activeFilter = button.dataset.filter; render(); }));
$('#notificationButton').addEventListener('click', async () => { if (!('Notification' in window)) return showToast('이 브라우저는 알림을 지원하지 않아요.'); const permission = await Notification.requestPermission(); showToast(permission === 'granted' ? '알림이 켜졌어요. 시간에 맞춰 알려드릴게요.' : '알림 권한이 필요해요.'); });
$('#todayButton').addEventListener('click', () => { renderCalendar(); showToast('오늘 날짜를 확인했어요.'); });
renderCalendar(); render();
