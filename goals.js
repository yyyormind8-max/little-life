// Задания дня и достижения. Прогресс хранится в state.goals (сохранение little-life-v1).
const DAILY=[
  {id:'eat2',icon:'🥗',text:'Поесть 2 раза',ev:'eat',n:2,reward:200},
  {id:'cook1',icon:'🍳',text:'Приготовить блюдо на плите',ev:'cook',n:1,reward:300},
  {id:'work2',icon:'💻',text:'Поработать 2 раза',ev:'work',n:2,reward:350},
  {id:'sleep1',icon:'🌙',text:'Хорошо выспаться',ev:'sleep',n:1,reward:200},
  {id:'social3',icon:'💬',text:'Пообщаться с жителем 3 раза',ev:'social',n:3,reward:300},
  {id:'pet3',icon:'🐾',text:'Позаботиться о питомце 3 раза',ev:'pet',n:3,reward:350},
  {id:'train1',icon:'🎓',text:'Позаниматься с питомцем трюками',ev:'pettrain',n:1,reward:300},
  {id:'fun2',icon:'🎮',text:'Отдохнуть 2 раза',ev:'fun',n:2,reward:250},
  {id:'garden1',icon:'🌳',text:'Посадить дерево, куст или цветы',ev:'garden',n:1,reward:300},
  {id:'floor1',icon:'🧘',text:'Посидеть на полу или лавочке',ev:'sit',n:1,reward:200}
];
export const ACHIEVEMENTS=[
  {id:'newhome',icon:'🏡',title:'Новосёл',text:'Построить свой первый дом',reward:500},
  {id:'firstpet',icon:'🐶',title:'Первый друг',text:'Завести питомца',reward:500},
  {id:'chef',icon:'👩‍🍳',title:'Шеф-повар',text:'Приготовить 5 блюд',reward:500},
  {id:'early',icon:'🌅',title:'Ранняя пташка',text:'Проснуться до 7 утра',reward:500},
  {id:'friend3',icon:'🤝',title:'Душа компании',text:'Подружиться с тремя жителями',reward:1500},
  {id:'love',icon:'💖',title:'Любовь',text:'Начать встречаться или пожениться',reward:1500},
  {id:'gardener',icon:'🌷',title:'Садовод',text:'Посадить 10 деревьев, кустов и клумб',reward:1500,item:'gnome'},
  {id:'worker',icon:'💼',title:'Трудяга',text:'Заработать работой 10 000 монет',reward:1500},
  {id:'petfriend',icon:'🦴',title:'Лучший друг',text:'20 раз позаботиться о питомцах',reward:1500},
  {id:'tricks5',icon:'🎓',title:'Умный питомец',text:'Научить питомцев пяти трюкам',reward:1500},
  {id:'shelter',icon:'🏠',title:'Добрые руки',text:'Взять питомца из приюта',reward:1000},
  {id:'pack',icon:'🐾',title:'Целая стая',text:'Завести трёх питомцев',reward:1500},
  {id:'zoo',icon:'🦜',title:'Свой зоопарк',text:'Собака или кошка, попугай и крыса — все вместе',reward:2000},
  {id:'talker',icon:'💬',title:'Говорун',text:'Научить попугая трём словам или трюкам',reward:1500},
  {id:'roof',icon:'🏠',title:'Под крышей',text:'Накрыть дом крышей',reward:500},
  {id:'kitchen',icon:'🍽',title:'Своя кухня',text:'Поставить плиту и холодильник',reward:500},
  {id:'cozy',icon:'🛋',title:'Уютное гнёздышко',text:'Поставить в доме 15 предметов мебели',reward:1000},
  {id:'expand',icon:'🧱',title:'Расширение',text:'Дом площадью 32 клетки',reward:1000},
  {id:'designer',icon:'🎨',title:'Дизайнер',text:'Использовать 5 разных узоров пола',reward:1000},
  {id:'fenced',icon:'🚧',title:'Свой участок',text:'Поставить 10 секций забора',reward:1000},
  {id:'fountain',icon:'⛲',title:'Как в парке',text:'Поставить фонтан и лавочку во дворе',reward:1000},
  {id:'architect',icon:'📐',title:'Архитектор',text:'Дом площадью 60 клеток с крышей',reward:5000,item:'trophy'},
  {id:'mansion',icon:'🏰',title:'Особняк',text:'Дом площадью 100 клеток',reward:5000,item:'trophy_home'},
  {id:'dreamhome',icon:'✨',title:'Дом мечты',text:'Обставить дом мебелью на 25 000 монет',reward:5000},
  {id:'week',icon:'📅',title:'Неделя жизни',text:'Прожить 7 игровых дней',reward:5000,item:'trophy_pet'}
];
const ITEM_NAMES={gnome:'Садовый гном',trophy:'Золотой кубок',trophy_pet:'Кубок «Лучший питомец»',trophy_home:'Кубок «Архитектор года»'};
function seeded(day){let x=(day*2654435761)>>>0;return ()=>{x=(x*1664525+1013904223)>>>0;return x/4294967296}}

