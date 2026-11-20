import test from 'node:test';
import assert from 'node:assert/strict';
import {closestPlace,places,randomSource} from '../src/layout.js';
import {useGame} from '../src/state.js';
import {buildVillage} from '../src/world.js';
import RAPIER from '@dimforge/rapier3d-compat';

test('the opening road leads to three independent investigation prompts',()=>{
  assert.equal(closestPlace(0,19),null);
  for(const p of places)assert.equal(closestPlace(p.x,p.z),p);
  assert.equal(closestPlace(0,1).id,'well');
  assert.equal(closestPlace(4,-2).id,'forge');
});

test('only inspecting the forge completes the discovery and a fresh run clears it',()=>{
  const game=()=>useGame.getState();
  game().start();game().setNear(places[0]);game().inspect();
  assert.equal(game().reading.id,'sign');assert.equal(game().found,false);
  game().show('play');game().setNear(places[2]);game().inspect();
  assert.equal(game().screen,'reading');assert.equal(game().found,true);
  game().start();assert.equal(game().found,false);assert.equal(game().near,null);
});

test('scenery is deterministic',()=>{
  const a=randomSource(33),b=randomSource(33);
  assert.deepEqual(Array.from({length:24},a),Array.from({length:24},b));
});

test('production village geometry is finite and a walking capsule stops at the workshop wall',async()=>{
  // Geometry and physics run in Node. Substitute only the offscreen texture drawing surface.
  const brush={fillRect(){},beginPath(){},moveTo(){},lineTo(){},stroke(){}};
  globalThis.document={createElement:()=>({getContext:()=>brush})};
  const {group,walls}=buildVillage();delete globalThis.document;
  assert.ok(group.children.length>10);
  for(const mesh of group.children){
    mesh.geometry.computeBoundingSphere();assert.ok(Number.isFinite(mesh.geometry.boundingSphere.radius));
  }
  await RAPIER.init();
  const world=new RAPIER.World({x:0,y:-15,z:0});
  world.createCollider(RAPIER.ColliderDesc.cuboid(130,.4,130).setTranslation(0,-.4,0));
  for(const {x,y,z,w,h,d} of walls)world.createCollider(RAPIER.ColliderDesc.cuboid(w/2,h/2,d/2).setTranslation(x,y,z));
  const player=world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0,.9,-1).lockRotations());
  world.createCollider(RAPIER.ColliderDesc.capsule(.56,.32),player);
  for(let i=0;i<240;i++){player.setLinvel({x:6,y:player.linvel().y,z:0},true);world.step();}
  assert.ok(player.translation().x>5&&player.translation().x<6.26);
  assert.ok(Math.abs(player.translation().y-.88)<.04);
  player.setLinvel({x:0,y:5.2,z:0},true);
  for(let i=0;i<10;i++)world.step();
  assert.ok(player.translation().y>1.4);
  world.free();
});
