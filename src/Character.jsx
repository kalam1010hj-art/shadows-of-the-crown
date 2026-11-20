import React,{useRef} from 'react';
import {useFrame} from '@react-three/fiber';
function Part({at,size,color,round=false,angle=0}){
  return <mesh position={at} scale={size} rotation-z={angle} castShadow>
    {round?<sphereGeometry args={[1,12,8]}/>:<boxGeometry/>}
    <meshStandardMaterial color={color} roughness={.94}/>
  </mesh>;
}
export default function Character({motion}){
  const hips=useRef(),legs=useRef([]),arms=useRef([]),phase=useRef(0);
  useFrame((_,dt)=>{
    const {speed,air,face}=motion.current;phase.current+=dt*Math.max(1.7,speed*2.7);
    const stride=Math.sin(phase.current)*Math.min(1,speed/3)*.7;
    hips.current.rotation.y=face;
    hips.current.position.y=-.88+Math.abs(stride)*.045;
    for(let i=0;i<2;i++){
      const sign=i?1:-1; legs.current[i].rotation.x=air?sign*.34:sign*stride;
      arms.current[i].rotation.x=air?-.53:-sign*stride*.83+Math.sin(phase.current)*.035;
    }
  });
  return <group ref={hips}>
    {[0,1].map(i=><group key={i} ref={el=>legs.current[i]=el} position={[(i-.5)*.25,.84,0]}>
      <Part at={[0,-.24,0]} size={[.122,.28,.13]} color="#49493e" round/>
      <Part at={[0,-.59,0]} size={[.107,.23,.11]} color="#463629" round/>
      <Part at={[0,-.76,-.05]} size={[.20,.15,.31]} color="#392d23"/>
    </group>)}
    <Part at={[0,1.08,0]} size={[.315,.34,.20]} color="#53685e" round/>
    <Part at={[0,.93,0]} size={[.59,.08,.36]} color="#654d32"/>
    <Part at={[0,.93,-.197]} size={[.09,.075,.035]} color="#b49b62"/>
    <Part at={[0,1.54,0]} size={[.165,.215,.158]} color="#c69671" round/>
    <Part at={[0,1.65,.027]} size={[.177,.15,.169]} color="#483c32" round/>
    <Part at={[0,1.55,-.15]} size={[.05,.07,.055]} color="#bf8b67"/>
    <Part at={[0,1.32,0]} size={[.32,.10,.21]} color="#776649" round/>
    <Part at={[.08,1.14,.153]} size={[.08,.42,.06]} color="#916e47" angle={-.56}/>
    <Part at={[.14,1.02,.196]} size={[.21,.19,.11]} color="#644f36"/>
    {[0,1].map(i=><group key={i} ref={el=>arms.current[i]=el} position={[(i-.5)*.65,1.28,0]}>
      <Part at={[0,-.12,0]} size={[.11,.19,.115]} color="#52645a" round/>
      <Part at={[0,-.35,0]} size={[.077,.15,.08]} color="#bb916d" round/>
      <Part at={[0,-.46,0]} size={[.084,.085,.08]} color="#bf9371" round/>
    </group>)}
  </group>;
}
