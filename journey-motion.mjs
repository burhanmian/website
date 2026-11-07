// One reversible timeline owns reveal, locomotion and the camera handoff.
export const clamp = (v, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
export const ease = v => { const t = clamp(v); return t*t*(3-2*t); };
export const phase = (p, start, end) => ease((p-start)/(end-start));
// Measured from the grounded ankle travel in this model's original walk clip.
export const WALK_METRES_PER_SECOND = 0.64414;
export function journeyState(progress, routeLength, duration) {
  const p=clamp(progress), travel=phase(p,.34,.66), distance=travel*routeLength;
  return {
    solid:phase(p,.035,.22), turn:phase(p,.23,.34), travel, distance,
    walkTime:(distance/WALK_METRES_PER_SECOND)%duration,
    walkWeight:phase(travel,0,.06)*(1-phase(travel,.94,1)),
    type:phase(p,.865,.895), pov:phase(p,.90,.985), screen:phase(p,.97,1),
    phase:p<.22?'hologram':p<.34?'turn':p<.66?'walk':p<.865?'ground':p<.90?'type':p<.985?'pov-transition':'pov'
  };
}
// Limit scroll catch-up so a fast wheel gesture cannot teleport the actor.
export function advanceProgress(current, target, dt) {
  const step=(target-current)*(1-Math.exp(-dt*7));
  const seating=phase(current,.62,.66)*(1-phase(current,.90,.94));
  const rate=.13-.09*seating;
  return clamp(current+clamp(step,-dt*rate,dt*rate));
}

// Side entry: turn, sit into a stationary chair, swivel together, then roll in.
export function deskSeatState(p){
 const sit=phase(p,.695,.755),swivel=phase(p,.755,.815),roll=phase(p,.815,.865);
 return {sit,swivel,roll,chairZ:-.25-.55*roll,chairYaw:Math.PI/2*(1-swivel),
 personOffsetX:.45*sit,personOffsetZ:-.55*roll,personYaw:-Math.PI/2*(1+swivel),
 lean:.18*4*sit*(1-sit)+.025*sit};
}

// A pending reverse step must be free to turn away from the chair before moving.
export function leavingSeat(current,next){return current>=.66&&next<.66;}
export function blendAngle(from,to,weight){return from+Math.atan2(Math.sin(to-from),Math.cos(to-from))*clamp(weight);}
