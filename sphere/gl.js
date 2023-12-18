customElements.define('gl-texture', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        const binding = Number.parseInt(this.getAttribute('binding') || '0')
        this.binding = binding

        this.texture = gl.createTexture()
        this.bindTexture()

        if (this.hasAttribute('texture-wrap-s')) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl[this.getAttribute('texture-wrap-s')]);
        }
        if (this.hasAttribute('texture-wrap-t')) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl[this.getAttribute('texture-wrap-t')]);
        }
        if (this.hasAttribute('texture-min-filter')) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl[this.getAttribute('texture-min-filter')]);
        }
        if (this.hasAttribute('texture-mag-filter')) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl[this.getAttribute('texture-mag-filter')]);
        }

        requestAnimationFrame(() => this.ready())
    }
    bindTexture() {
        const gl = this.gl
        const binding = this.binding
        const texture = this.texture
        gl.activeTexture(gl.TEXTURE0 + binding);
        gl.bindTexture(gl.TEXTURE_2D, texture);
    }
    attributeChangedCallback(name, oldValue, newValue) {
        this.dispatchEvent(new Event(name))
    }
    ready() {
        requestAnimationFrame(() => this.frame())
    }
    frame() {
        const gl = this.gl

        this.bindTexture()

        requestAnimationFrame(() => this.frame())
    }
})

customElements.define('gl-texture-image', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        const texture = this.closest('gl-texture')
        this.texture = texture

        texture.bindTexture()
        // todo
        gl.texImage2D(gl.TEXTURE_2D, 0,
            gl.RGBA,
            4096,
            4096,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null)

        const imageSelector = this.getAttribute('image')
        let image = this.closest(imageSelector)
        if (this.hasAttribute('query')) {
            image = image.querySelector(this.getAttribute('query'))
        }
        
        image.querySelectorAll('img').forEach((image) => {
            if (image.complete) {
                this.upload(image);
            } else {
                image.addEventListener('load', (e) => {
                    this.upload(image);
                })
            }
        })
    }
    upload (image) {
        if (!image.complete) throw 'incomplete image'
        const gl = this.gl
        const texture = this.texture
        texture.bindTexture()
        const i = Number.parseInt(image.getAttribute('i') || '0')
        const j = Number.parseInt(image.getAttribute('j') || '0')
        gl.texSubImage2D(gl.TEXTURE_2D,
            0,
            i * image.width,
            j * image.height,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            image)
        //gl.bindTexture(gl.TEXTURE_2D, 0)
    }
})

customElements.define('gl-shader', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        const type = this.getAttribute('type')
        const shader = gl.createShader(gl[type])
        this.shader = shader

        gl.shaderSource(shader, this.innerHTML)
        gl.compileShader(shader)
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            const errLog = gl.getShaderInfoLog(shader);
            console.log(errLog || 'shader compile error');
        } else {
            this.dispatchEvent(new Event('compile-shader'))
        }
    }
})

customElements.define('gl-buffer', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        const buffer = gl.createBuffer()
        this.buffer = buffer

        const target = this.getAttribute('target')
        this.target = target
        gl.bindBuffer(gl[target], buffer);
        //const data = Float32Array.from(this.innerHTML.split(/s+/), parseFloat)
        const data = Float32Array.from([-1,+1,0, -1,-1,0, +1,+1,0, +1,-1,0])
        const usage = this.getAttribute('usage')
        gl.bufferData(gl[target], data, gl[usage]);
        //new TextDecoder().decode()

        requestAnimationFrame(() => this.ready())
    }
    ready() {
        requestAnimationFrame(() => this.frame())
    }
    frame() {
        const gl = this.gl
        const target = this.target
        const buffer = this.buffer
        gl.bindBuffer(gl[target], buffer)

        requestAnimationFrame(() => this.frame())
    }
})

customElements.define('gl-program', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        const program = gl.createProgram()
        this.program = program

        // todo
        const vs = document.querySelector('gl-shader[type=VERTEX_SHADER]').shader
        const fs = document.querySelector('gl-shader[type=FRAGMENT_SHADER').shader
        gl.attachShader(program, vs)
        gl.attachShader(program, fs)

        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            const linkErrLog = gl.getProgramInfoLog(program);
            console.log(linkErrLog || 'link error');
        }
        gl.useProgram(program)

        requestAnimationFrame(() => this.ready())
    }
    ready() {
        requestAnimationFrame(() => this.frame())
    }
    frame() {
        const gl = this.gl
        const program = this.program
        gl.useProgram(program)
        requestAnimationFrame(() => this.frame())
    }
})

customElements.define('gl-vertex-attrib', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        const program = this.closest('gl-program').program
        this.program = program

        const name = this.getAttribute('name')
        const index = gl.getAttribLocation(program, name)
        gl.enableVertexAttribArray(index)

        const type = this.getAttribute('type')
        const count = Number.parseInt(this.getAttribute('count'));
        gl.vertexAttribPointer(index, count, gl[type], false, 0, 0)
    }
})

customElements.define('gl-draw-arrays', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        requestAnimationFrame(() => this.ready())
    }
    ready (){
        requestAnimationFrame(() => this.frame())
    }
    frame() {
        const gl = this.gl

        const mode = this.getAttribute('mode')
        const count = Number.parseInt(this.getAttribute('count'));
        gl.drawArrays(gl[mode], 0, count)
        requestAnimationFrame(() => this.frame())
    }
})

customElements.define('gl-uniform-binding', class extends HTMLElement {
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        const program = this.closest('gl-program').program

        const name = this.getAttribute('name')
        const binding = Number.parseInt(this.getAttribute('binding'))

        const location = gl.getUniformLocation(program, name)
        this.location = location

        gl.uniform1i(location, binding)
    }
})