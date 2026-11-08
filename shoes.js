// Процедурная обувь по форме стопы персонажа.
// По коже стопы снимаем огибающую (ширину и высоту в каждом сечении вдоль стопы),
// сглаживаем её и строим гладкую колодку. Вырез, подошва, каблук и цвета зависят от типа.
// Для обуви с каблуком стопа в позе приподнимается (tilt), а каблук строится так,
// чтобы после наклона стопы стоять вертикально и доставать до пола.
import * as T from './vendor/three.module.js';

const PROFILES={
  sneakers:{sport:true,laces:true,heel:.088,vamp:.1,a0:.25,a1:.62,offset:.007,sole:.024,soleUp:.016,soleColor:'#f4f2ec',rough:.7,toe:.012,round:2.4,tilt:0},
  chunky:{sport:true,laces:true,heel:.095,vamp:.105,a0:.25,a1:.62,offset:.01,sole:.036,soleUp:.02,soleColor:'#f6f4ee',rough:.72,toe:.016,round:2.2,widen:.005,tilt:0},
  formal:{heel:.062,vamp:.06,a0:.3,a1:.64,offset:.004,sole:.011,soleUp:.005,soleColor:'#2b2420',rough:.26,toe:.022,round:2.7,point:.07,welt:true,laces:'dress',tilt:.09,heelColor:'#2b2420',heelBlock:true},
  boots:{heel:.15,vamp:.15,a0:.2,a1:.6,offset:.008,sole:.016,soleUp:.008,soleColor:'#352b25',rough:.6,toe:.018,round:2.4,welt:true,laces:'boot',tilt:.08,heelColor:'#352b25',heelBlock:true,shaft:.165},
  heels:{heel:.05,vamp:.036,a0:.34,a1:.74,offset:.003,sole:.005,soleUp:.002,soleColor:'#2a2322',rough:.28,toe:.032,round:2.9,point:.17,tilt:.34,heelColor:null,stiletto:true},
  ballet:{heel:.046,vamp:.044,a0:.32,a1:.7,offset:.003,sole:.006,soleUp:.002,soleColor:null,rough:.42,toe:.008,round:2.8,tilt:0,bow:true}
};
export function shoeTilt(type){return (PROFILES[type]||PROFILES.sneakers).tilt||0}
const sm=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t)};
const spow=(v,e)=>Math.sign(v)*Math.pow(Math.abs(v),e);

