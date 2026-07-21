'use client'

import { useEffect, type RefObject } from 'react'

type GLContext = WebGLRenderingContext | WebGL2RenderingContext

const VERTEX_SRC = `
attribute vec2 aPosition;
varying vec2 vUv;
void main() {
    vUv = aPosition * 0.5 + 0.5;
    gl_Position = vec4(aPosition, 0.0, 1.0);
}
`

const FRAGMENT_SRC = `
precision highp float;
varying vec2 vUv;
uniform sampler2D uVideo;
uniform vec2 uResolution;
uniform vec2 uVideoResolution;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;
uniform float uStrength;
uniform float uAberration;

vec2 coverUv(vec2 uv) {
    float screenAspect = uResolution.x / uResolution.y;
    float videoAspect = uVideoResolution.x / uVideoResolution.y;
    vec2 ratio = vec2(
        min(screenAspect / videoAspect, 1.0),
        min(videoAspect / screenAspect, 1.0)
    );
    return vec2(
        uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        uv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );
}

void main() {
    vec2 uv = coverUv(vUv);

    vec2 delta = vUv - uMouse;
    delta.x *= uResolution.x / uResolution.y;
    float dist = length(delta);

    float radius = 0.32;
    float falloff = smoothstep(radius, 0.0, dist);

    vec2 dir = dist > 0.0001 ? delta / dist : vec2(0.0);
    vec2 displacement = (-dir * falloff * uStrength) + (uMouseVelocity * falloff * 0.8);

    vec2 distortedUv = uv + displacement;

    float aberr = uAberration * falloff;
    float r = texture2D(uVideo, distortedUv + vec2(aberr, 0.0)).r;
    float g = texture2D(uVideo, distortedUv).g;
    float b = texture2D(uVideo, distortedUv - vec2(aberr, 0.0)).b;

    gl_FragColor = vec4(r, g, b, 1.0);
}
`

function compileShader(gl: GLContext, type: number, source: string) {
    const shader = gl.createShader(type)
    if (!shader) return null
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        gl.deleteShader(shader)
        return null
    }
    return shader
}

function createProgram(gl: GLContext, vertexSrc: string, fragmentSrc: string) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSrc)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSrc)
    if (!vertexShader || !fragmentShader) return null

    const program = gl.createProgram()
    if (!program) return null
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        gl.deleteProgram(program)
        return null
    }
    return program
}

const MOUSE_SMOOTHING = 0.12
const STRENGTH = 0.055
const ABERRATION = 0.005
const OFFSCREEN = -10

