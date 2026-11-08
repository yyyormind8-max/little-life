// Анимации из библиотеки Quaternius (CC0), перенесённые на скелет персонажа.
// Файл assets/anim/library.json хранит для каждого кадра поворот кости относительно
// T-позы исходного скелета (в мировых осях). Здесь мы строим T-позу нашего
// персонажа и применяем к ней те же повороты, с плавным переходом между клипами.
import * as T from './vendor/three.module.js';

let lib=null,libPromise=null;
export function loadAnimationLibrary(){
  if(!libPromise)libPromise=fetch(new URL('./assets/anim/library.json',import.meta.url)).then(r=>r.ok?r.json():null).then(d=>{if(d){for(const c of Object.values(d.clips)){c.x0=c.hip[0];c.z0=c.hip[2]}}lib=d;return d}).catch(()=>null);
  return libPromise;
}
loadAnimationLibrary();

// Какие клипы играют для каких действий игры. Остальные действия остаются процедурными.
const SIT=['work','eat','fun','read','music','phone','game','draw','sit'];
export function clipForMode(mode,t=0){
  if(mode==='idle')return 'Idle_Loop';
  if(mode==='walk')return 'Walk_Loop';
  if(mode==='walkCarry')return 'Walk_Carry_Loop';
  if(mode==='social')return (t%16)>13?'Yes':'Idle_Talking_Loop';
  if(mode==='jump')return 'Jump_Loop';
  if(mode==='sx_dance')return 'Dance_Loop';
  if(mode==='sx_no')return 'Idle_No_Loop';
  if(mode==='sx_laugh')return 'Yes';
  if(mode.startsWith('sx_'))return 'Idle_Loop';
  if(mode==='eatStanding')return 'Consume';
  if(SIT.includes(mode))return 'Sitting_Idle_Loop';
  if(mode.endsWith('Standing')||mode==='carry')return 'Idle_Loop';
  if(mode.startsWith('pet_'))return 'Crouch_Idle_Loop';
  return null;
}
// Действия, где руки по-прежнему ставит игра (телефон в руке, еда сидя, клавиатура и т.д.).
export function armsOverridden(mode){
  return !['walk','social','walkCarry','jump','eatStanding','sx_dance','sx_no','sx_laugh'].includes(mode);
}

// В стоячих клипах библиотеки широкая «боевая» стойка. Для бытовой игры сводим ноги ближе и выпрямляем колени.
const STAND=new Set(['Idle_Loop','Idle_Talking_Loop','Idle_FoldArms_Loop','Yes','Idle_No_Loop','Consume','Idle_TalkingPhone_Loop']);
const LEG=/^(thigh|calf|foot|ball)_/;const TORSO=/^(spine_|clavicle_|neck_|head$)/;
const tmpA=new T.Quaternion(),tmpB=new T.Quaternion(),v1=new T.Vector3(),v2=new T.Vector3(),m=new T.Matrix4();

