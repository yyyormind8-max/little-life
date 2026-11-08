// Общение между жителями «как в The Sims»: каталог действий, условия, исход и реплики.
// Романтические действия доступны только взрослым (взрослый/пожилой) и не родственникам.

const ADULT=['adult','senior'];
const FAMILY=['brother','sister'];
const pick=a=>a[Math.floor(Math.random()*a.length)];

// stage: stranger | known | friend | close.  need: минимальная дружба/симпатия.
export const INTERACTIONS=[
  // Приветствия
  {id:'wave',cat:'greet',icon:'👋',label:'Помахать рукой',dur:3,f:2,anim:'wave',react:'wave',say:['Привет!','Приветик!','Хэй!'],reply:['Привет!','О, привет!']},
  {id:'greet_friendly',cat:'greet',icon:'🤝',label:'Дружеское приветствие',dur:4,f:4,anim:'handshake',react:'handshake',dist:.62,say:['Рад(а) тебя видеть!','Привет, как жизнь?'],reply:['Взаимно!','И я тебе рад(а)!']},
  {id:'greet_romantic',cat:'greet',icon:'😘',label:'Романтичное приветствие',dur:4,r:5,romance:true,needR:10,anim:'hug',react:'hug',dist:.42,say:['Привет, солнышко…','Я скучал(а)!'],reply:['Ой… привет 😊','И я скучал(а)!'],fail:['Эм… давай не так сразу.']},
  // Разговор
  {id:'introduce',cat:'talk',icon:'🙋',label:'Давай познакомимся!',dur:5,f:8,only:'stranger',meet:true,say:['Привет! Давай познакомимся?','Я {me}. А ты?'],reply:['Давай! Я {them}.','Очень приятно, я {them}!']},
  {id:'ask_name',cat:'talk',icon:'❓',label:'Как тебя зовут?',dur:4,f:5,only:'stranger',meet:true,say:['Извини, как тебя зовут?'],reply:['Меня зовут {them}!','Я {them}. А тебя?']},
  {id:'ask_how',cat:'talk',icon:'💬',label:'Как дела?',dur:5,f:5,say:['Как дела?','Как твой день?'],reply:['Отлично, спасибо!','Нормально, а у тебя?','Немного устал(а), но хорошо.']},
  {id:'ask_hobby',cat:'talk',icon:'🎨',label:'Чем увлекаешься?',dur:5,f:6,stage:'known',say:['Чем ты любишь заниматься?'],reply:['Обожаю {hobby}!','{hobby} — моё всё.']},
  {id:'ask_food',cat:'talk',icon:'🍝',label:'Любимая еда?',dur:4,f:5,stage:'known',say:['А какая у тебя любимая еда?'],reply:['{food}, конечно!','Не могу жить без: {food}.']},
  {id:'ask_music',cat:'talk',icon:'🎵',label:'Какую музыку слушаешь?',dur:4,f:5,stage:'known',say:['Что сейчас слушаешь?'],reply:['{music}, всегда!','В основном {music}.']},
  {id:'joke',cat:'talk',icon:'😂',label:'Пошутить',dur:5,f:7,risk:.25,stage:'known',anim:'laugh',react:'laugh',say:['Знаешь анекдот про кота и пиццу?','Почему программисты путают Хэллоуин и Рождество?'],reply:['Ха-ха-ха! 😂','Ой, не могу! 😄'],fail:['Эм… не смешно.']},
  {id:'compliment',cat:'talk',icon:'🌟',label:'Сделать комплимент',dur:4,f:6,stage:'known',say:['Ты сегодня отлично выглядишь!','Мне нравится твой стиль.'],reply:['Спасибо! Приятно 😊','Ой, ты тоже!']},
  {id:'complain',cat:'talk',icon:'😮‍💨',label:'Пожаловаться на день',dur:5,f:4,stage:'friend',say:['Ну и денёк сегодня…'],reply:['Понимаю тебя. Держись!','Расскажи, что случилось?']},
  {id:'deep_talk',cat:'talk',icon:'🫶',label:'Поговорить по душам',dur:7,f:10,stage:'friend',say:['О чём ты мечтаешь?','Мне важно твоё мнение…'],reply:['Знаешь, я давно хотел(а) рассказать…','С тобой так легко говорить.']},
  {id:'argue',cat:'talk',icon:'😤',label:'Поспорить',dur:5,f:-12,stage:'known',anim:'no',react:'no',say:['Ты не прав(а)!','Я с этим не согласен(на)!'],reply:['Да ну тебя!','Ещё как прав(а)!']},
  // Дружба
  {id:'high_five',cat:'friend',icon:'✋',label:'Дать пять',dur:3,f:5,stage:'friend',anim:'highfive',react:'highfive',dist:.62,say:['Дай пять!'],reply:['Есть! ✋']},
  {id:'hug_friendly',cat:'friend',icon:'🤗',label:'Дружески обнять',dur:4,f:8,stage:'friend',anim:'hug',react:'hug',dist:.42,risk:.1,say:['Иди сюда, обнимемся!'],reply:['С радостью! 🤗'],fail:['Ой, давай без объятий.']},
  {id:'dance',cat:'friend',icon:'💃',label:'Потанцевать вместе',dur:8,f:9,stage:'friend',anim:'dance',react:'dance',dist:.9,say:['Потанцуем?'],reply:['Ещё бы! 💃']},
  // Романтика
  {id:'flirt',cat:'romance',icon:'😉',label:'Флиртовать',dur:5,r:8,romance:true,stage:'known',risk:.25,say:['Тебе говорили, что у тебя красивая улыбка?','Ты сегодня особенно… 😉'],reply:['Ой, перестань 😊','Мне приятно…'],fail:['Хм, не сейчас.']},
  {id:'romantic_compliment',cat:'romance',icon:'🌹',label:'Романтичный комплимент',dur:4,r:7,romance:true,needR:5,say:['Рядом с тобой день становится лучше.'],reply:['Это так мило… 🥰']},
  {id:'romantic_hug',cat:'romance',icon:'💞',label:'Романтично обнять',dur:5,r:10,romance:true,needR:20,anim:'hug',react:'hug',dist:.4,risk:.15,say:['Иди ко мне…'],reply:['💞'],fail:['Эм… рано ещё.']},
  {id:'kiss_cheek',cat:'romance',icon:'💋',label:'Поцеловать в щёку',dur:4,r:12,romance:true,needR:35,anim:'kiss',react:'kiss',dist:.38,risk:.15,say:['…'],reply:['Ох… 😳💗'],fail:['Не так быстро!']},
  {id:'ask_date',cat:'romance',icon:'💌',label:'Предложить встречаться',dur:6,r:15,romance:true,needR:60,date:true,risk:.2,say:['Давай встречаться?'],reply:['Да! Конечно да! 💖'],fail:['Мне нужно подумать…']}
];
export const CATEGORIES={greet:'Приветствие',talk:'Разговор',friend:'Дружба',romance:'Романтика'};
export const byId=id=>INTERACTIONS.find(i=>i.id===id);

