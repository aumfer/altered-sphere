customElements.define('three-js', class extends HTMLElement {
    connectedCallback() {
        this.scene = this.parentElement.scene
        this.renderer = this.parentElement.renderer
        if (!this.scene) {
            this.scene = new THREE.Scene()
            this.renderer = new THREE.WebGLRenderer({
                preserveDrawingBuffer: true
            })
            this.renderer.autoClear = false
            this.cameras = []
            this.appendChild(this.renderer.domElement)
            console.log(this.renderer.capabilities)
        }
        if (this.hasAttribute('perspective-camera')) {
            var fovA = this.getAttribute('fov')
            const fov = Number.parseFloat(fovA)
            var aspectA = this.getAttribute('aspect') || '1'
            const aspect = Number.parseFloat(aspectA)
            var zNearA = this.getAttribute('z-near')
            var zFarA = this.getAttribute('z-far')
            this.camera = new THREE.PerspectiveCamera(fov, aspect, 0.009, 12.9)
            this.object = this.camera
        }
        
        if (this.hasAttribute('buffer-geometry')) {
            this.geometry = new THREE.BufferGeometry()
        }
        if (this.hasAttribute('plane-geometry')) {
            const widthA = this.getAttribute('width') || '1'
            const width = Number.parseFloat(widthA)
            const heightA = this.getAttribute('height') || '1'
            const height = Number.parseFloat(heightA)
            this.geometry = new THREE.PlaneGeometry(width, height)
        }
        if (this.hasAttribute('sphere-geometry')) {
            const radiusA = this.getAttribute('radius') || '1'
            const radius = Number.parseFloat(radiusA)
            this.geometry = new THREE.SphereGeometry(radius)
        }
        if (this.hasAttribute('shader-material')) {
            const uniforms = {

                amplitude: { value: 5.0 },
                opacity: { value: 0.3 },

            };
            if (this.hasAttribute('terrarium')) {
                uniforms.terrarium = { value: 0 }
            }
            if (this.hasAttribute('color')) {
                uniforms.color = { value: new THREE.Color( this.getAttribute('color') ) }
            }
            this.material = new THREE.ShaderMaterial({
                uniforms,
               vertexShader:  document.querySelector(this.getAttribute('vertex-shader')).textContent,
               fragmentShader: document.querySelector(this.getAttribute('fragment-shader')).textContent
            }
            )
            
        }

        if (this.hasAttribute('buffer-attribute')) {
            
        }
        if (this.hasAttribute('texture')) {
            const gl = this.renderer.getContext()
            const texture = gl.createTexture()
            gl.bindTexture(gl['TEXTURE_2D'], texture)
            gl.texImage2D(gl['TEXTURE_2D'], 0,
                gl.RGBA,
                4096,
                4096,
                0,
                gl.RGBA,
                gl.UNSIGNED_BYTE,
                null)
            function     upload (image) {
                if (!image.complete) throw 'incomplete image'
                gl.bindTexture(gl['TEXTURE_2D'], texture)
                const i = Number.parseInt(image.getAttribute('i') || '0')
                const j = Number.parseInt(image.getAttribute('j') || '0')
                gl.texSubImage2D(gl['TEXTURE_2D'],
                    0,
                    i * image.width,
                    j * image.height,
                    gl.RGBA,
                    gl.UNSIGNED_BYTE,
                    image)
                //gl.bindTexture(gl.TEXTURE_2D, 0)
            }
            document.querySelectorAll(this.getAttribute('texture')).forEach((function textureImage(i) {
                if (!image.complete) {
                    image.addEventListener('load', (function uploadImageAsync(e) {
                        upload(image);
                    }).bind(this))
                } else {
                    upload(image);
                }
            }).bind(this))
        }

        if (this.hasAttribute('mesh')) {
            this.mesh = new THREE.Mesh(this.geometry, this.material)
            this.scene.add(this.mesh)
            this.object = this.mesh
        }
        if (this.hasAttribute('points')) {
            this.mesh = new THREE.Points(this.geometry, this.material)
            this.scene.add(this.mesh)
            this.object = this.mesh
        }

        if (this.object) {
            this.object.name = this.getAttribute('name')
            this.object.lookAt(0,1,0)
            this.object.matrixWorldNeedsUpdate = true
        }
        if (this.hasAttribute('position-x')) {
            this.object.position.x = Number.parseFloat(this.getAttribute('position-x'))
            this.object.matrixWorldNeedsUpdate = true
        }
        if (this.hasAttribute('position-y')) {
            this.object.position.y = Number.parseFloat(this.getAttribute('position-y'))
            this.object.matrixWorldNeedsUpdate = true
        }
        if (this.hasAttribute('position-z')) {
            this.object.position.z = Number.parseFloat(this.getAttribute('position-z'))
            this.object.matrixWorldNeedsUpdate = true
        }
        if (this.hasAttribute('scale-x')) {
            this.object.scale.x = Number.parseFloat(this.getAttribute('scale-x'))
            this.object.matrixWorldNeedsUpdate = true
        }
        if (this.hasAttribute('scale-y')) {
            this.object.scale.y = Number.parseFloat(this.getAttribute('scale-y'))
            this.object.matrixWorldNeedsUpdate = true
        }
        if (this.hasAttribute('scale-z')) {
            this.object.scale.z = Number.parseFloat(this.getAttribute('scale-z'))
            this.object.matrixWorldNeedsUpdate = true
        }
        if (this.camera) {
            this.camera.lookAt(0,0,0)
            this.camera.matrixWorldNeedsUpdate = true
        }

        requestAnimationFrame(this.render.bind(this))
    }
    render() {
        if (this.camera) {
            const {clientWidth,clientHeight} = this.parentElement
            this.camera.aspect = clientWidth / clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setPixelRatio(window.devicePixelRatio)
            this.renderer.setSize(clientWidth, clientHeight);
            this.renderer.clearDepth();
            this.renderer.render(this.scene, this.camera);
        }
        requestAnimationFrame(this.render.bind(this))
    }
})