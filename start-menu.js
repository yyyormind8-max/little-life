// Экран при входе: продолжить сохранённую игру или начать новую.
// Игра сохраняется сама (каждые несколько секунд и при закрытии страницы) в localStorage 'little-life-v1'.
(function(){
  var KEY='little-life-v1',BACKUP='little-life-v1-prev',raw=null,data=null;
  try{raw=localStorage.getItem(KEY);data=raw&&JSON.parse(raw)}catch(e){data=null}
  try{if(sessionStorage.getItem('ll-skip-menu')){sessionStorage.removeItem('ll-skip-menu');return}}catch(e){}
  var hasBackup=false;try{hasBackup=!!localStorage.getItem(BACKUP)}catch(e){}
  if(!data||!data.profile)return;
  var name=(data.profile.first||'Житель'),day=Math.floor((data.time||0)/1440)+1,money=Math.round(data.money||0).toLocaleString('ru-RU'),people=(data.residents&&data.residents.length)||1;
  var css='#startMenu{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;background:rgba(40,52,38,.55);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);padding:16px;font-family:inherit}'+
  '#startMenu .card{background:#fbf8ef;border-radius:24px;max-width:380px;width:100%;padding:26px 22px 20px;box-shadow:0 18px 50px rgba(0,0,0,.25);text-align:center;color:#33402f}'+
  '#startMenu h1{margin:4px 0 2px;font-size:24px}#startMenu small{color:#7c8775;letter-spacing:.08em}'+
  '#startMenu .save{margin:16px 0;padding:12px;border-radius:16px;background:#eef1e3;text-align:left;font-size:14px;line-height:1.5}'+
  '#startMenu button{display:block;width:100%;min-height:50px;margin:8px 0;border:0;border-radius:16px;font-size:17px;font-weight:700;cursor:pointer}'+
  '#startMenu .go{background:#6f9468;color:#fff}#startMenu .new{background:#e9e2d2;color:#5a4a36}#startMenu .back{background:transparent;color:#7c8775;font-size:14px;min-height:40px;font-weight:500}'+
  '#startMenu .warn{display:none;font-size:14px;color:#8b5a3c;margin:6px 0}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  var m=document.createElement('div');m.id='startMenu';
  m.innerHTML='<div class="card"><small>LITTLE LIFE</small><h1>С возвращением!</h1>'+
    '<div class="save">💾 Сохранённая игра<br><b></b><br><span></span></div>'+
    '<button class="go">▶ Продолжить</button>'+
    '<button class="new">✦ Новая игра</button>'+
    '<p class="warn">Начать заново? Текущая игра будет отложена: её можно вернуть один раз кнопкой ниже на этом экране.</p>'+
    (hasBackup?'<button class="back restore">↺ Вернуть прошлую игру</button>':'')+
    '</div>';
  m.querySelector('.save b').textContent=name+(people>1?' и ещё '+(people-1):'');
  m.querySelector('.save span').textContent='День '+day+' · '+money+' монет';
  function close(){m.remove()}
  var confirmNew=false;
  m.querySelector('.go').onclick=close;
  m.querySelector('.new').onclick=function(){var w=m.querySelector('.warn');if(!confirmNew){confirmNew=true;w.style.display='block';this.textContent='✦ Да, начать новую игру';return}
    try{localStorage.setItem(BACKUP,raw);var orig=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(k===KEY)return;return orig.call(this,k,v)};localStorage.removeItem(KEY);sessionStorage.setItem('ll-skip-menu','1')}catch(e){}
    location.reload()};
  var r=m.querySelector('.restore');if(r)r.onclick=function(){try{var prev=localStorage.getItem(BACKUP);if(!prev)return;localStorage.setItem(BACKUP,raw);var orig=Storage.prototype.setItem;orig.call(localStorage,KEY,prev);Storage.prototype.setItem=function(k,v){if(k===KEY)return;return orig.call(this,k,v)};sessionStorage.setItem('ll-skip-menu','1')}catch(e){}location.reload()};
  function add(){document.body.appendChild(m)}
  if(document.body)add();else document.addEventListener('DOMContentLoaded',add);
})();