export function initGoals({state,save,toast,catalog,onReward}){
  const g=state.goals=state.goals||{};g.done=g.done||{};g.count=g.count||{};g.daily=g.daily||null;g.unlocked=g.unlocked||{};
  state.unlockedItems=state.unlockedItems||{};
  const day=()=>Math.floor((state.time||0)/1440)+1;
  function rollDaily(){const d=day();if(g.daily&&g.daily.day===d)return;const r=seeded(d),pool=[...DAILY],list=[];while(list.length<3&&pool.length)list.push(pool.splice(Math.floor(r()*pool.length),1)[0].id);g.daily={day:d,list,progress:{},claimed:{}};save()}
  function give(amount,why,item){state.money+=amount;if(item){state.unlockedItems[item]=true}toast(why+' +'+amount.toLocaleString('ru-RU')+' ✦'+(item?' · новый предмет: '+ITEM_NAMES[item]:''));onReward?.();save()}
  function event(name,amount=1){rollDaily();g.count[name]=(g.count[name]||0)+amount;
    for(const id of g.daily.list){const t=DAILY.find(x=>x.id===id);if(!t||t.ev!==name||g.daily.claimed[id])continue;g.daily.progress[id]=(g.daily.progress[id]||0)+amount;if(g.daily.progress[id]>=t.n){g.daily.claimed[id]=true;give(t.reward,'Задание выполнено: '+t.text+'.')}}
    check();updateBadge()}
  function stats(){const items=state.customHouse?.items||[],floors=items.filter(i=>catalog[i.type]?.kind==='floor').length,garden=items.filter(i=>['tree','bush','flowerbed'].includes(catalog[i.type]?.family)).length,rel=Object.entries(state.relations||{}),act=state.activeResidentId;
    const friends=new Set(rel.filter(([k,v])=>['friend','friend_f'].includes(v)).map(([k])=>k.split('|').sort().join('|'))).size,love=rel.some(([k,v])=>['sweetheart','husband','wife'].includes(v));
    const fam=f=>items.filter(i=>catalog[i.type]?.family===f).length,furn=items.filter(i=>catalog[i.type]?.kind==='furniture'&&!catalog[i.type]?.outdoor),patterns=new Set(items.filter(i=>catalog[i.type]?.kind==='floor').map(i=>(i.style?.pattern)||(i.type==='tile'?'tile':'planks'))).size,value=items.filter(i=>catalog[i.type]?.kind==='furniture').reduce((a,i)=>a+(catalog[i.type]?.price||0),0);
    return {fam,furn:furn.length,patterns,value,floors,garden,friends,love,roof:state.customHouse?.roof&&state.customHouse.roof.style!=='none',pets:(state.pets||[]).length}}
  function check(){const s=stats(),c=g.count,test={newhome:s.floors>0&&state.homeConfigured,firstpet:s.pets>=1,chef:(c.cook||0)>=5,early:(c.early||0)>=1,friend3:s.friends>=3,love:s.love,gardener:s.garden>=10,worker:(c.earned||0)>=10000,petfriend:(c.pet||0)>=20,pack:s.pets>=3,tricks5:(c.trick||0)>=5,shelter:(c.adopt||0)>=1,architect:s.floors>=60&&s.roof,week:day()>=8,roof:s.floors>0&&s.roof,kitchen:(s.fam('stove')>0||s.fam('kitchen')>0)&&s.fam('fridge')>0,cozy:s.furn>=15,expand:s.floors>=32,designer:s.patterns>=5,fenced:s.fam('fence')>=10,fountain:s.fam('fountain')>0&&s.fam('bench')>0,mansion:s.floors>=100,zoo:(state.pets||[]).some(p=>p.type==='dog'||p.type==='cat')&&(state.pets||[]).some(p=>p.type==='parrot')&&(state.pets||[]).some(p=>p.type==='rat'),talker:(state.pets||[]).some(p=>p.type==='parrot'&&Object.values(p.tricks||{}).filter(v=>v>=100).length>=3),dreamhome:s.value>=25000};
    for(const a of ACHIEVEMENTS)if(!g.unlocked[a.id]&&test[a.id]){g.unlocked[a.id]=day();give(a.reward,'🏆 Достижение «'+a.title+'»!',a.item)}}
  // Окно «Задания и достижения».
  const dlg=document.createElement('dialog');dlg.id='goalsDialog';document.body.append(dlg);
  const btn=document.createElement('button');btn.id='goalsButton';btn.title='Задания и достижения';btn.textContent='🏆';document.querySelector('.camera')?.prepend(btn);
  const badge=document.createElement('i');badge.className='goal-badge';btn.append(badge);
  function updateBadge(){rollDaily();const left=g.daily.list.filter(id=>!g.daily.claimed[id]).length;badge.textContent=left||'';badge.hidden=!left}
  function render(){rollDaily();const d=g.daily;let html='<div class="goals-head"><div><small>ДЕНЬ '+d.day+'</small><h2>Задания дня</h2></div><button class="goals-close" aria-label="Закрыть">✕</button></div><div class="goals-list">';
    for(const id of d.list){const t=DAILY.find(x=>x.id===id),p=Math.min(t.n,d.progress[id]||0),ok=d.claimed[id];html+='<div class="goal'+(ok?' done':'')+'"><span>'+t.icon+'</span><div><b>'+t.text+'</b><small>'+(ok?'Готово ✓':p+' из '+t.n)+'</small><em><i style="width:'+(p/t.n*100)+'%"></i></em></div><strong>+'+t.reward+' ✦</strong></div>'}
    html+='</div><p class="goals-note">Новые задания каждый игровой день.</p><h3>Достижения · '+Object.keys(g.unlocked).length+' из '+ACHIEVEMENTS.length+'</h3><div class="ach-grid">';
    for(const a of ACHIEVEMENTS){const ok=!!g.unlocked[a.id];html+='<div class="ach'+(ok?' done':'')+'"><span>'+(ok?a.icon:'🔒')+'</span><b>'+a.title+'</b><small>'+a.text+'</small><strong>+'+a.reward.toLocaleString('ru-RU')+' ✦'+(a.item?' · '+ITEM_NAMES[a.item]:'')+'</strong></div>'}
    dlg.innerHTML=html+'</div>';dlg.querySelector('.goals-close').onclick=()=>dlg.close()}
  btn.onclick=()=>{render();dlg.showModal()};
  dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
  rollDaily();updateBadge();setTimeout(check,4000);
  return {event,check,tick(){rollDaily();updateBadge()},open(){render();dlg.showModal()}};
}
