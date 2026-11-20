import * as T from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {houses,randomSource} from './layout.js';

export function buildVillage(){
  const rand=randomSource(1847), batches=new Map(), materials=new Map(), walls=[];
  const transform=new T.Object3D();
  const cube=new T.BoxGeometry(), sphere=new T.IcosahedronGeometry(1,0);
  function surface(color,kind='plain'){
    const key=color+kind;
    if(materials.has(key)) return materials.get(key);
    let map=null;
    if(['stone','timber','plaster','roof','road','grass'].includes(kind)){
      const c=document.createElement('canvas'); c.width=c.height=128;
      const g=c.getContext('2d');g.fillStyle='#e2ded3';g.fillRect(0,0,128,128);
      for(let i=0;i<1200;i++){g.fillStyle=rand()>.5?'#ffffff29':'#18181529';g.fillRect(rand()*128,rand()*128,kind==='timber'?rand()*25:rand()*3,rand()*2+1);}
      if(kind==='stone'||kind==='roof'){
        g.strokeStyle=kind==='roof'?'#20262377':'#38363266';g.lineWidth=2;
        for(let row=0;row<8;row++){let y=row*16;g.beginPath();g.moveTo(0,y);g.lineTo(128,y);g.stroke();
          for(let x=(row%2)*16;x<128;x+=32){g.beginPath();g.moveTo(x,y);g.lineTo(x,y+16);g.stroke();}}
      }
      map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;map.wrapS=map.wrapT=T.RepeatWrapping;
      if(kind==='grass')map.repeat.set(65,65);if(kind==='road')map.repeat.set(3,12);
    }
    const mat=new T.MeshStandardMaterial({color,map,roughness:1,flatShading:true});
    materials.set(key,mat);return mat;
  }
  function piece(shape,x,y,z,w,h,d,color,kind='plain',rx=0,ry=0,rz=0){
    const mat=surface(color,kind);if(!batches.has(mat))batches.set(mat,[]);
    transform.position.set(x,y,z);transform.scale.set(w,h,d);transform.rotation.set(rx,ry,rz);transform.updateMatrix();
    batches.get(mat).push({shape,matrix:transform.matrix.clone()});
  }
  const box=(...a)=>piece(cube,...a);
  const cyl=new T.CylinderGeometry(1,1,1,12),cone=new T.ConeGeometry(1,1,9);
  const solid=(x,y,z,w,h,d)=>walls.push({x,y,z,w,h,d});
  function beam(a,b,width,color){
    const p=new T.Vector3(...a),q=new T.Vector3(...b),v=q.clone().sub(p);
    const rot=new T.Euler().setFromQuaternion(new T.Quaternion().setFromUnitVectors(new T.Vector3(0,1,0),v.clone().normalize()));
    p.lerp(q,.5);box(p.x,p.y,p.z,width,v.length(),width,color,'timber',rot.x,rot.y,rot.z);
  }
  box(0,-.35,0,260,.7,260,'#6a7042','grass');
  box(0,.008,3,8,.025,62,'#bba17b','road');box(0,.022,2,54,.025,7,'#ba9f77','road');
  box(1,.035,-3,14,.024,17,'#ac9270','road');
  const wood='#49372a',stone='#8e8c79';
  function windowAt(x,y,z){
    box(x,y,z,1.03,1.23,.13,wood,'timber');box(x,y,z+.08,.78,.95,.06,'#eeb277');
    box(x,y,z+.13,.09,1,.07,wood);box(x,y,z+.13,.84,.09,.07,wood);
    box(x,y-.62,z+.12,1.23,.12,.32,wood);
  }
  function home(x,z,w,d,h,index){
    box(x,h/2,z,w,h,d,['#d4bf98','#b9ac94','#c9b9a0'][index%3],'plaster');
    solid(x,h/2,z,w,h,d);
    box(x,.38,z,w+.14,.76,d+.14,stone,'stone');
    for(const side of [-1,1]){
      for(const t of [-.48,0,.48])box(x+t*w,h/2,z+side*d*.50,.19,h,.22,wood,'timber');
      for(const t of [-.48,0,.48])box(x+side*w*.5,h/2,z+t*d,.22,h,.18,wood,'timber');
      box(x,h-.12,z+side*d*.5,w,.23,.24,wood);
      box(x+side*w*.5,h-.12,z,.24,.23,d,wood);
      for(const t of [-1,1])beam([x+t*w*.46,1,z+side*(d/2+.04)],[x+t*w*.08,h-.3,z+side*(d/2+.04)],.13,wood);
    }
    const rise=w*.48,angle=Math.atan2(rise,w/2),slope=Math.hypot(w/2,rise)+.7;
    for(const s of [-1,1])box(x+s*w*.25,h+rise/2,z,slope,.27,d+1,['#654739','#475051','#784c3a'][index%3],'roof',0,0,-s*angle);
    for(const s of [-1,1]){
      const shape=new T.Shape();shape.moveTo(-w/2,0);shape.lineTo(w/2,0);shape.lineTo(0,rise);shape.closePath();
      const face=new T.ShapeGeometry(shape);piece(face,x,h,z+s*d/2,1,1,1,'#bdae94','plaster',0,s<0?Math.PI:0);
      box(x,h+rise*.45,z+s*(d/2+.04),.14,rise*.9,.12,wood);
    }
    box(x+w*.3,h+rise*.78,z-d*.22,.75,2.6,.87,stone,'stone');
    box(x+w*.3,h+rise*.78+1.3,z-d*.22,.94,.2,1.05,'#56554b','stone');
    box(x,1.12,z+d/2+.08,1.15,2.23,.16,'#62452f','timber');
    windowAt(x-w*.30,h*.58,z+d/2+.07);windowAt(x+w*.30,h*.58,z+d/2+.07);
    const sx=x-Math.sign(x||1)*(w/2+.05);
    box(sx,1.85,z,.18,1.3,1.1,wood);box(sx-Math.sign(x||1)*.11,1.85,z,.08,.96,.8,'#eeb277');
  }
  houses.forEach((a,i)=>home(...a,i));
  // Forge hearth, iron anvil and a striped market awning.
  box(6.1,.48,-2,1.35,.96,1.5,'#68665a','stone');solid(6.1,.48,-2,1.35,.96,1.5);
  box(6.1,1,-2,.98,.1,1.12,'#fe8d41');piece(cone,6.1,1.3,-2,.34,.68,.38,'#ffc17a');
  box(5.8,.48,-4.2,.83,.96,.8,wood,'timber');box(5.8,1.03,-4.2,1.35,.34,.49,'#444b4b');solid(5.8,.62,-4.2,1.35,1.25,.8);
  function stall(x,z){
    for(const s of [-1,1])for(const t of [-1,1])box(x+s*1.65,1.35,z+t*.92,.13,2.7,.13,wood);
    for(let i=0;i<9;i++)box(x-1.6+i*.4,2.68,z,.405,.12,2.6,i%2?'#ad694b':'#d2c4a2','plain',.11);
    box(x,1,z,3.4,.2,1.8,wood,'timber');solid(x,1.3,z,3.6,2.6,2.2);
    for(let i=0;i<27;i++)piece(sphere,x-1.4+rand()*2.8,1.22,z-.6+rand()*1.2,.15,.17,.15,i%2?'#aa623a':'#989249');
  }
  stall(-6,-6);stall(14,7);
  piece(cyl,-3,.56,1,1.17,1.12,1.17,stone,'stone');piece(cyl,-3,1.13,1,.86,.04,.86,'#373c36');
  solid(-3,.65,1,2.3,1.3,2.3);
  for(const s of [-1,1])box(-3+s,1.75,1,.15,2.4,.15,wood);
  box(-3,2.95,1,2.5,.2,.22,wood);box(-3,2.01,1,.045,1.7,.045,'#ae9573');
  box(-2,.96,14,.17,1.92,.18,wood);box(-2,1.65,14,1.55,.31,.17,'#94734c','timber',0,0,.09);solid(-2,1,14,.32,2,.3);
  function tower(x,z,r,height){
    piece(cyl,x,height/2,z,r,height,r,'#797a70','stone');piece(cyl,x,height-.28,z,r*1.1,.65,r*1.1,'#909183','stone');
    for(let k=0;k<10;k++){const a=k*Math.PI/5;box(x+Math.sin(a)*r,height+.3,z+Math.cos(a)*r,.58,.86,.6,'#828478','stone',0,a);}
    solid(x,height/2,z,r*1.9,height,r*1.9);
    for(let i=0;i<3;i++)box(x,height*.35+i*1.7,z+r*.98,.22,.82,.09,'#353c39');
  }
  tower(-20,-23,2.7,9);
  for(const x of [-16,0,16]){tower(x,-63,3,14+(x===0?4:0));piece(cone,x,17+(x===0?4:0),-63,4,7,4,'#424b4d');}
  box(0,5.8,-63,33,11.6,5,stone,'stone');
  for(let i=0;i<62;i++){const a=i*2.4,r=83+rand()*30,h=12+rand()*20;piece(sphere,Math.sin(a)*r,0,Math.cos(a)*r,14+rand()*10,h,18,'#797e72');}
  for(let i=0;i<400;i++){
    const x=rand()*130-65,z=rand()*128-64;if(Math.abs(x)<30&&Math.abs(z)<32)continue;
    if(Math.abs(x)<7&&z>0)continue;
    const h=3+rand()*6;piece(cyl,x,h*.22,z,.20,h*.44,.20,'#635140');
    for(let j=0;j<3;j++)piece(cone,x,h*(.43+j*.20),z,h*(.32-j*.061),h*(.67-j*.12),h*(.32-j*.061),['#3e5845','#4a6149','#52674b'][j]);
  }
  // A low split-rail fence marks the playable village boundary.
  for(const side of [-1,1]){
    for(let i=-32;i<=32;i+=4){
      box(i,.75,side*32,.24,1.5,.23,wood);box(side*32,.75,i,.23,1.5,.24,wood);
      if(i===32)continue;
      for(const y of [.45,1.04]){box(i+2,y,side*32,4,.15,.15,wood);box(side*32,y,i+2,.15,.15,4,wood);}
    }
    solid(0,2,side*32,64,4,.3);solid(side*32,2,0,.3,4,64);
  }
  // Small silhouettes break up the edge of the road and lead the eye to the forge.
  for(let i=0;i<1050;i++){
    const x=rand()*62-31,z=rand()*62-31;
    if(Math.abs(x)<4.3 || Math.abs(z-2)<4 || (Math.abs(x-1)<7.3 && Math.abs(z+3)<9))continue;
    const h=.12+rand()*.27;piece(cone,x,h/2,z,.12,h,.15,i%2?'#87874e':'#797b42');
    if(i%8===0)piece(sphere,x,h,z,.085,.06,.085,'#d8bd73');
  }
  for(const [x,z] of [[-6,10],[7,13],[6,-6],[-7,-10],[4,6]]){
    piece(cyl,x,.53,z,.46,1.06,.46,'#826044','timber');
    for(const y of [.2,.83])piece(cyl,x,y,z,.475,.09,.475,'#464b43');
    solid(x,.55,z,.93,1.1,.93);
  }
  // Flatten static pieces into material batches to keep draw calls bounded.
  const group=new T.Group();
  for(const [mat,parts] of batches){
    const geometries=parts.map(({shape,matrix})=>{
      const g=shape.index?shape.toNonIndexed():shape.clone();g.applyMatrix4(matrix);return g;
    });
    const merged=mergeGeometries(geometries);const mesh=new T.Mesh(merged,mat);
    mesh.castShadow=mat.map?.repeat.x!==65;mesh.receiveShadow=true;group.add(mesh);geometries.forEach(g=>g.dispose());
  }
  return {group,walls};
}
