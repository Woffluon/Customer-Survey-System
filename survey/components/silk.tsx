'use client';

import { useEffect, useRef } from 'react';
import type { OGLRenderingContext } from 'ogl';

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
  className?: string;
}

function hexToNormalizedRGB(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
}

const VERT = /* glsl */ `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

export default function Silk({
  speed = 0.5,
  scale = 1,
  color = '#7B7481',
  noiseIntensity = 1.5,
  rotation = 0,
  className,
}: SilkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: InstanceType<typeof import('ogl').Renderer>;
    let gl: OGLRenderingContext;
    let program: InstanceType<typeof import('ogl').Program>;
    let mesh: InstanceType<typeof import('ogl').Mesh>;
    const startTime = performance.now();
    const [r, g, b] = hexToNormalizedRGB(color);

    import('ogl').then(({ Renderer, Program, Mesh, Triangle }) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer = new Renderer({ canvas, alpha: false, antialias: true, dpr });
      gl = renderer.gl;
      gl.clearColor(r, g, b, 1);

      const resize = () => {
        const parent = canvas.parentElement;
        const width = parent ? parent.clientWidth : window.innerWidth;
        const height = parent ? parent.clientHeight : window.innerHeight;

        renderer.setSize(width, height);
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      };

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime:           { value: 0 },
          uSpeed:          { value: speed },
          uScale:          { value: scale },
          uColor:          { value: [r, g, b] },
          uNoiseIntensity: { value: noiseIntensity },
          uRotation:       { value: rotation },
        },
      });

      resize();

      const parent = canvas.parentElement;
      const ro = new ResizeObserver(resize);
      if (parent) {
        ro.observe(parent);
      } else {
        window.addEventListener('resize', resize);
      }

      const geo = new Triangle(gl);
      mesh = new Mesh(gl, { geometry: geo, program });

      const loop = (now: number) => {
        rafRef.current = requestAnimationFrame(loop);
        const delta = (now - startTime) * 0.0004;
        program.uniforms.uTime.value = delta;
        renderer.render({ scene: mesh });
      };

      rafRef.current = requestAnimationFrame(loop);

      return () => {
        ro.disconnect();
        window.removeEventListener('resize', resize);
      };
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [speed, scale, color, noiseIntensity, rotation]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: 'block', width: '100%', height: '100%', position: 'absolute', inset: 0 }}
    />
  );
}