export function useVideoDistortion(
    containerRef: RefObject<HTMLDivElement | null>,
    videoRef: RefObject<HTMLVideoElement | null>,
    canvasRef: RefObject<HTMLCanvasElement | null>,
    active: boolean,
    onReady: () => void,
) {
    useEffect(() => {
        if (!active) return

        const container = containerRef.current
        const video = videoRef.current
        const canvas = canvasRef.current
        if (!container || !video || !canvas) return

        const pointerTarget = container.parentElement ?? container

        const gl: GLContext | null = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
        if (!gl) return

        const program = createProgram(gl, VERTEX_SRC, FRAGMENT_SRC)
        if (!program) return

        const positionBuffer = gl.createBuffer()
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)

        const aPosition = gl.getAttribLocation(program, 'aPosition')
        const uVideo = gl.getUniformLocation(program, 'uVideo')
        const uResolution = gl.getUniformLocation(program, 'uResolution')
        const uVideoResolution = gl.getUniformLocation(program, 'uVideoResolution')
        const uMouse = gl.getUniformLocation(program, 'uMouse')
        const uMouseVelocity = gl.getUniformLocation(program, 'uMouseVelocity')
        const uStrength = gl.getUniformLocation(program, 'uStrength')
        const uAberration = gl.getUniformLocation(program, 'uAberration')

        const texture = gl.createTexture()
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)

        let width = 0
        let height = 0
        let rafId = 0
        let intersecting = true
        let readyFired = false

        const mouse = { x: 0.5, y: 0.5 }
        const smoothMouse = { x: 0.5, y: 0.5 }
        const prevSmooth = { x: 0.5, y: 0.5 }
        const velocity = { x: 0, y: 0 }

        const resize = () => {
            const rect = container.getBoundingClientRect()
            const dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = Math.max(1, Math.round(rect.width * dpr))
            height = Math.max(1, Math.round(rect.height * dpr))
            canvas.width = width
            canvas.height = height
            canvas.style.width = `${rect.width}px`
            canvas.style.height = `${rect.height}px`
        }

        resize()

        const handlePointerMove = (e: PointerEvent) => {
            const rect = pointerTarget.getBoundingClientRect()
            mouse.x = (e.clientX - rect.left) / rect.width
            mouse.y = 1 - (e.clientY - rect.top) / rect.height
        }

        const handlePointerLeave = () => {
            mouse.x = OFFSCREEN
            mouse.y = OFFSCREEN
        }

        const startLoop = () => {
            if (!rafId && intersecting && !document.hidden) {
                rafId = requestAnimationFrame(render)
            }
        }

        const stopLoop = () => {
            if (rafId) {
                cancelAnimationFrame(rafId)
                rafId = 0
            }
        }

        const handleVisibility = () => {
            if (document.hidden) stopLoop()
            else startLoop()
        }

        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(container)

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                intersecting = entry.isIntersecting
                if (intersecting) startLoop()
                else stopLoop()
            },
            { threshold: 0.01 },
        )
        intersectionObserver.observe(container)

        pointerTarget.addEventListener('pointermove', handlePointerMove)
        pointerTarget.addEventListener('pointerleave', handlePointerLeave)
        document.addEventListener('visibilitychange', handleVisibility)

        gl.useProgram(program)
        gl.enableVertexAttribArray(aPosition)

        const render = () => {
            if (video.readyState >= 2) {
                gl.bindTexture(gl.TEXTURE_2D, texture)
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)

                if (!readyFired) {
                    readyFired = true
                    onReady()
                }
            }

            smoothMouse.x += (mouse.x - smoothMouse.x) * MOUSE_SMOOTHING
            smoothMouse.y += (mouse.y - smoothMouse.y) * MOUSE_SMOOTHING
            velocity.x = (smoothMouse.x - prevSmooth.x) * 10
            velocity.y = (smoothMouse.y - prevSmooth.y) * 10
            prevSmooth.x = smoothMouse.x
            prevSmooth.y = smoothMouse.y

            gl.viewport(0, 0, width, height)
            gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
            gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0)

            gl.activeTexture(gl.TEXTURE0)
            gl.bindTexture(gl.TEXTURE_2D, texture)
            gl.uniform1i(uVideo, 0)
            gl.uniform2f(uResolution, width, height)
            gl.uniform2f(uVideoResolution, video.videoWidth || 1920, video.videoHeight || 1080)
            gl.uniform2f(uMouse, smoothMouse.x, smoothMouse.y)
            gl.uniform2f(uMouseVelocity, velocity.x, velocity.y)
            gl.uniform1f(uStrength, STRENGTH)
            gl.uniform1f(uAberration, ABERRATION)

            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)

            if (intersecting && !document.hidden) {
                rafId = requestAnimationFrame(render)
            } else {
                rafId = 0
            }
        }

        startLoop()

        return () => {
            stopLoop()
            resizeObserver.disconnect()
            intersectionObserver.disconnect()
            pointerTarget.removeEventListener('pointermove', handlePointerMove)
            pointerTarget.removeEventListener('pointerleave', handlePointerLeave)
            document.removeEventListener('visibilitychange', handleVisibility)
            gl.deleteTexture(texture)
            gl.deleteBuffer(positionBuffer)
            gl.deleteProgram(program)
        }
    }, [active, containerRef, videoRef, canvasRef, onReady])
}
