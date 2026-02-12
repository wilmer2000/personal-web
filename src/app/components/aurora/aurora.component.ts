import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'app-aurora',
  template: ` <canvas class="h-screen w-screen" #glCanvas></canvas> `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Aurora implements AfterViewInit, OnDestroy {
  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('glCanvas');

  private gl!: WebGLRenderingContext | null;
  private program!: WebGLProgram;
  private animationFrameId!: number;

  ngAfterViewInit(): void {
    this.initWebGL();
    this.animate(0);
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initWebGL() {
    const element = this.canvasRef() as ElementRef<HTMLCanvasElement>;
    const canvas = element.nativeElement;

    this.gl = canvas.getContext('webgl');
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }

    const vsSource = `
      attribute vec2 p;
      void main() { gl_Position = vec4(p, 0, 1); }
    `;
    const fsSource = `
      precision mediump float;
      uniform vec2 res;
      uniform float time;

      void main() {
        vec2 uv = gl_FragCoord.xy / res;
        float t = time * 0.3;
        float noise = sin(uv.x * 3.0 + t) + sin(uv.y * 2.0 + t * 0.5);
        vec3 blue = vec3(0.0, 0.1, 0.5);
        vec3 purple = vec3(0.4, 0.0, 0.8);
        vec3 magenta = vec3(0.9, 0.1, 0.6);
        vec3 spectral = mix(blue, purple, sin(t + uv.x) * 0.5 + 0.5);
        spectral = mix(spectral, magenta, noise * 0.3);
        float mask = pow(1.0 - uv.y, 1.5); 
        gl_FragColor = vec4(spectral * mask * 1.2, 1.0);
      }
    `;

    this.program = this.createProgram(this.gl, vsSource, fsSource);
    this.gl.useProgram(this.program);

    const buffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(
      this.gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      this.gl.STATIC_DRAW,
    );

    const pLoc = this.gl.getAttribLocation(this.program, 'p');
    this.gl.enableVertexAttribArray(pLoc);
    this.gl.vertexAttribPointer(pLoc, 2, this.gl.FLOAT, false, 0, 0);
  }

  private createProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
    const program = gl.createProgram()!;
    const addShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      gl.attachShader(program, s);
    };
    addShader(gl.VERTEX_SHADER, vs);
    addShader(gl.FRAGMENT_SHADER, fs);
    gl.linkProgram(program);
    return program;
  }
  private animate = (now: number) => {
    if (!this.gl) return;

    const element = this.canvasRef() as ElementRef<HTMLCanvasElement>;
    const canvas = element.nativeElement;

    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.gl.viewport(0, 0, canvas.width, canvas.height);
    }

    const resLoc = this.gl.getUniformLocation(this.program, 'res');
    const timeLoc = this.gl.getUniformLocation(this.program, 'time');

    this.gl.uniform2f(resLoc, canvas.width, canvas.height);
    this.gl.uniform1f(timeLoc, now * 0.001);

    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