export function createShoes(body,joints,zones,options){
  const type=PROFILES[options.shoes]?options.shoes:'sneakers',P=PROFILES[type];
  const g=body.geometry,pos=g.attributes.position,zone=g.attributes._cczone,idx=g.index;
  if(!zone||!idx)return null;
  const isFoot=i=>(Math.round(zone.getX(i))&zones.feet)!==0;
  const bonesByName={};body.skeleton.bones.forEach((b,i)=>bonesByName[b.name]=i);
  const verts=[],ind=[],skI=[],skW=[],cols=[],hideTests=[];
  const upper=new T.Color(options.shoeColor||'#c4bda9'),accent=upper.clone().multiplyScalar(.74),soleC=P.soleColor?new T.Color(P.soleColor):upper.clone().multiplyScalar(.6),
    laceC=P.laces==='dress'||P.laces==='boot'?upper.clone().multiplyScalar(.45):new T.Color('#fbfaf6'),heelC=P.heelColor?new T.Color(P.heelColor):upper.clone().multiplyScalar(.85),seam=upper.clone().multiplyScalar(.8),rim=upper.clone().multiplyScalar(.7);
  const push=(x,y,z,b0,b1,w,c)=>{verts.push(x,y,z);skI.push(b0,b1,0,0);skW.push(1-w,w,0,0);cols.push(c.r,c.g,c.b);return verts.length/3-1};
  for(const side of ['l','r']){
    const sign=side==='l'?1:-1,list=[];
    for(let i=0;i<pos.count;i++)if(isFoot(i)&&Math.sign(pos.getX(i))===sign)list.push(i);
    if(list.length<20)continue;
    let low=Infinity,zmin=Infinity,zmax=-Infinity;
    for(const i of list){low=Math.min(low,pos.getY(i))}
    const nearGround=list.filter(i=>pos.getY(i)-low<.13);
    for(const i of nearGround){zmin=Math.min(zmin,pos.getZ(i));zmax=Math.max(zmax,pos.getZ(i))}
    const S=26,xl=new Array(S).fill(Infinity),xr=new Array(S).fill(-Infinity),top=new Array(S).fill(-Infinity);
    for(const i of nearGround){const s=Math.min(S-1,Math.floor((pos.getZ(i)-zmin)/(zmax-zmin)*S));xl[s]=Math.min(xl[s],pos.getX(i));xr[s]=Math.max(xr[s],pos.getX(i));top[s]=Math.max(top[s],Math.min(pos.getY(i),low+.13))}
    for(let s=0;s<S;s++)if(!Number.isFinite(xl[s])){const k=s>0?s-1:s+1;xl[s]=xl[k];xr[s]=xr[k];top[s]=top[k]}
    const avg=a=>{for(let r=0;r<4;r++){const b=a.slice();for(let s=1;s<S-1;s++)b[s]=(a[s-1]+2*a[s]+a[s+1])/4;a.splice(0,S,...b)}return a};
    avg(xl);avg(xr);avg(top);
    // Ровная колодка: ширина не меньше «обувной» формы (пятка уже, носок шире), без бугров от пальцев.
    const maxW=Math.max(...xr.map((v,k)=>v-xl[k]));
    const len=zmax-zmin,z0=zmin-.006,z1=zmax+P.toe,ball=joints.bones['ball_'+side],ballZ=ball?ball[2]:zmin+len*.72,ank=joints.bones['foot_'+side];
    const bFoot=bonesByName['foot_'+side],bBall=bonesByName['ball_'+side]??bFoot;
    const shoeLow=low-P.sole;
    const opening=u=>low+P.heel+(P.vamp-P.heel)*sm(P.a0,P.a1,u);
    const env=z=>{const f=Math.min(S-1.001,Math.max(0,(z-zmin)/len*S-.5)),k=Math.floor(f),t=f-k,lerp=a=>a[k]+(a[k+1]-a[k])*t;return {xl:lerp(xl),xr:lerp(xr),top:lerp(top)}};
    const shapeW=u=>maxW*(u<.12?.66+u*1.2:u<.45?.8+(u-.12)*.15:u<.72?.85+(u-.45)*.55:1);
    const soleRows=[],U=44,V=48,base=verts.length/3,W=V+1,secs=[];
    for(let a=0;a<=U;a++){
      const u=a/U,z=z0+(z1-z0)*u,e=env(z);
      const endR=Math.sqrt(Math.max(0,1-Math.pow(Math.abs(2*u-1),P.point?5:4)));
      const pointT=P.point?1-P.point*sm(.82,1,u)*3:1;
      const cx=(e.xl+e.xr)/2,envHalf=(e.xr-e.xl)/2,hw=Math.max(.0015,(Math.max(envHalf,shapeW(u)/2)+P.offset+(P.widen||0))*endR*Math.max(.25,pointT));
      const topRaw=Math.max(low+.022,e.top+P.offset),topY=u>.75?Math.min(topRaw,low+.022+(topRaw-low-.022)*(1-sm(.75,1.02,u)*.55)):topRaw;
      const yc=(shoeLow+topY)/2,hh=(topY-shoeLow)/2*(u<.5?1:Math.max(.3,endR)),line=low+P.soleUp;
      const open=opening(u),sCut=Math.max(-.2,Math.min(1,spow((open-yc)/hh,P.round/2)));
      const ta=Math.PI-Math.asin(sCut),tb=2*Math.PI+Math.asin(sCut);
      const w=sm(ballZ-.015,ballZ+.02,z);secs.push({u,z,cx,hw,yc,hh,line,w,topY});
      for(let b=0;b<=V;b++){
        const th=ta+(tb-ta)*b/V,c=Math.cos(th),sn=Math.sin(th);
        const x=cx+hw*spow(c,2/P.round),y=Math.max(line,yc+hh*spow(sn,sn>0?2/P.round:.25));
        let col=upper;const hgt=y-low,mid=Math.abs(c)<.32&&sn>.55;
        if(sCut<.999&&(b<=1||b>=V-1))col=rim;
        if(P.sport){if(u>.83&&hgt<.045)col=accent;else if(u<.14&&hgt>.028)col=accent;else if(u>.3&&u<.62&&Math.abs(hgt-.04)<.006&&!mid)col=accent}
        if(P.laces===true&&u>.42&&u<.72&&mid&&a%3===0)col=laceC;
        if(P.laces==='dress'&&u>.5&&u<.66&&mid&&a%2===0&&Math.abs(c)<.2)col=laceC;
        if(P.laces==='boot'&&u>.3&&u<.66&&mid&&a%3===0)col=laceC;
        if(P.welt&&Math.abs(u-.8)<.012&&sn>0)col=seam;
        if(P.bow&&u>.66&&u<.72&&mid)col=accent;
        push(x,y,z,bFoot,bBall,w,col);
      }
      const sl=-Math.pow(Math.min(1,Math.max(0,(yc-line)/hh)),4),cl=Math.sqrt(Math.max(0,1-sl*sl)),half=hw*spow(cl,2/P.round)+.002+(P.welt?.004:0)+(P.widen||0)*.5;
      const spring=P.tilt?0:.005*sm(.88,1,u);
      soleRows.push([[cx-half,line,z],[cx-half,shoeLow+spring,z],[cx+half,shoeLow+spring,z],[cx+half,line,z]].map(v=>({v,w})));
    }
    for(let a=0;a<U;a++)for(let b=0;b<V;b++){const i0=base+a*W+b,i1=i0+1,i2=i0+W,i3=i2+1;ind.push(i0,i2,i1,i1,i2,i3)}
    const sb=verts.length/3;
    for(const row of soleRows)for(const {v,w} of row)push(...v,bFoot,bBall,w,soleC);
    for(let a=0;a<soleRows.length-1;a++)for(let k=0;k<3;k++){const i0=sb+a*4+k,i1=i0+1,i2=i0+4,i3=i2+1;ind.push(i0,i1,i2,i1,i3,i2)}
    for(const a of [0,soleRows.length-1]){const r=sb+a*4;ind.push(r,r+1,r+2,r,r+2,r+3)}
    // Каблук: считаем, на сколько поднимется пятка после наклона стопы, и строим опору так, чтобы она встала вертикально.
    if(P.tilt&&ank){
      const th=P.tilt,A={y:ank[1],z:ank[2]},rot=(y,z)=>A.y+(y-A.y)*Math.cos(th)-(z-A.z)*Math.sin(th);
      const zHeel=zmin+len*(P.stiletto?.1:.12),groundY=rot(shoeLow,ballZ+.01),gap=Math.max(.008,rot(shoeLow,zHeel)-groundY);
      const sec=secs.reduce((best,s)=>Math.abs(s.z-zHeel)<Math.abs(best.z-zHeel)?s:best,secs[0]);
      const dir=new T.Vector3(0,-Math.cos(th),Math.sin(th));
      const ring=(cx,cy,cz,rx,rz,n)=>{const r=[];for(let k=0;k<n;k++){const a=k/n*Math.PI*2;r.push([cx+Math.cos(a)*rx,cy,cz+Math.sin(a)*rz])}return r};
      const tube=(pts0,pts1,col)=>{const n=pts0.length,s0=verts.length/3;for(const p of pts0)push(...p,bFoot,bBall,0,col);for(const p of pts1)push(...p,bFoot,bBall,0,col);for(let k=0;k<n;k++){const k2=(k+1)%n;ind.push(s0+k,s0+n+k,s0+k2,s0+k2,s0+n+k,s0+n+k2)}const c0=verts.length/3;const pc=pts1.reduce((a,p)=>[a[0]+p[0]/n,a[1]+p[1]/n,a[2]+p[2]/n],[0,0,0]);push(...pc,bFoot,bBall,0,col);for(let k=0;k<n;k++)ind.push(s0+n+k,c0,s0+n+(k+1)%n)};
      const n=14,move=(p,d)=>[p[0]+dir.x*d,p[1]+dir.y*d,p[2]+dir.z*d];
      if(P.stiletto){
        const cz=zmin+len*.09,topR=ring(sec.cx,shoeLow+.001,cz,.017,.022,n),botR=ring(sec.cx,shoeLow+.001,cz+.004,.0055,.0065,n).map(p=>move(p,gap));
        tube(topR,botR,heelC);
        const tip=ring(sec.cx,shoeLow,cz+.004,.0062,.0072,n).map(p=>move(p,gap+.006));tube(botR,tip,new T.Color('#1d1b1a'));
      }else{
        const cz=zmin+len*.11,rx=Math.max(.022,sec.hw*.88),rz=len*.1,topR=ring(sec.cx,shoeLow+.001,cz,rx,rz,n).map(p=>[p[0],p[1],Math.min(p[2],cz+rz*.75)]),botR=topR.map(p=>move([p[0],p[1],p[2]],gap));
        tube(topR,botR,heelC);
      }
    }
    // Голенище ботинка: кольцо вокруг щиколотки.
    let shaft=null;
    if(P.shaft){
      const ringV=[];for(let i=0;i<pos.count;i++){if(Math.sign(pos.getX(i))!==sign)continue;const y=pos.getY(i)-low,z=pos.getZ(i);if(y>.1&&y<P.shaft+.01&&z>zmin-.03&&z<zmin+len*.5&&Math.abs(pos.getX(i))<.25)ringV.push(i)}
      if(ringV.length>8){let cx=0,cz=0;for(const i of ringV){cx+=pos.getX(i);cz+=pos.getZ(i)}cx/=ringV.length;cz/=ringV.length;let rx=0,rz=0;for(const i of ringV){rx=Math.max(rx,Math.abs(pos.getX(i)-cx));rz=Math.max(rz,Math.abs(pos.getZ(i)-cz))}rx+=.005;rz+=.005;
        const n=24,s0=verts.length/3,ys=[low+.07,low+P.shaft-.012,low+P.shaft];
        for(const [k,y] of ys.entries())for(let j=0;j<n;j++){const a=j/n*Math.PI*2,grow=k===2?.0015:0;push(cx+Math.cos(a)*(rx+grow),y,cz+Math.sin(a)*(rz+grow),bFoot,bBall,0,k===2?rim:upper)}
        for(let k=0;k<ys.length-1;k++)for(let j=0;j<n;j++){const j2=(j+1)%n,a0=s0+k*n+j,a1=s0+k*n+j2,b0=a0+n,b1=a1+n;ind.push(a0,b0,a1,a1,b0,b1)}
        // боковые резинки челси
        shaft={cx,cz,rx,rz,top:low+P.shaft};
      }
    }
    hideTests.push({sign,low,zmin,z1,shaft,opening:(z)=>opening(Math.min(1,Math.max(0,(z-z0)/(z1-z0))))});
  }
  if(!ind.length)return null;
  const keepIdx=[];
  const covered=i=>{const t=hideTests.find(h=>Math.sign(pos.getX(i))===h.sign);if(t?.shaft){const sh=t.shaft,dx=(pos.getX(i)-sh.cx)/sh.rx,dz=(pos.getZ(i)-sh.cz)/sh.rz;if(pos.getY(i)<sh.top-.01&&pos.getY(i)>t.low+.05&&dx*dx+dz*dz<1.05)return true}if(!isFoot(i)||!t)return false;if(t.shaft&&pos.getY(i)<t.shaft.top-.01)return true;return pos.getY(i)<t.opening(pos.getZ(i))-.008};
  for(let t=0;t<idx.count;t+=3){const a=idx.getX(t),b=idx.getX(t+1),c=idx.getX(t+2);if(!(covered(a)&&covered(b)&&covered(c)))keepIdx.push(a,b,c)}
  g.setIndex(keepIdx);
  const geo=new T.BufferGeometry();
  geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));
  geo.setAttribute('color',new T.Float32BufferAttribute(cols,3));
  geo.setAttribute('skinIndex',new T.Uint16BufferAttribute(skI,4));
  geo.setAttribute('skinWeight',new T.Float32BufferAttribute(skW,4));
  geo.setIndex(ind);geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
  const mat=new T.MeshStandardMaterial({name:'ShoeShell',vertexColors:true,roughness:P.rough,metalness:0,side:T.DoubleSide});
  const mesh=new T.SkinnedMesh(geo,mat);
  mesh.name='Shoes_'+type;mesh.frustumCulled=false;mesh.castShadow=body.castShadow;mesh.receiveShadow=body.receiveShadow;
  mesh.position.copy(body.position);mesh.quaternion.copy(body.quaternion);mesh.scale.copy(body.scale);
  body.parent.add(mesh);mesh.bind(body.skeleton,body.bindMatrix);
  mesh.userData.owned=true;mesh.userData.tilt=P.tilt||0;
  return mesh;
}
