// Лёгкие питомцы из простых фигур: попугай и крыса. Без загрузки файлов, чтобы игра на телефоне оставалась быстрой.
import * as T from './vendor/three.module.js';
const geo={},mats=new Map();
const G=(k,f)=>geo[k]||(geo[k]=f());
const M=(c,o={})=>{const k=c+JSON.stringify(o);if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color:c,roughness:.8,...o}));return mats.get(k)};
const sphere=()=>G('s',()=>new T.SphereGeometry(1,14,10)),cone=()=>G('c',()=>new T.ConeGeometry(1,1,10)),cyl=()=>G('y',()=>new T.CylinderGeometry(1,1,1,8));
function mesh(g,m,sx,sy,sz,x=0,y=0,z=0,parent){const o=new T.Mesh(g,m);o.scale.set(sx,sy,sz);o.position.set(x,y,z);o.castShadow=true;parent.add(o);return o}
export const PARROT_COLORS=[['','Зелёный'],['#3f7fd0','Синий'],['#e2b33a','Жёлтый'],['#d9493a','Красный'],['#e8e6df','Белый'],['#8a9aa6','Серый']];
export const RAT_COLORS=[['','Белая'],['#8f8a84','Серая'],['#8a6448','Коричневая'],['#2f2b29','Чёрная'],['#d8c6a8','Бежевая']];

export function createParrot(profile){const root=new T.Group(),body=new T.Group();root.add(body);
  const k={baby:.7,young:.85,adult:1,senior:1}[profile.age]||1;body.scale.setScalar(k);
  const main=new T.Color(profile.color||'#4caf50'),mainM=M('#'+main.getHexString()),bellyM=M('#'+main.clone().lerp(new T.Color('#fff3b0'),.45).getHexString()),wingM=M('#'+main.clone().multiplyScalar(.72).getHexString()),accent=M(profile.color==='#d9493a'?'#3f7fd0':'#d9493a'),beakM=M('#3a3530',{roughness:.4}),eyeM=M('#141414',{roughness:.2}),whiteM=M('#f4f1ea'),legM=M('#8c8c88');
  const torso=new T.Group();torso.position.y=.13;body.add(torso);
  mesh(sphere(),mainM,.075,.105,.075,0,0,0,torso);mesh(sphere(),bellyM,.06,.085,.05,0,-.01,.03,torso);
  const head=new T.Group();head.position.set(0,.115,.02);torso.add(head);
  mesh(sphere(),mainM,.06,.06,.062,0,0,0,head);mesh(sphere(),accent,.035,.03,.04,0,.035,-.01,head);
  for(const s of [-1,1]){mesh(sphere(),whiteM,.019,.019,.012,s*.04,.008,.03,head);mesh(sphere(),eyeM,.009,.009,.006,s*.046,.01,.035,head)}
  const beak=mesh(cone(),beakM,.022,.045,.022,0,-.01,.07,head);beak.rotation.x=Math.PI/2+.5;
  const wings=[];for(const s of [-1,1]){const w=new T.Group();w.position.set(s*.07,.03,-.005);torso.add(w);const m=mesh(sphere(),wingM,.022,.085,.06,0,-.05,0,w);m.rotation.z=s*.12;mesh(sphere(),accent,.012,.03,.035,0,-.12,-.015,w);wings.push([w,s])}
  const tail=new T.Group();tail.position.set(0,-.08,-.05);torso.add(tail);const tm=mesh(sphere(),wingM,.03,.1,.012,0,-.07,0,tail);tail.rotation.x=.95;mesh(sphere(),accent,.022,.03,.01,0,-.16,0,tail);
  for(const s of [-1,1]){mesh(cyl(),legM,.007,.04,.007,s*.025,.03,.005,body);mesh(sphere(),legM,.014,.006,.02,s*.025,.008,.015,body)}
  let fly=0;
  function pose(mode,t){const moving=mode==='walk'||mode==='run',flying=mode==='run'||mode==='happy'&&Math.sin(t*.7)>.6;fly+=((flying?1:0)-fly)*.08;
    body.position.y=fly*(.55+Math.sin(t*3)*.05)+(mode==='walk'?Math.abs(Math.sin(t*9))*.025:0);
    const flap=fly>.05?Math.sin(t*26)*1.1*fly:mode==='happy'?Math.max(0,Math.sin(t*10))*.8:0;for(const [w,s] of wings){w.rotation.z=s*(.05+flap);w.rotation.x=fly*.3}
    torso.rotation.x=fly*.5+(mode==='eat'?.55+Math.max(0,Math.sin(t*6))*.25:0)+(mode==='sleep'?.15:0);
    head.rotation.z=mode==='idle'||mode==='held'?Math.sin(t*1.3)*.25*(Math.sin(t*.4)>0?1:0):mode==='happy'?Math.sin(t*8)*.2:0;
    head.rotation.x=mode==='sleep'?.9:mode==='idle'?Math.sin(t*2.2)*.08:0;head.rotation.y=mode==='sleep'?2.2:mode==='idle'?Math.sin(t*.9)*.5:0;
    tail.rotation.x=.95+Math.sin(t*(moving?12:2))*.06;body.rotation.z=0;root.rotation.z=0}
  return {root,pose,height:.3*k}}

