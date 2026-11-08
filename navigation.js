// A small floor-plane pathfinder. Rectangles include the character's clearance.
export function findPath(from,to,obstacles,{step=.25,minX=-7.9,maxX=7.9,minZ=-7.95,maxZ=3.95}={}){
 const nx=Math.floor((maxX-minX)/step)+1,nz=Math.floor((maxZ-minZ)/step)+1;
 const point=id=>({x:minX+(id%nx)*step,z:minZ+Math.floor(id/nx)*step});
 const blocked=id=>{const p=point(id);return obstacles.some(r=>p.x>r[0]-.2&&p.x<r[2]+.2&&p.z>r[1]-.2&&p.z<r[3]+.2)};
 function nearest(p){let best=-1,dist=Infinity;for(let id=0;id<nx*nz;id++){const q=point(id),d=(q.x-p.x)**2+(q.z-p.z)**2;if(d<dist&&!blocked(id)){best=id;dist=d}}return best}
 const start=nearest(from),goal=nearest(to);if(start<0||goal<0)return null;
 const queue=[start],parents=new Int32Array(nx*nz).fill(-2);parents[start]=-1;
 for(let i=0;i<queue.length;i++){const id=queue[i];if(id===goal)break;const x=id%nx,z=Math.floor(id/nx);for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const xx=x+dx,zz=z+dz;if(xx<0||xx>=nx||zz<0||zz>=nz)continue;const next=zz*nx+xx;if(parents[next]!==-2||blocked(next))continue;parents[next]=id;queue.push(next)}}
 if(parents[goal]===-2)return null;
 const route=[];for(let id=goal;id!==-1;id=parents[id])route.push(point(id));route.reverse();
 // Keep corners, eliminating unnecessary intermediate points on straight segments.
 const result=[];for(let i=0;i<route.length;i++){if(i===0||i===route.length-1||(route[i].x-route[i-1].x)!==(route[i+1].x-route[i].x)||(route[i].z-route[i-1].z)!==(route[i+1].z-route[i].z))result.push(route[i])}return result;
}
