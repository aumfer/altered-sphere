customElements.define('web-gl', class extends HTMLElement {
    constructor() {
        super();
        this.addEventListener('load', ()=>{console.log('hi gl')})
    }
    connectedCallback() {
        const gl = this.closest('canvas').getContext('webgl')
        this.gl = gl

        //console.log(this.getAttributeNames().join(' '))
        //this.bind = Promise.resolve()

        if (this.hasAttribute('texture')) {
            this.texture = gl.createTexture()

            const target = this.getAttribute('target') || 'TEXTURE_2D'
            this.target = target

            if (this.hasAttribute('unit')) {
                const textureUnit = Number.parseInt(this.getAttribute('unit') || '0')
                this.activeTexture = textureUnit
            } else {
                this.activeTexture = 0
            }

            /*this.bind = this.bind.then((function bindTexture() {
                gl.activeTexture(gl.TEXTURE0 + this.activeTexture)
                gl.bindTexture(gl[this.target], this.texture)
            }).bind(this))*/
            this.addEventListener('gl-bind', (function bindTexture() {
                gl.activeTexture(gl.TEXTURE0 + this.activeTexture)
                gl.bindTexture(gl[this.target], this.texture)
            }).bind(this))
            this.dispatchEvent(new Event('gl-bind'))

            if (this.hasAttribute('texture-wrap-s')) {
                gl.texParameteri(gl[target], gl.TEXTURE_WRAP_S, gl[this.getAttribute('texture-wrap-s')]);
            }
            if (this.hasAttribute('texture-wrap-t')) {
                gl.texParameteri(gl[target], gl.TEXTURE_WRAP_T, gl[this.getAttribute('texture-wrap-t')]);
            }
            if (this.hasAttribute('texture-min-filter')) {
                gl.texParameteri(gl[target], gl.TEXTURE_MIN_FILTER, gl[this.getAttribute('texture-min-filter')]);
            }
            if (this.hasAttribute('texture-mag-filter')) {
                gl.texParameteri(gl[target], gl.TEXTURE_MAG_FILTER, gl[this.getAttribute('texture-mag-filter')]);
            }

            const textureA = this.getAttribute('texture')
            if (textureA) {
                const textureE = document.querySelector(textureA)
                if (!textureE) throw `no texture data ${textureA}`
                
                const width = Number.parseInt(this.getAttribute('width') || '4096')
                const height = Number.parseInt(this.getAttribute('height') || '4096')
    
                // todo
                const str = textureE.innerHTML
                const arr = str.split(/\s+/) // todo fixme
                let data = Uint8Array.from(arr.filter(s=>s.length).map(function parseFloat(s) {
                    return Number.parseInt(s)
                }))
                gl.texImage2D(gl[this.target], 0,
                    gl.RGBA,
                    width,
                    height,
                    0,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    data)
            }
        }
        if (this.hasAttribute('image')) {
            const width = Number.parseInt(this.getAttribute('width') || '4096')
            const height = Number.parseInt(this.getAttribute('height') || '4096')

            // todo
            gl.texImage2D(gl[this.target], 0,
                gl.RGBA,
                width,
                height,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null)

                function upload (image) {
                    if (!image.complete) throw 'incomplete image'
                    this.dispatchEvent(new Event('gl-bind'))
                    const i = Number.parseInt(image.getAttribute('i') || '0')
                    const j = Number.parseInt(image.getAttribute('j') || '0')
                    gl.texSubImage2D(gl[this.target],
                        0,
                        i * image.width,
                        j * image.height,
                        gl.RGBA,
                        gl.UNSIGNED_BYTE,
                        image)
                }

            const imageSelector = this.getAttribute('image')
            if (imageSelector) {
                function uploadImage(image) {
                    if (!image.complete) {
                        image.addEventListener('load', (function uploadImageAsync(e) {
                            upload.call(this,image);
                        }).bind(this))
                    } else {
                        upload.call(this,image);
                    }
                }
                const uploads = []
                document.querySelectorAll(imageSelector).forEach(i => uploads.push(new Promise(uploadImage.bind(this,i))))
                this.upload = Promise.all(uploads)
                if (!uploads.length) `no image ${imageSelector}`
                if (this.hasAttribute('generate-mipmap')) {
                    this.generateMipmap = this.upload.then((function generateMipmap() {
                        this.dispatchEvent(new Event('gl-bind'))
                        gl.generateMipmap(gl[this.target])
                    }).bind(this))
                }
            } else {
                // empty texture
            }
        }
        if (this.hasAttribute('video')) {
            const videoQuery = this.getAttribute('video')
            const video = document.querySelector(videoQuery)
            if (!video) throw `no video ${videoQuery}`
            this.video = video
            this.complete = true
        }
        if (this.hasAttribute('shader')) {
            const type = this.getAttribute('type')
            const shader = gl.createShader(gl[type])
            this.shader = shader

            const srcs = []
            let i = 0;
            while (this.hasAttribute(`${i}`)) {
                srcs.push(this.getAttribute(`${i}`))
                ++i;
            }
            if (this.hasAttribute('src')) {
                srcs.push(this.getAttribute('src'))
            }
            this.compile = Promise.all(['precision mediump float;\r\n',
                ...srcs.map(src => new Promise((function fetchShader(onfetch) {
                const fetch = new XMLHttpRequest()
                fetch.open('GET', src)
                
                fetch.addEventListener('readystatechange', (function _compileShader(e) {
                    if (fetch.readyState == XMLHttpRequest.DONE) {
                        onfetch(fetch.responseText)
                    }
                }).bind(this))
                fetch.send()
            }).bind(this))),
            document.querySelector(this.getAttribute('shader')).innerHTML,
            Promise.resolve(this.textContent)]).then((function compileShader(srcs) {
                const src = srcs.join('\r\n')
                gl.shaderSource(shader, src)
                gl.compileShader(shader)
                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    const errLog = gl.getShaderInfoLog(shader);
                    console.log(errLog || 'shader compile error');
                    console.log(srcs)
                } else {
                    this.complete = true
                }
                return shader
            }).bind(this))
            
        }
        if (this.hasAttribute('buffer')) {
            const buffer = gl.createBuffer()
            this.buffer = buffer

            const target = this.getAttribute('target')
            this.target = target

            this.addEventListener('gl-bind', (function bindBuffer() {
                gl.bindBuffer(gl[this.target], this.buffer)
            }).bind(this))
            
            const sourceQuery = this.getAttribute('buffer')
            const sourceElement = document.querySelector(sourceQuery)
            if (!sourceElement) throw `no buffer ${sourceQuery}`

            //upload
            function uploadBuffer(str) {
                this.dispatchEvent(new Event('gl-bind'))
                const arr = str.split(/\s+/) // todo fixme
                let data
                if (this.hasAttribute('Uint16Array')) {
                    data = Uint16Array.from(arr.filter(s=>s.length).map(function parseFloat(s) {
                        return Number.parseInt(s)
                    }))
                } else {
                    data = Float32Array.from(arr.filter(s=>s.length).map(function parseFloat(s) {
                        return Number.parseFloat(s)
                    }))
                }
                //const data = Float32Array.from([-1,+1,0, -1,-1,0, +1,+1,0, +1,-1,0])
                const usage = this.getAttribute('usage')
                gl.bufferData(gl[target], data, gl[usage]);
                //new TextDecoder().decode()
            }
            if (this.hasAttribute('src')) {
                const src = this.getAttribute('src')
                const fetch = new XMLHttpRequest()
                fetch.open('GET', src)
                
                fetch.addEventListener('readystatechange', (function _compileShader(e) {
                    if (fetch.readyState == XMLHttpRequest.DONE) {
                        uploadBuffer.call(this, fetch.responseText)
                    }
                }).bind(this))
                fetch.send()
            } else {
                uploadBuffer.call(this, sourceElement.innerHTML)
            }
        }
        if (this.hasAttribute('program')) {
            const program = gl.createProgram()
            this.program = program

            //
            const vertexShaderA = this.getAttribute('vertex-shader')||'[shader][type=VERTEX_SHADER]'
            const vertexShader = document.querySelector(vertexShaderA)
            const fragmentShaderA = this.getAttribute('fragment-shader')||'[shader][type=FRAGMENT_SHADER]'
            const fragmentShader = document.querySelector(fragmentShaderA)

            this.link = Promise.all([
                vertexShader.compile,
                fragmentShader.compile
            ]).then((function linkProgram(shaders) {
                this.shaders = shaders
                shaders.forEach(function attachShader(shader) {
                    gl.attachShader(program, shader);
                })
                gl.linkProgram(program);
                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    const linkErrLog = gl.getProgramInfoLog(program);
                    console.log(linkErrLog || 'link error');
                } else {
                    this.complete = true;
                    this.addEventListener('gl-bind', (function bindProgram() {
                        gl.useProgram(this.program)
                    }).bind(this))
                }
                return program;
            }).bind(this))
        }
        if (this.hasAttribute('draw')) {
            this.closest('[program]').link.then((function enableDraw(program) {
                if (this.hasAttribute('elements')) {
                    const elementsA = this.getAttribute('elements')
                    const elementsE = document.querySelector(elementsA)
                    if (!elementsE) throw `no elements ${elementsA}`

                    this.addEventListener('gl-bind', (function bindIndex() {
                        elementsE.dispatchEvent(new Event('gl-bind'))
                    }).bind(this))
                }
                this.complete = true
            }).bind(this))
        }
        if (this.hasAttribute('vertex')) {
            this.closest('[program]').link.then((function enableVertex(program) {
                this.program = program

                const vertexA = this.getAttribute('vertex')
                const vertex = document.querySelector(vertexA)
                if (!vertex) throw `no vertex ${vertexA}`
    
                const name = this.getAttribute('name')
                const index = gl.getAttribLocation(program, name)
                
        
                const type = this.getAttribute('type')
                const count = Number.parseInt(this.getAttribute('count'));
                
                
                this.addEventListener('gl-bind', (function bindVertex() {
                    vertex.dispatchEvent(new Event('gl-bind'))
                    gl.enableVertexAttribArray(index)
                    gl.vertexAttribPointer(index, count, gl[type], false, 0, 0)
                }).bind(this))
                this.complete = true
            }).bind(this))
        }
        if (this.hasAttribute('uniform') || this.hasAttribute('sampler')) {
            this.closest('[program]').link.then((function locateUniform(program) {
                const name = this.getAttribute('name')
                const location = gl.getUniformLocation(program, name)
                //if (location === null) throw `no location for uniform ${name}`
                this.location = location
                this.complete = true
            }).bind(this))
        }
        if (this.hasAttribute('framebuffer')) {
            this.framebuffer = gl.createFramebuffer()
            
            this.addEventListener('gl-bind', (function bindFramebuffer() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
            }).bind(this))
            this.dispatchEvent(new Event('gl-bind'))
            if (this.texture) {
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0+0, gl.TEXTURE_2D, this.texture, 0);    
            } else {
                throw `empty framebuffer unsupported`
            }
            //if (gl.checkFramebufferStatus(this.framebuffer) !== gl.FRAMEBUFFER_COMPLETE) throw `incomplete framebuffer`   
        }
        if (this.hasAttribute('default-framebuffer')) {
            this.addEventListener('gl-bind', (function bindDefaultFramebuffer() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, null)
            }).bind(this))
        }
        if (this.hasAttribute('bind-framebuffer')) {
            const framebufferQuery = this.getAttribute('bind-framebuffer')
            const framebufferE = document.querySelector(framebufferQuery)
            if (!framebufferE) throw `no framebuffer ${framebufferQuery}`
            this.addEventListener('gl-bind', (function bindDefaultFramebuffer() {
                gl.bindFramebuffer(gl.FRAMEBUFFER, framebufferE.framebuffer)
            }).bind(this))
        }

        this.count = 0
        this.time = Date.now()
        this.frametime = Number.NaN
        requestAnimationFrame(() => this.frame())
    }
    frame() {
        const gl = this.gl
        const now = Date.now()
        this.frametime = now-this.time
        this.time = now

        this.dispatchEvent(new Event('gl-bind'))

        if (this.hasAttribute('sampler') && this.complete) {
            const sourceA = this.getAttribute('source')
            const sourceElement = document.querySelector(sourceA)
            gl.uniform1i(this.location, sourceElement.activeTexture)
        }
        if (this.hasAttribute('uniform') && this.complete) {
            const {location} = this
            if (this.hasAttribute('1i')) {
                if (this.hasAttribute('prop')) {
                    const prop = this.getAttribute('prop')
                    const number = this[prop]
                    gl.uniform1i(location, number)
                } else { //'value'
                    const number = Number.parseInt(this.getAttribute('0'))
                    gl.uniform1i(location, number)
                }
                
            }
            if (this.hasAttribute('1f')) {
                const number = Number.parseFloat(this.getAttribute('0'))
                gl.uniform1f(location, number)
            }
            if (this.hasAttribute('2f')) {
                if (this.hasAttribute('value')) {
                    gl.uniform2f(location,
                        Number.parseFloat(this.getAttribute('0') || '0'),
                        Number.parseFloat(this.getAttribute('1') || '0')
                    )
                } else if (this.hasAttribute('source')) {
                    const source = document.querySelector(this.getAttribute('source'))
                    if (!source) throw `no 2f source ${this.getAttribute('source')}`
                    if (this.hasAttribute('prop')) {
                        gl.uniform2f(location,
                            Number.parseFloat(source[(this.getAttribute('0'))] || '0'),
                            Number.parseFloat(source[(this.getAttribute('1'))] || '0')
                            )
                    } else if (this.hasAttribute('attr')) {
                        gl.uniform2f(location,
                            Number.parseFloat(source.getAttribute(this.getAttribute('0')) || '0'),
                            Number.parseFloat(source.getAttribute(this.getAttribute('1')) || '0')
                            )
                    } else {
                        throw `specify 'attr' 'prop' or 'array' for 2f source ${this.getAttribute('source')}`
                    }
                }
            }
            if (this.hasAttribute('3f')) {
                if (this.hasAttribute('value')) {
                    gl.uniform3f(location,
                        Number.parseFloat(this.getAttribute('0') || '0'),
                        Number.parseFloat(this.getAttribute('1') || '0'),
                        Number.parseFloat(this.getAttribute('2') || '0')
                    )
                } else if (this.hasAttribute('source')) {
                    const source = document.querySelector(this.getAttribute('source'))
                    if (!source) throw `no 3f source ${this.getAttribute('source')}`
                    if (this.hasAttribute('prop')) {
                        gl.uniform3f(location,
                            Number.parseFloat(source[(this.getAttribute('0'))] || '0'),
                            Number.parseFloat(source[(this.getAttribute('1'))] || '0'),
                            Number.parseFloat(source[(this.getAttribute('2'))] || '0')
                            )
                    } else {
                        throw `specify 'attr' 'prop' or 'array' for 3f source ${this.getAttribute('source')}`
                    }
                }
            }
            if (this.hasAttribute('4f')) {
                if (this.hasAttribute('value')) {
                    gl.uniform4f(location,
                        Number.parseFloat(this.getAttribute('0') || '0'),
                        Number.parseFloat(this.getAttribute('1') || '0'),
                        Number.parseFloat(this.getAttribute('2') || '0'),
                        Number.parseFloat(this.getAttribute('3') || '0')
                    )
                } else if (this.hasAttribute('source')) {
                    const source = document.querySelector(this.getAttribute('source'))
                    if (!source) throw `no 4f source ${this.getAttribute('source')}`
                    if (this.hasAttribute('array')) {
                        gl.uniform4fv(location, source['array'])
                    } else if (this.hasAttribute('prop')) {
                        gl.uniform4f(location,
                            Number.parseFloat(source[(this.getAttribute('0'))] || '0'),
                            Number.parseFloat(source[(this.getAttribute('1'))] || '0'),
                            Number.parseFloat(source[(this.getAttribute('2'))] || '0'),
                            Number.parseFloat(source[(this.getAttribute('3'))] || '0')
                            )
                    } else if (this.hasAttribute('attr')) {
                        gl.uniform4f(location,
                            Number.parseFloat(source.getAttribute(this.getAttribute('0')) || '0'),
                            Number.parseFloat(source.getAttribute(this.getAttribute('1')) || '0'),
                            Number.parseFloat(source.getAttribute(this.getAttribute('2')) || '0'),
                            Number.parseFloat(source.getAttribute(this.getAttribute('3')) || '0')
                            )
                    } else {
                        throw `specify 'attr' 'prop' or 'array' for 4f source ${this.getAttribute('source')}`
                    }
                    
                    
                }
            }
            if (this.hasAttribute('9f')) {
                if (this.hasAttribute('value')) {
                    gl.uniformMatrix3fv(location, this.getAttribute('transpose'),
                        new Float32Array([
                            Number.parseFloat(this.getAttribute('0')),
                            Number.parseFloat(this.getAttribute('1')),
                            Number.parseFloat(this.getAttribute('2')),
                            Number.parseFloat(this.getAttribute('3')),
                            Number.parseFloat(this.getAttribute('4')),
                            Number.parseFloat(this.getAttribute('5')),
                            Number.parseFloat(this.getAttribute('6')),
                            Number.parseFloat(this.getAttribute('7')),
                            Number.parseFloat(this.getAttribute('8'))
                        ])
                    )
                } else if (this.hasAttribute('source')) {
                    const source = document.querySelector(this.getAttribute('source'))
                    if (!source) throw `no 3f source ${this.getAttribute('source')}`
                    gl.uniformMatrix3fv(location, this.getAttribute('transpose'),
                        new Float32Array([
                            Number.parseFloat(source[(this.getAttribute('0'))]),
                            Number.parseFloat(source[(this.getAttribute('1'))]),
                            Number.parseFloat(source[(this.getAttribute('2'))]),
                            Number.parseFloat(source[(this.getAttribute('3'))]),
                            Number.parseFloat(source[(this.getAttribute('4'))]),
                            Number.parseFloat(source[(this.getAttribute('5'))]),
                            Number.parseFloat(source[(this.getAttribute('6'))]),
                            Number.parseFloat(source[(this.getAttribute('7'))]),
                            Number.parseFloat(source[(this.getAttribute('8'))])
                        ])
                    )
                }
            }
            if (this.hasAttribute('16f')) {
                if (this.hasAttribute('source')) {
                    const source = document.querySelector(this.getAttribute('source'))
                    if (this.hasAttribute('array')) {
                        gl.uniformMatrix4fv(location, this.hasAttribute('transpose'), source['array'])
                    } else {
                        const str = source.textContent
                        const arr = str.split(/\s+/) // todo fixme
                        const data = Float32Array.from(arr.filter(s=>s.length).map(function parseFloat(s) {
                            return Number.parseFloat(s)
                        }))
                        gl.uniformMatrix4fv(location, this.hasAttribute('transpose'), data)
                    }
                    
                }
            }
            
        }
        if (this.hasAttribute('video') && this.complete) {
            if (!this.video.paused) { // todo requestVideoFrameCallback
                gl.texImage2D(gl[this.target], 0,
                    gl.RGBA,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    this.video)
            }
        }
        if (this.hasAttribute('draw')) {
            //gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
            if (this.hasAttribute('elements')) {
                const mode = this.getAttribute('mode')
                const count = Number.parseInt(this.getAttribute('count'));
                const type = this.getAttribute('type')
                gl.drawElements(gl[mode], count, gl[type], 0);
            } else {
                const mode = this.getAttribute('mode')
                const count = Number.parseInt(this.getAttribute('count'));
                gl.drawArrays(gl[mode], 0, count)
            }
        }

        this.count = (this.count + 1) % 2;
        requestAnimationFrame(() => this.frame())
    }
})