export function createRat(profile){const root=new T.Group(),body=new T.Group();root.add(body);
  const k={baby:.6,young:.8,adult:1,senior:1}[profile.age]||1;body.scale.setScalar(k*1.1);
  const furM=M(profile.color||'#f1eee6'),light=new T.Color(profile.color||'#f1eee6').lerp(new T.Color('#ffffff'),.35),bellyM=M('#'+light.getHexString()),pinkM=M('#e3a5a1'),eyeM=M(profile.color&&profile.color!=='#f1eee6'&&profile.color!=='#d8c6a8'?'#121212':'#a8323a',{roughness:.15});
  const torso=new T.Group();torso.position.y=.045;body.add(torso);
  mesh(sphere(),furM,.05,.045,.085,0,0,0,torso);mesh(sphere(),bellyM,.042,.03,.07,0,-.015,.005,torso);
  const head=new T.Group();head.position.set(0,.01,.085);torso.add(head);
  const snout=mesh(sphere(),furM,.034,.032,.055,0,0,.02,head);mesh(sphere(),pinkM,.008,.007,.007,0,-.002,.074,head);
  for(const s of [-1,1]){const ear=mesh(sphere(),pinkM,.02,.022,.006,s*.024,.03,-.005,head);ear.rotation.y=s*.5;mesh(sphere(),eyeM,.007,.007,.007,s*.022,.012,.035,head)}
  const whisk=M('#e9e4da');for(const s of [-1,1])for(const a of [-.15,.15]){const w=mesh(cyl(),whisk,.0012,.06,.0012,s*.03,-.004,.062,head);w.rotation.z=Math.PI/2+a*s;w.rotation.y=s*.4}
  const tail=new T.Group();tail.position.set(0,-.005,-.08);torso.add(tail);const segs=[];let parent=tail;for(let i=0;i<6;i++){const g=new T.Group();g.position.z=i?-.03:0;parent.add(g);const m=mesh(cyl(),pinkM,.007-i*.0009,.032,.007-i*.0009,0,0,-.016,g);m.rotation.x=Math.PI/2;segs.push(g);parent=g}
  const feet=[];for(const [x,z] of [[-.03,.05],[.03,.05],[-.035,-.045],[.035,-.045]]){feet.push(mesh(sphere(),pinkM,.012,.008,.018,x,.006,z,body))}
  function pose(mode,t){const moving=mode==='walk'||mode==='run',f=mode==='run'?22:14;
    body.position.y=moving?Math.abs(Math.sin(t*f))*.008:0;feet.forEach((p,i)=>p.position.y=.006+(moving?Math.max(0,Math.sin(t*f+(i%2?Math.PI:0)))*.012:0));
    const stand=mode==='happy'&&Math.sin(t*1.6)>-.2;torso.rotation.x=stand?-1.05:mode==='eat'?.25:0;torso.position.y=stand?.08:mode==='sleep'?.035:.045;torso.scale.set(1,mode==='sleep'?.85:1,mode==='sleep'?.9:1);
    head.rotation.x=mode==='eat'?.4+Math.sin(t*14)*.08:stand?.9:0;head.rotation.y=mode==='idle'?Math.sin(t*1.7)*.4:mode==='sleep'?.8:0;head.position.y=.01+(mode==='idle'?Math.sin(t*30)*.0015:0);
    segs.forEach((g,i)=>{g.rotation.y=Math.sin(t*(moving?9:2.5)-i*.6)*(mode==='sleep'?.45:.18);g.rotation.x=i===0?(stand?1.0:.12):-.04});root.rotation.z=0}
  return {root,pose,height:.12*k}}
