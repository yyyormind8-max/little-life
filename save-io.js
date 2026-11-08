// Перенос сохранения: скачать в файл, загрузить из файла или вставить текст.
// Работает с тем же ключом localStorage, что и игра (little-life-v1).
(function(){
  const KEY='little-life-v1';
  const read=()=>{try{return localStorage.getItem(KEY)}catch{return null}};
  function looksValid(text){try{const d=JSON.parse(text);return d&&typeof d==='object'&&!Array.isArray(d)}catch{return false}}
  function applyImport(text){
    text=String(text||'').trim();
    if(!looksValid(text)){alert('Это не похоже на сохранение «Маленькой жизни». Проверьте, что скопирован весь текст.');return}
    if(!confirm('Заменить текущий дом и персонажей загруженным сохранением?'))return;
    try{localStorage.setItem(KEY,text)}catch{alert('Браузер не дал записать сохранение.');return}
    // Не даём игре перезаписать импорт при перезагрузке страницы.
    const orig=Storage.prototype.setItem;
    Storage.prototype.setItem=function(k,v){if(k===KEY)return;return orig.call(this,k,v)};
    location.reload();
  }
  function build(){
    const dlg=document.createElement('dialog');dlg.id='saveDialog';
    dlg.innerHTML='<div class="shophead"><div><small>ПЕРЕНОС ИГРЫ</small><h2>Сохранение</h2></div><button type="button" data-close>✕</button></div>'+
      '<p>Сохраните дом и персонажей в файл или перенесите их с другого устройства и адреса игры.</p>'+
      '<div class="saveio-row"><button type="button" data-export>⬇ Скачать файл</button><button type="button" data-pick>⬆ Загрузить файл</button></div>'+
      '<input type="file" accept=".json,application/json,text/plain" hidden data-file>'+
      '<p style="margin-bottom:6px">Или вставьте текст сохранения:</p>'+
      '<textarea data-text rows="4" placeholder="{&quot;money&quot;: ...}"></textarea>'+
      '<div class="saveio-row"><button type="button" data-copy>Скопировать текущее</button><button type="button" data-paste class="primary">Загрузить текст</button></div>';
    document.body.appendChild(dlg);
    const q=s=>dlg.querySelector(s);
    q('[data-close]').onclick=()=>dlg.close();
    q('[data-export]').onclick=()=>{
      const data=read();if(!data){alert('Сохранения пока нет.');return}
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([data],{type:'application/json'}));
      a.download='malenkaya-zhizn-save-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();
      setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1000);
    };
    q('[data-pick]').onclick=()=>q('[data-file]').click();
    q('[data-file]').onchange=e=>{const f=e.target.files[0];if(!f)return;f.text().then(applyImport);e.target.value=''};
    q('[data-paste]').onclick=()=>applyImport(q('[data-text]').value);
    q('[data-copy]').onclick=async()=>{const data=read()||'';try{await navigator.clipboard.writeText(data);q('[data-copy]').textContent='Скопировано ✓'}catch{q('[data-text]').value=data;q('[data-text]').select()}};
    const btn=document.createElement('button');btn.id='saveIO';btn.title='Сохранение и перенос';btn.textContent='💾';
    btn.onclick=()=>dlg.showModal();
    (document.querySelector('.camera')||document.body).appendChild(btn);
    const st=document.createElement('style');
    st.textContent='.saveio-row{display:flex;gap:8px;margin:10px 0}.saveio-row button{flex:1;padding:11px 8px;border-radius:14px;background:#eeeee3;border:0;font:inherit;font-weight:700;color:#35473b;cursor:pointer}.saveio-row .primary{background:#5f8f7e;color:#fff}#saveDialog textarea{width:100%;box-sizing:border-box;border-radius:12px;border:1px solid #dfe0d2;padding:9px;font:12px monospace;background:#fff;color:#35473b;resize:vertical}';
    document.head.appendChild(st);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build);else build();
})();
