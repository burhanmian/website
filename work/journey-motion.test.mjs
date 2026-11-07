import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyState,advanceProgress,deskSeatState,leavingSeat,blendAngle,WALK_METRES_PER_SECOND} from '../journey-motion.mjs';
test('reveal and turn finish before walking; eye handoff follows arrival',()=>{
 const start=journeyState(0,2.7,4.2);assert.equal(start.solid,0);assert.equal(start.walkWeight,0);
 const turn=journeyState(.30,2.7,4.2);assert.equal(turn.solid,1);assert.equal(turn.distance,0);
 const walking=journeyState(.5,2.7,4.2);assert.equal(walking.turn,1);assert.equal(walking.pov,0);assert.ok(walking.walkWeight>.9);
 const pov=journeyState(1,2.7,4.2);assert.equal(pov.travel,1);assert.equal(pov.walkWeight,0);assert.equal(pov.pov,1);
});
test('pose time is determined by distance, independent of frame rate or direction',()=>{
 for(const p of [.36,.42,.55,.7]){const a=journeyState(p,2.7,4.2);assert.ok(Math.abs(a.walkTime-a.distance/WALK_METRES_PER_SECOND)<1e-9);assert.deepEqual(a,journeyState(p,2.7,4.2));}
 const forward=Array.from({length:101},(_,i)=>journeyState(i/100,2.7,4.2));const reverse=Array.from({length:101},(_,i)=>journeyState((100-i)/100,2.7,4.2)).reverse();assert.deepEqual(forward,reverse);
});
test('fast scrolling is bounded and never overshoots; stationary input remains still',()=>{
 assert.equal(advanceProgress(.5,.5,1/60),.5);
 assert.ok(advanceProgress(0,1,1/60)<=.13/60);
 assert.ok(advanceProgress(1,0,1/60)>=1-.13/60);
 for(const target of [0,.5,1]){let p=.25;for(let i=0;i<900;i++)p=advanceProgress(p,target,1/60);assert.ok(Math.abs(p-target)<1e-6);}
});

test('side-entry chair remains stationary until seated and swivels before rolling',()=>{
 const approach=deskSeatState(.69),seated=deskSeatState(.755),turned=deskSeatState(.815),done=deskSeatState(.865);
 assert.equal(approach.sit,0);assert.equal(approach.chairZ,-.25);
 assert.equal(seated.sit,1);assert.equal(seated.swivel,0);assert.equal(seated.chairZ,-.25);
 assert.equal(turned.swivel,1);assert.equal(turned.roll,0);assert.equal(turned.chairYaw,0);
 assert.ok(Math.abs(done.chairZ+.8)<1e-9);assert.equal(done.personOffsetX,.45);
 assert.equal(journeyState(.895,3,4.2).pov,0);
 for(let i=0;i<1000;i++){const a=deskSeatState(i/1000),b=deskSeatState((i+1)/1000);assert.ok(Math.abs(a.chairZ-b.chairZ)<.02);assert.ok(Math.abs(a.chairYaw-b.chairYaw)<.05);}
});
test('seating sequence catches up slowly in both directions',()=>{
 for(const direction of [-1,1]){const current=.80,next=advanceProgress(current,current+direction*.2,1/60);assert.ok(Math.abs(next-current)<=.04/60+1e-12);}
});

test('reverse departure can release chair-facing lock before first walking step',()=>{
 assert.equal(leavingSeat(.6601,.6599),true);
 assert.equal(leavingSeat(.8,.79),false);
 assert.equal(leavingSeat(.65,.64),false);
});
test('angle interpolation crosses wrap by the shortest path',()=>{
 const a=blendAngle(Math.PI-.1,-Math.PI+.1,.5);
 assert.ok(Math.abs(a-Math.PI)<1e-10);
 assert.equal(blendAngle(0,1,1),1);
});
test('progress rate has no discontinuity at chair entry or exit',()=>{
 for(const boundary of [.62,.66,.90,.94]){
  const a=advanceProgress(boundary-1e-6,1,1/60)-(boundary-1e-6);
  const b=advanceProgress(boundary+1e-6,1,1/60)-(boundary+1e-6);
  assert.ok(Math.abs(a-b)<1e-6);
 }
});