export function createAnimator(bones,rest,holder){
  if(!lib)return null;
  // Пальцы оставляем игре: у скелетов разная форма кисти, перенос пальцев выглядит неестественно.
  const list=lib.bones.map(n=>/^(index|middle|ring|pinky|thumb)_/.test(n)?null:(bones[n]||null));
  // T-поза персонажа: конечности разворачиваем вдоль направлений исходной T-позы.
  holder.updateMatrixWorld(true);
  const toHolder=m.copy(holder.matrixWorld).invert();
  const pos=n=>bones[n]?bones[n].getWorldPosition(new T.Vector3()).applyMatrix4(toHolder):null;
  const palm={};
  for(const s of ['l','r']){const a=pos('index_01_'+s),b=pos('pinky_01_'+s);if(a&&b)palm[s]=b.sub(a).normalize()}
  // Поворот, переводящий базис (основное направление кости + опорный вектор) нашего скелета в базис исходного.
  function frame(p,s){const x=p.clone().normalize(),z=s.clone().addScaledVector(x,-s.dot(x)).normalize(),y=new T.Vector3().crossVectors(z,x);return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z))}
  const tpose=list.map((bone,i)=>{
    if(!bone)return null;
    const r=rest.get(bone);if(!r)return null;
    const name=lib.bones[i],q=r.world.clone(),d=lib.dirs[name],child=d&&bones[d.child];
    if(d&&child&&name!=='pelvis'){
      const from=pos(d.child).sub(pos(name)).normalize(),to=new T.Vector3().fromArray(d.d);
      const side=name.endsWith('_l')?'l':name.endsWith('_r')?'r':null;
      let sv=side&&/^(hand|lowerarm|index|middle|ring|pinky|thumb)/.test(name)?palm[side]:null;
      if(!sv)sv=Math.abs(from.z)>.7?new T.Vector3(0,1,0):new T.Vector3(0,0,1);
      if(from.lengthSq()>0&&d.s)q.premultiply(frame(to,new T.Vector3().fromArray(d.s)).multiply(frame(from,sv).invert()));
      else if(from.lengthSq()>0)q.premultiply(new T.Quaternion().setFromUnitVectors(from,to));
    }
    return q;
  });
  const pelvis=bones.pelvis,pelvisRest=new T.Vector3();
  if(pelvis){pelvis.getWorldPosition(pelvisRest).applyMatrix4(toHolder)}
  const ratio=pelvisRest.y>0?pelvisRest.y/lib.hipHeight:1;
  const legIdx=lib.bones.map(n=>LEG.test(n)),torsoIdx=lib.bones.map(n=>TORSO.test(n)),world=list.map(()=>new T.Quaternion()),sampleA=list.map(()=>new T.Quaternion()),sampleB=list.map(()=>new T.Quaternion());
  const hipA=new T.Vector3(),hipB=new T.Vector3();
  let cur=null,prev=null,start=0,prevStart=0,switched=-1;

  function sample(name,time,out,hip,loop){
    const c=lib.clips[name],n=c.frames.length;
    let f=time*c.fps;
    if(loop){f%=(n-1);if(f<0)f+=n-1}else f=Math.max(0,Math.min(f,n-1));
    const i=Math.floor(f),j=Math.min(i+1,n-1),w=f-i,A=c.frames[i],B=c.frames[j];
    for(let b=0;b<out.length;b++){const k=b*4;out[b].set(A[k],A[k+1],A[k+2],A[k+3]);tmpB.set(B[k],B[k+1],B[k+2],B[k+3]);out[b].slerp(tmpB,w)}
    const ha=c.hip,ia=i*3,ja=j*3;
    hip.set(ha[ia]+(ha[ja]-ha[ia])*w-c.x0,ha[ia+1]+(ha[ja+1]-ha[ia+1])*w,0);
  }

  // basis: мировой поворот holder. now: секунды. rate: скорость клипа. instant: без перехода.
  function apply(name,basis,now,{rate=1,instant=false}={}){
    if(!lib.clips[name])return false;
    if(now<switched){start=switched=prevStart=now}
    if(name!==cur){prev=instant?null:cur;prevStart=start;cur=name;start=now;switched=now}
    const loop=name.endsWith('_Loop');
    sample(cur,(now-start)*rate,sampleA,hipA,loop);
    const fade=prev?Math.max(0,Math.min(1,(now-switched)/.3)):1;
    if(fade<1){sample(prev,(now-prevStart)*rate,sampleB,hipB,prev.endsWith('_Loop'));for(let b=0;b<sampleA.length;b++)sampleA[b].slerp(sampleB[b],1-fade);hipA.lerp(hipB,1-fade)}else prev=null;
    if(STAND.has(cur)){const id=new T.Quaternion();for(let b=0;b<sampleA.length;b++){if(legIdx[b])sampleA[b].slerp(id,.6);else if(torsoIdx[b])sampleA[b].slerp(id,.55)}hipA.multiplyScalar(.35)}
    for(let b=0;b<list.length;b++){
      const bone=list[b];if(!bone||!tpose[b])continue;
      world[b].copy(sampleA[b]).multiply(tpose[b]).premultiply(basis);
      const pi=list.indexOf(bone.parent);
      if(pi>=0)tmpA.copy(world[pi]).invert();else bone.parent.getWorldQuaternion(tmpA).invert();
      bone.quaternion.copy(tmpA.multiply(world[b]));
    }
    if(pelvis){v1.copy(pelvisRest).addScaledVector(hipA,ratio).applyMatrix4(holder.matrixWorld);pelvis.parent.updateWorldMatrix(true,false);pelvis.position.copy(pelvis.parent.worldToLocal(v1))}
    return true;
  }
  return {apply,get clip(){return cur}};
}
