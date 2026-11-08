// Городок вокруг участка: дома соседей через дорогу, гуляющие соседи и редкие машины.
// Всё сделано из простых фигур, чтобы не нагружать телефон.
import * as T from './vendor/three.module.js';

const mats=new Map();
const mat=(c,o={})=>{const k=c+JSON.stringify(o);if(!mats.has(k))mats.set(k,new T.MeshStandardMaterial({color:c,roughness:.85,...o}));return mats.get(k)};

export function initTown({scene,createCharacter}){
  const root=new T.Group();root.name='town';scene.add(root);
  const box=(w,h,d,m,x,y,z,parent=root)=>{const o=new T.Mesh(new T.BoxGeometry(w,h,d),typeof m==='string'?mat(m):m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o};
  const windowsLit=[];
  // Дома соседей: фасадом к дороге (на юг смотрит -z).
  const HOUSES=[{x:-21,w:7,d:6,h:3,wall:'#e8d9c2',roof:'#7a4b3a',door:'#5c7a6a'},{x:-9,w:6,d:6,h:3.2,wall:'#cfe0e6',roof:'#3f5866',door:'#b0583f'},{x:4,w:8,d:6,h:2.9,wall:'#f1e6d0',roof:'#8a5a3c',door:'#3f5f7a'},{x:17,w:6.5,d:6,h:3.1,wall:'#e6cfd2',roof:'#5c4a63',door:'#6d8a4f'}];
  for(const H of HOUSES){const g=new T.Group();g.position.set(H.x,-.15,20.5);root.add(g);
    box(H.w,H.h,H.d,H.wall,0,H.h/2,0,g);
    const sh=new T.Shape();sh.moveTo(-H.d/2-.35,0);sh.lineTo(H.d/2+.35,0);sh.lineTo(0,H.d*.36);sh.closePath();
    const roof=new T.Mesh(new T.ExtrudeGeometry(sh,{depth:H.w+.5,bevelEnabled:false}),mat(H.roof));roof.rotation.y=Math.PI/2;roof.position.set(-H.w/2-.25,H.h,0);roof.castShadow=true;g.add(roof);
    box(1,2.1,.1,H.door,0,1.05,-H.d/2-.04,g);box(1.2,.12,.6,'#c9c3b4',0,.06,-H.d/2-.3,g);
    for(const wx of [-H.w/2+1.3,H.w/2-1.3]){const w=box(1.1,1,.08,new T.MeshStandardMaterial({color:'#9fc0cc',emissive:'#ffd58a',emissiveIntensity:0,roughness:.2}),wx,1.6,-H.d/2-.04,g);windowsLit.push(w.material);box(1.3,.1,.14,'#ffffff',wx,1.05,-H.d/2-.06,g)}
    box(.9,1.2,.08,'#9fc0cc',0,H.h-.3>2.6?2.4:2.3,-H.d/2-.04,g).visible=H.h>3.05;
    // дорожка к тротуару и заборчик
    box(1.2,.04,3.7,'#bdb7a8',0,.1,-H.d/2-1.85,g);
    for(const sx of [-1,1])for(let k=0;k<5;k++)box(.08,.6,.06,'#f1eee4',sx*(1.2+k*.55),.4,-H.d/2-3.25,g);
    for(const sx of [-1,1])box(2.4,.06,.04,'#f1eee4',sx*2.3,.55,-H.d/2-3.25,g);
    // деревце во дворе
    const tx=H.w/2+1.4;box(.18,1.4,.18,'#6a5038',tx,.7,-1,g);const crown=new T.Mesh(new T.SphereGeometry(.9,12,9),mat('#5f8a47'));crown.position.set(tx,1.9,-1);crown.castShadow=true;g.add(crown);
  }
  // Машины.
  const cars=[],carColors=['#c23b3b','#3b6fc2','#e8e4da','#2f3537','#d7a43a','#5f8a5f','#8a8f96'];
  function makeCar(){const g=new T.Group(),body=new T.MeshStandardMaterial({color:'#c23b3b',roughness:.35,metalness:.3});
    box(3.9,.55,1.7,body,0,.55,0,g);const cab=box(2.1,.55,1.5,body,-.2,1.05,0,g);
    box(2.0,.45,1.52,new T.MeshStandardMaterial({color:'#1f2a30',roughness:.1,metalness:.4}),-.2,1.07,0,g);
    const wheels=[];for(const x of [-1.25,1.25])for(const z of [-.82,.82]){const w=new T.Mesh(new T.CylinderGeometry(.34,.34,.24,14),mat('#1d1d1f'));w.rotation.x=Math.PI/2;w.position.set(x,.34,z);g.add(w);wheels.push(w)}
    const lights=[];for(const z of [-.55,.55]){const l=box(.06,.14,.3,new T.MeshStandardMaterial({color:'#fff6d8',emissive:'#ffe9b0',emissiveIntensity:.2}),1.96,.62,z,g);lights.push(l.material);box(.06,.12,.26,new T.MeshStandardMaterial({color:'#a8302a',emissive:'#ff3b2f',emissiveIntensity:.2}),-1.96,.62,z,g)}
    g.visible=false;root.add(g);return {g,body,wheels,lights,active:false,dir:1,speed:7}}
  for(let i=0;i<3;i++)cars.push(makeCar());
  let nextCar=6+Math.random()*10;
  function spawnCar(){const c=cars.find(c=>!c.active);if(!c)return;c.active=true;c.dir=Math.random()<.5?1:-1;c.speed=6+Math.random()*3;c.body.color.set(carColors[Math.floor(Math.random()*carColors.length)]);c.g.position.set(-c.dir*70,-.1,c.dir>0?8.7:11.3);c.g.rotation.y=c.dir>0?0:Math.PI;c.g.visible=true}
  // Соседи-прохожие.
  const neighbors=[];const mobile=Math.min(innerWidth,innerHeight)<700;
  const PROFILES=[{first:'Ника',gender:'female',age:'adult',hairstyle:'bob',hairColor:'#6b3f2a',clothesColor:'#7fa3c7',outfit:'casual',bottomColor:'#3d4b5c',shoes:'sneakers',shoeColor:'#f1efe9',skinColor:'#e2b896'},{first:'Олег',gender:'male',age:'adult',hairstyle:'short',hairColor:'#2c2420',clothesColor:'#6f8f5c',outfit:'casual',bottomColor:'#4a4a4a',shoes:'boots',shoeColor:'#5a3f2c',skinColor:'#c99a78'}];
  for(const [i,p] of PROFILES.slice(0,mobile?1:2).entries()){try{const c=createCharacter({...p,traits:[],appearanceSet:true});const home=HOUSES[i===0?1:2];c.root.position.set(home.x,0,13.2);root.add(c.root);neighbors.push({c,home,x:home.x,target:home.x+(i?18:-16),wait:3+i*4,mode:'idle'})}catch(e){console.warn('neighbor',e)}}
  function update(dt,t,hour=12){
    const night=hour<6.5||hour>19.5;for(const m of windowsLit)m.emissiveIntensity=night?.9:0;
    nextCar-=dt;if(nextCar<=0){spawnCar();nextCar=18+Math.random()*22}
    for(const c of cars){if(!c.active)continue;c.g.position.x+=c.dir*c.speed*dt;for(const w of c.wheels)w.rotation.y+=c.speed*dt/.34*c.dir;for(const l of c.lights)l.emissiveIntensity=night?1.6:.2;if(Math.abs(c.g.position.x)>72){c.active=false;c.g.visible=false}}
    for(const n of neighbors){const c=n.c;if(!c.loaded)continue;const y=-.02-(c.footContact||0);
      if(n.wait>0){n.wait-=dt;n.mode='idle'}else{const d=n.target-n.x,step=Math.sign(d)*Math.min(Math.abs(d),1.25*dt);n.x+=step;n.mode='walk';c.root.rotation.y=d>0?Math.PI/2:-Math.PI/2;if(Math.abs(d)<.05){n.wait=4+Math.random()*8;n.target=Math.abs(n.x-n.home.x)<1?n.home.x+(Math.random()<.5?-1:1)*(10+Math.random()*14):n.home.x}}
      c.root.position.set(n.x,y,13.2);if(n.mode==='idle'&&Math.abs(n.x-n.home.x)<.1)c.root.rotation.y=Math.PI;c.pose(n.mode,t+n.home.x);if(c.marker)c.marker.visible=false}
  }
  return {update,root,spawnCar};
}
