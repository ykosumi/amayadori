import * as THREE from 'three';
// Chalk/crayon post-process: renders the 3D scene to a target, then wobbles the outline and knocks out grainy speckles,
// so flat-shaded 3D reads like crayon on paper. Deterministic: grain animates in steps (boil) from time t.
export function createChalk(renderer, W, H, { grain = 0.55, wobble = 0.0035, boilFps = 8, bg = 0x8fa3c8 } = {}) {
  const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1); const sc = new THREE.Scene();
  const mat = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false,
    uniforms: { tex: { value: rt.texture }, res: { value: new THREE.Vector2(W, H) }, step: { value: 0 }, grain: { value: grain }, wob: { value: wobble }, paper: { value: new THREE.Color(bg) }, opaque: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: `varying vec2 vUv; uniform sampler2D tex; uniform vec2 res; uniform float step, grain, wob, opaque; uniform vec3 paper;
      float h(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p.yx+19.19); return fract((p.x+p.y)*p.x); }
      float vn(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y); }
      void main(){
        vec2 px = vUv*res; float s = step;
        vec2 off = (vec2(vn(px*0.012+s*3.1), vn(px*0.012+17.+s*2.3))-.5)*2.*wob*res.y;  // low-freq outline wobble
        vec4 c = texture2D(tex, clamp(vUv+off/res,0.,1.));
        float fine = h(floor(px/1.6)+s*37.);                 // chalk grit
        float blot = vn(px*0.035+s*5.);                       // paper-tooth clumps
        float m = smoothstep(1.-grain*0.55, 1., fine*0.65+blot*0.5);
        float edge = 1.0;                                     // dropout everywhere, stronger on thin alpha edges
        c.rgb = mix(c.rgb, c.rgb*1.12+0.05, smoothstep(.55,.95,blot)*.35);   // lighter crayon pressure variation
        if(opaque>.5){ c.rgb = mix(c.rgb, paper, m*.7*c.a); c.a=1.; } else { c.a *= 1.-m*.75; }
        gl_FragColor = vec4(c.rgb, c.a); gl_FragColor = linearToOutputTexel(gl_FragColor);
      }`,
  });
  sc.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  return {
    render(scene, camera, t, { opaque = true } = {}) {
      mat.uniforms.step.value = Math.floor(t * boilFps); mat.uniforms.opaque.value = opaque ? 1 : 0;
      renderer.setRenderTarget(rt); renderer.clear(); renderer.render(scene, camera);
      renderer.setRenderTarget(null); renderer.clear(); renderer.render(sc, cam);
    },
    setPaper(c) { mat.uniforms.paper.value.set(c); },
  };
}
