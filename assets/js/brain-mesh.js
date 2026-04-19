(function () {
  const canvas = document.getElementById("brain-background");
  if (!canvas) return;

  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: true,
    depth: true,
    premultipliedAlpha: false,
  });
  if (!gl) return;

  const mouse = { x: 0, y: 0, active: false };
  let dpr = 1;
  let width = 0;
  let height = 0;
  let program = null;
  let mesh = null;
  let buffers = null;
  let renderQueued = false;
  let rafId = null;

  const vertexShaderSource = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;

    uniform vec2 uResolution;
    uniform vec2 uCenter;
    uniform vec2 uScale;

    varying vec3 vNormal;
    varying float vHeight;
    varying vec2 vBrainXY;
    varying vec3 vBrainXYZ;

    void main() {
      vec2 pixel = uCenter + vec2(aPosition.x * uScale.x, aPosition.y * uScale.y);
      vec2 clip = vec2(pixel.x / uResolution.x * 2.0 - 1.0, 1.0 - pixel.y / uResolution.y * 2.0);
      gl_Position = vec4(clip, -aPosition.z * 0.58, 1.0);
      vNormal = normalize(aNormal);
      vHeight = aPosition.z;
      vBrainXY = aPosition.xy;
      vBrainXYZ = aPosition;
    }
  `;

  const fragmentShaderSource = `
    precision highp float;

    uniform vec3 uBase;
    uniform vec3 uCrown;
    uniform vec3 uSulcus;
    uniform vec3 uLight;
    uniform vec2 uMouseBrain;
    uniform float uActivityActive;
    uniform float uActivityRadius;
    uniform float uTime;

    varying vec3 vNormal;
    varying float vHeight;
    varying vec2 vBrainXY;
    varying vec3 vBrainXYZ;

    float hash31(vec3 p) {
      p = fract(p * 0.1031);
      p += vec3(dot(p, p.yzx + 33.33));
      return fract((p.x + p.y) * p.z);
    }

    float valueNoise(vec3 p) {
      vec3 i = floor(p);
      vec3 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);

      float n000 = hash31(i + vec3(0.0, 0.0, 0.0));
      float n100 = hash31(i + vec3(1.0, 0.0, 0.0));
      float n010 = hash31(i + vec3(0.0, 1.0, 0.0));
      float n110 = hash31(i + vec3(1.0, 1.0, 0.0));
      float n001 = hash31(i + vec3(0.0, 0.0, 1.0));
      float n101 = hash31(i + vec3(1.0, 0.0, 1.0));
      float n011 = hash31(i + vec3(0.0, 1.0, 1.0));
      float n111 = hash31(i + vec3(1.0, 1.0, 1.0));

      float nx00 = mix(n000, n100, f.x);
      float nx10 = mix(n010, n110, f.x);
      float nx01 = mix(n001, n101, f.x);
      float nx11 = mix(n011, n111, f.x);
      float nxy0 = mix(nx00, nx10, f.y);
      float nxy1 = mix(nx01, nx11, f.y);
      return mix(nxy0, nxy1, f.z);
    }

    float activityField(vec3 p, float time) {
      vec3 q = vec3(p.x, p.y, p.z * 2.35);
      vec3 drift = vec3(sin(time * 0.24), cos(time * 0.19), sin(time * 0.21 + 1.4)) * 0.18;
      float n = valueNoise(q * 16.0 + drift);
      n += 0.5 * valueNoise(q * 34.0 - drift * 1.7 + vec3(4.1, -2.6, 1.8));
      n += 0.28 * valueNoise(q * 58.0 + drift.zxy * 1.2 + vec3(-8.0, 5.5, -3.3));
      n /= 1.76;

      float waves = 0.18 * sin(dot(q, vec3(22.1, -13.7, 15.9)) + time * 2.4);
      waves += 0.14 * sin(dot(q, vec3(-31.0, 18.3, -21.2)) - time * 2.05);
      return clamp((n - 0.5) * 2.35 + waves, -1.0, 1.0);
    }

    void main() {
      vec3 normal = normalize(vNormal);
      float diffuse = max(dot(normal, normalize(uLight)), 0.0);
      float facing = clamp(normal.z * 0.5 + 0.5, 0.0, 1.0);
      float highlight = smoothstep(0.18, 0.98, diffuse) * 0.18 + facing * 0.08;
      vec3 color = mix(uBase, uCrown, highlight);

      float wall = 1.0 - smoothstep(0.32, 0.86, facing);
      float groove = clamp(wall * 0.18, 0.0, 0.18);
      color = mix(color, uSulcus, groove);

      float shade = 0.91 + diffuse * 0.06 + facing * 0.03;
      color *= shade;

      float activity = activityField(vBrainXYZ, uTime);
      float mouseDistance = distance(vBrainXY, uMouseBrain);
      float activityMask = uActivityActive * exp(-(mouseDistance * mouseDistance) / (2.0 * uActivityRadius * uActivityRadius));
      activity = clamp(activity * activityMask, -1.0, 1.0);

      vec3 positive = vec3(0.86, 0.08, 0.04);
      vec3 negative = vec3(0.08, 0.18, 0.95);
      float magnitude = smoothstep(0.06, 0.72, abs(activity));
      vec3 activityColor = activity >= 0.0 ? positive : negative;
      color = mix(color, activityColor, magnitude * 0.66);

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  function isDark() {
    return document.documentElement.getAttribute("data-theme") === "dark";
  }

  function palette() {
    return isDark()
      ? {
          base: [0.1, 0.5, 0.56],
          crown: [0.22, 0.64, 0.66],
          sulcus: [0.05, 0.34, 0.4],
        }
      : {
          base: [0.0, 0.36, 0.42],
          crown: [0.04, 0.47, 0.5],
          sulcus: [0.0, 0.2, 0.29],
        };
  }

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
    }
    return shader;
  }

  function createProgram() {
    const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
    const nextProgram = gl.createProgram();
    gl.attachShader(nextProgram, vertexShader);
    gl.attachShader(nextProgram, fragmentShader);
    gl.linkProgram(nextProgram);
    if (!gl.getProgramParameter(nextProgram, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(nextProgram) || "Program link failed");
    }
    return nextProgram;
  }

  function brainLayout() {
    const mobile = width < 640;
    const size = mobile
      ? Math.min(width * 0.86, height * 0.52, 360)
      : Math.min(width * 0.58, height * 0.78, 720);

    return {
      cx: mobile ? width * 0.5 : width * 0.66,
      cy: mobile ? height * 0.3 : height * 0.39,
      sx: size * 0.9,
      sy: size,
    };
  }

  function createBuffer(target, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(target, buffer);
    gl.bufferData(target, data, gl.STATIC_DRAW);
    return buffer;
  }

  function uploadMesh(data) {
    const positionScale = data.quantization.positionScale;
    const normalScale = data.quantization.normalScale;
    const positions = new Float32Array(data.positions.length);
    const normals = new Float32Array(data.normals.length);
    const indices = new Uint16Array(data.indices);

    for (let i = 0; i < data.positions.length; i += 1) positions[i] = data.positions[i] / positionScale;
    for (let i = 0; i < data.normals.length; i += 1) normals[i] = data.normals[i] / normalScale;

    mesh = {
      indexCount: indices.length,
      stats: data.stats,
    };
    buffers = {
      position: createBuffer(gl.ARRAY_BUFFER, positions),
      normal: createBuffer(gl.ARRAY_BUFFER, normals),
      index: createBuffer(gl.ELEMENT_ARRAY_BUFFER, indices),
    };
  }

  function bindAttributes() {
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    const normalLocation = gl.getAttribLocation(program, "aNormal");

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normal);
    gl.enableVertexAttribArray(normalLocation);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.index);
  }

  function lightVector() {
    const mx = mouse.active ? mouse.x / Math.max(width, 1) - 0.5 : 0;
    const my = mouse.active ? mouse.y / Math.max(height, 1) - 0.5 : 0;
    const x = -0.3 + mx * 0.42;
    const y = -0.42 + my * 0.28;
    const z = 0.86;
    const len = Math.hypot(x, y, z) || 1;
    return [x / len, y / len, z / len];
  }

  function mouseBrain(layout) {
    return [(mouse.x - layout.cx) / layout.sx, (mouse.y - layout.cy) / layout.sy];
  }

  function render(time) {
    renderQueued = false;
    const seconds = (time || 0) * 0.001;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    if (!program || !buffers || !mesh) return;

    const layout = brainLayout();
    const colors = palette();
    const light = lightVector();
    const brain = mouseBrain(layout);

    gl.useProgram(program);
    bindAttributes();

    gl.uniform2f(gl.getUniformLocation(program, "uResolution"), width, height);
    gl.uniform2f(gl.getUniformLocation(program, "uCenter"), layout.cx, layout.cy);
    gl.uniform2f(gl.getUniformLocation(program, "uScale"), layout.sx, layout.sy);
    gl.uniform3fv(gl.getUniformLocation(program, "uBase"), colors.base);
    gl.uniform3fv(gl.getUniformLocation(program, "uCrown"), colors.crown);
    gl.uniform3fv(gl.getUniformLocation(program, "uSulcus"), colors.sulcus);
    gl.uniform3fv(gl.getUniformLocation(program, "uLight"), light);
    gl.uniform2f(gl.getUniformLocation(program, "uMouseBrain"), brain[0], brain[1]);
    gl.uniform1f(gl.getUniformLocation(program, "uActivityActive"), mouse.active ? 1 : 0);
    gl.uniform1f(gl.getUniformLocation(program, "uActivityRadius"), width < 640 ? 0.065 : 0.05);
    gl.uniform1f(gl.getUniformLocation(program, "uTime"), seconds);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);
    gl.disable(gl.CULL_FACE);
    gl.drawElements(gl.TRIANGLES, mesh.indexCount, gl.UNSIGNED_SHORT, 0);

    if (mouse.active) {
      scheduleRender();
    }
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    rafId = requestAnimationFrame(render);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    scheduleRender();
  }

  function loadMesh() {
    const scriptUrl = document.currentScript ? document.currentScript.src : window.location.href;
    const meshUrl = new URL("../json/brain-cortex-mesh.json", scriptUrl);

    fetch(meshUrl)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error("brain mesh unavailable"))))
      .then((data) => {
        if (!Array.isArray(data.positions) || !Array.isArray(data.normals) || !Array.isArray(data.indices)) return;
        uploadMesh(data);
        scheduleRender();
      })
      .catch(() => {});
  }

  try {
    program = createProgram();
  } catch (error) {
    return;
  }

  window.addEventListener("resize", resize, { passive: true });
  window.addEventListener(
    "pointermove",
    (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
      mouse.active = true;
      scheduleRender();
    },
    { passive: true }
  );
  window.addEventListener("pointerleave", () => {
    mouse.active = false;
    if (rafId) cancelAnimationFrame(rafId);
    renderQueued = false;
    scheduleRender();
  });

  const observer = new MutationObserver((mutations) => {
    if (mutations.some((mutation) => mutation.attributeName === "data-theme")) {
      scheduleRender();
    }
  });
  observer.observe(document.documentElement, { attributes: true });

  resize();
  loadMesh();
})();
