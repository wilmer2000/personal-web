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
    this.render(0);
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

    if (!this.gl) return;

    const vsSource = `
      attribute vec4 position;
      void main() { gl_Position = position; }
    `;
    const fsSource = `
      precision highp float;
      uniform float iTime;
      uniform vec2 iResolution;

      void main() {
        vec2 uv = (gl_FragCoord.xy * 2.0 - iResolution.xy) / min(iResolution.y, iResolution.x);
        vec3 finalColor = vec3(0.0);
        for(float i = 0.0; i < 3.0; i++) {
          float wave = sin(uv.x * (1.2 + i * 0.1) + iTime + i * 0.8) * 0.2;
          wave += sin(uv.x * 2.0 - iTime * 0.4) * 0.05; 
          vec3 spectralColor = vec3(0.4 + 0.1 * i, 0.2, 0.9);
          float dist = abs(uv.y + wave);
          float glow = 0.015 / (dist + 0.04); 
          float core = smoothstep(0.15, 0.0, dist) * 0.5;
          finalColor += spectralColor * (glow + core);
        }
        float vignette = smoothstep(1.5, 0.3, length(uv));
        float noise = fract(sin(dot(uv, vec2(12.9898, 78.233))) * 43758.5453) * 0.04;
        gl_FragColor = vec4((finalColor + noise) * vignette, 1.0);
      }
    `;

    this.program = this.createProgram(this.gl, vsSource, fsSource);
    this.setupBuffers();
  }

  private createProgram(gl: WebGLRenderingContext, vs: string, fs: string): WebGLProgram {
    const loadShader = (type: number, source: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, loadShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, loadShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    return program;
  }

  private setupBuffers() {
    const gl = this.gl!;
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posAttrib = gl.getAttribLocation(this.program, 'position');
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);
  }

  private render = (time: number) => {
    if (!this.gl) return;
    const element = this.canvasRef() as ElementRef<HTMLCanvasElement>;
    const canvas = element.nativeElement;

    if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      this.gl.viewport(0, 0, canvas.width, canvas.height);
    }

    this.gl.useProgram(this.program);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program, 'iTime'), time * 0.001);
    this.gl.uniform2f(
      this.gl.getUniformLocation(this.program, 'iResolution'),
      canvas.width,
      canvas.height,
    );

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.animationFrameId = requestAnimationFrame(this.render);
  };
}
