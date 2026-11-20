import React,{useEffect,useMemo,useRef,useState,Suspense} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {Physics,RigidBody,CapsuleCollider,CuboidCollider,useRapier,useBeforePhysicsStep} from '@react-three/rapier';
import * as T from 'three';
import Character from './Character';
import {useGame} from './state';
import {closestPlace} from './layout';
import {buildVillage} from './world';
function Sky(){
  return <mesh frustumCulled={false}><sphereGeometry args={[195,42,24]}/><shaderMaterial side={T.BackSide} depthWrite={false}
    vertexShader={'varying vec3 dir;void main(){dir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}'}
    fragmentShader={`varying vec3 dir;
    void main(){vec3 d=normalize(dir);float h=max(0.,d.y);
    vec3 sun=normalize(vec3(-.53,.19,-.82));float s=max(0.,dot(d,sun));
    vec3 col=mix(vec3(.91,.72,.54),vec3(.34,.52,.59),smoothstep(0.,.62,h));
    col+=vec3(.22,.115,.035)*pow(s,12.)+vec3(.36,.24,.12)*smoothstep(.9985,.9999,s);
    gl_FragColor=vec4(col,1.);}`}/></mesh>;
}
function Walker({walls}){
  const body=useRef(), keys=useRef(new Set()),jump=useRef(false);
  const orbit=useRef({yaw:0,pitch:.29,distance:5}),motion=useRef({speed:0,air:false,face:0});
  const {camera,gl}=useThree(),{rapier,world}=useRapier();
  const cam=useMemo(()=>({target:new T.Vector3(),direction:new T.Vector3(),dest:new T.Vector3(),ray:new T.Ray(),hit:new T.Vector3(),initial:true}),[]);
  const bounds=useMemo(()=>walls.map(({x,y,z,w,h,d})=>new T.Box3(new T.Vector3(x-w/2-.18,y-h/2-.18,z-d/2-.18),new T.Vector3(x+w/2+.18,y+h/2+.18,z+d/2+.18))),[walls]);
  const run=useGame(s=>s.run);
  useEffect(()=>{
    body.current.setTranslation({x:0,y:.9,z:19},true);body.current.setLinvel({x:0,y:0,z:0},true);
    orbit.current={yaw:0,pitch:.29,distance:5};cam.initial=true;motion.current.face=0;
  },[run,cam]);
  useEffect(()=>{
    useGame.setState({ready:true});
    const canvas=gl.domElement;let dragging=false;
    const clear=()=>{keys.current.clear();jump.current=false;dragging=false;};
    const pause=()=>{clear();if(useGame.getState().screen==='play')useGame.getState().show('pause');};
    const down=e=>{
      const s=useGame.getState();
      if(e.code==='Escape'&&!e.repeat){if(s.screen==='play')s.show('pause');else if(['reading','pause'].includes(s.screen))s.show('play');return;}
      if(s.screen!=='play')return;
      if(['KeyW','KeyA','KeyS','KeyD','Space','ShiftLeft','ShiftRight','KeyE'].includes(e.code)){
        e.preventDefault();keys.current.add(e.code);
        if(!e.repeat&&e.code==='Space')jump.current=true;
        if(!e.repeat&&e.code==='KeyE')s.inspect();
      }
    };
    const up=e=>keys.current.delete(e.code);
    const start=e=>{if(useGame.getState().screen==='play'){dragging=true;canvas.setPointerCapture(e.pointerId);}};
    const stop=()=>{dragging=false;};
    const move=e=>{if(!dragging||useGame.getState().screen!=='play')return;
      orbit.current.yaw-=e.movementX*.005;orbit.current.pitch=T.MathUtils.clamp(orbit.current.pitch+e.movementY*.004,-.05,.92);};
    const zoom=e=>{if(useGame.getState().screen==='play'){e.preventDefault();orbit.current.distance=T.MathUtils.clamp(orbit.current.distance+e.deltaY*.008,2.4,8);}};
    const sub=useGame.subscribe((s,old)=>{if(s.screen!==old.screen)clear();});
    window.addEventListener('keydown',down);window.addEventListener('keyup',up);window.addEventListener('blur',pause);
    canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);canvas.addEventListener('lostpointercapture',stop);canvas.addEventListener('wheel',zoom,{passive:false});
    return ()=>{sub();window.removeEventListener('keydown',down);window.removeEventListener('keyup',up);window.removeEventListener('blur',pause);
      canvas.removeEventListener('pointerdown',start);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('lostpointercapture',stop);canvas.removeEventListener('wheel',zoom);};
  },[gl]);
  useBeforePhysicsStep(()=>{
    const rb=body.current;if(!rb)return;
    const pos=rb.translation(),active=useGame.getState().screen==='play',k=keys.current,yaw=orbit.current.yaw;
    let forward=Number(k.has('KeyW'))-Number(k.has('KeyS')),side=Number(k.has('KeyD'))-Number(k.has('KeyA'));
    const magnitude=Math.hypot(forward,side),speed=active&&magnitude?(k.has('ShiftLeft')||k.has('ShiftRight')?6:3.2):0;
    const vx=(side*Math.cos(yaw)-forward*Math.sin(yaw))*speed/(magnitude||1),vz=(-forward*Math.cos(yaw)-side*Math.sin(yaw))*speed/(magnitude||1);
    const ground=world.castRay(new rapier.Ray(pos,{x:0,y:-1,z:0}),.96,true,undefined,undefined,undefined,rb);
    rb.setLinvel({x:vx,y:active&&jump.current&&ground?5.2:rb.linvel().y,z:vz},true);jump.current=false;
    motion.current.speed=speed;motion.current.air=!ground;
    if(speed){const target=Math.atan2(-vx,-vz),diff=target-motion.current.face;motion.current.face+=.28*Math.atan2(Math.sin(diff),Math.cos(diff));}
    if(active){const near=closestPlace(pos.x,pos.z);if(near!==useGame.getState().near)useGame.getState().setNear(near);}
  });
  useFrame(({clock},dt)=>{
    const screen=useGame.getState().screen;
    if(screen==='menu'||screen==='controls'){
      camera.position.set(18+Math.sin(clock.elapsedTime*.055)*2,10,29);camera.lookAt(0,3,-8);return;
    }
    const p=body.current?.translation();if(!p)return;
    const {yaw,pitch,distance}=orbit.current;
    cam.target.set(p.x,p.y+.63,p.z);cam.direction.set(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch));
    cam.ray.set(cam.target,cam.direction);let safe=distance;
    for(const b of bounds){if(cam.ray.intersectBox(b,cam.hit))safe=Math.min(safe,Math.max(.1,cam.hit.distanceTo(cam.target)-.12));}
    cam.dest.copy(cam.target).addScaledVector(cam.direction,safe);cam.dest.y=Math.max(.32,cam.dest.y);
    if(cam.initial||safe<distance-.01)camera.position.copy(cam.dest);else camera.position.lerp(cam.dest,1-Math.exp(-14*Math.min(dt,.1)));
    cam.initial=false;camera.lookAt(cam.target);
  });
  return <RigidBody ref={body} position={[0,.9,19]} colliders={false} enabledRotations={[false,false,false]} canSleep={false} friction={0}>
    <CapsuleCollider args={[.56,.32]}/><Character motion={motion}/>
  </RigidBody>;
}
function Village(){
  const [{group,walls}]=useState(buildVillage);
  return <><primitive object={group}/><Physics gravity={[0,-15,0]}>
    <RigidBody type="fixed" colliders={false}><CuboidCollider args={[130,.4,130]} position={[0,-.4,0]}/>
      {walls.map(({x,y,z,w,h,d},i)=><CuboidCollider key={i} args={[w/2,h/2,d/2]} position={[x,y,z]}/>)}
    </RigidBody><Walker walls={walls}/></Physics></>;
}
export default function Scene(){
  return <Canvas shadows dpr={[1,1.5]} camera={{fov:56,near:.08,far:230,position:[18,10,29]}} gl={{antialias:true,powerPreference:'high-performance'}}>
    <fog attach="fog" args={['#cbbda7',27,112]}/><Sky/>
    <hemisphereLight args={['#ffead3','#8a8262',1.65]}/>
    <directionalLight position={[-24,29,-23]} intensity={2.75} color="#ffd3a2" castShadow shadow-mapSize={[1024,1024]} shadow-camera-left={-39} shadow-camera-right={39} shadow-camera-top={39} shadow-camera-bottom={-39} shadow-camera-far={115} shadow-normalBias={.045}/>
    <Suspense fallback={null}><Village/></Suspense>
  </Canvas>;
}