export function scores(state,a,b){const key=[a,b].sort().join('|');state.friendship=state.friendship||{};state.romance=state.romance||{};return {key,f:state.friendship[key]||0,r:state.romance[key]||0}}

function stageOf(rel,f){if(rel==='stranger'||!rel)return 'stranger';if(f>=60)return 'close';if(f>=30||['friend','friend_f','brother','sister','husband','wife','sweetheart'].includes(rel))return 'friend';return 'known'}
const ORDER=['stranger','known','friend','close'];

export function canRomance(me,them,rel){return ADULT.includes(me.age||'adult')&&ADULT.includes(them.age||'adult')&&!FAMILY.includes(rel)}

export function available(state,meId,themId,me,them){
  const rel=state.relations[meId+'|'+themId]||'stranger',{f,r}=scores(state,meId,themId),stage=stageOf(rel,f);
  return INTERACTIONS.filter(i=>{
    if(i.only&&i.only!==stage)return false;
    if(i.stage&&ORDER.indexOf(stage)<ORDER.indexOf(i.stage))return false;
    if(i.romance&&!canRomance(me,them,rel))return false;
    if(i.romance&&stage==='stranger')return false;
    if(i.needR&&r<i.needR&&!['husband','wife','sweetheart'].includes(rel))return false;
    if(i.date&&['husband','wife','sweetheart'].includes(rel))return false;
    return true;
  }).map(i=>({...i,stage}));
}

function fill(text,me,them){return text.replace('{me}',me.first||'я').replace('{them}',them.first||'…').replace('{hobby}',(them.hobby||'чтение').toLowerCase()).replace('{food}',them.food||'паста').replace('{music}',them.music||'поп')}

// Решаем исход заранее, чтобы реплика ответа совпадала с результатом.
export function plan(state,meId,themId,me,them,id){
  const i=byId(id);if(!i)return null;const {f,r}=scores(state,meId,themId);
  const traits=me.traits||[],theirs=them.traits||[];
  let risk=i.risk||0;
  if(i.romance)risk=Math.max(0,risk-r/200-(traits.includes('romantic')?.1:0));
  else risk=Math.max(0,risk-f/250-(traits.includes('friendly')?.08:0)-(theirs.includes('calm')?.05:0));
  const ok=Math.random()>=risk;
  const say=fill(pick(i.say),me,them),reply=fill(pick(ok?i.reply:(i.fail||i.reply)),me,them);
  return {id,ok,say,reply,anim:i.anim||'talk',react:ok?(i.react||'talk'):'no',dur:i.dur,dist:i.dist||.8,label:i.label};
}

export function apply(state,meId,themId,p,me,them){
  const i=byId(p.id),{key}=scores(state,meId,themId),mult=p.ok?1:-.6;
  if(i.f)state.friendship[key]=Math.max(-100,Math.min(100,(state.friendship[key]||0)+Math.round(i.f*mult)));
  if(i.r)state.romance[key]=Math.max(-100,Math.min(100,(state.romance[key]||0)+Math.round(i.r*mult)));
  const relAB=meId+'|'+themId,relBA=themId+'|'+meId,rel=state.relations[relAB]||'stranger';
  let note='';
  if(p.ok&&i.meet&&rel==='stranger'){state.relations[relAB]=state.relations[relBA]='acquaintance';note='Теперь вы знакомы'}
  const f=state.friendship[key]||0;
  if(p.ok&&f>=40&&['stranger','acquaintance'].includes(state.relations[relAB]||'stranger')){state.relations[relAB]=them.gender==='female'?'friend_f':'friend';state.relations[relBA]=me.gender==='female'?'friend_f':'friend';note='Вы теперь друзья!'}
  if(p.ok&&i.date){state.relations[relAB]=state.relations[relBA]='sweetheart';note='Теперь вы пара 💖'}
  return note;
}
