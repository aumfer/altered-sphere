customElements.define('document-body', class extends HTMLElement {
    connectedCallback() {
        if (this.hasAttribute('mouse')) {
            this.mouse = {}
            document.addEventListener('mousemove', (function onDocumentBodyMouseMove(ev) {
                this.mouse.move = {...ev}
                let target =  this.parentElement
                if (this.hasAttribute('target')) {
                    target = document.querySelector(this.getAttribute('target'))
                }
                if (target && this.hasAttribute('client-x')) {
                    target.setAttribute(this.getAttribute('client-x'), `${ev.clientX}`)
                }
                this.setAttribute('mouse-x', `${ev.clientX}`)
                if (target && this.hasAttribute('client-y')) {
                    target.setAttribute(this.getAttribute('client-y'), `${ev.clientY}`)
                }
                this.setAttribute('mouse-y', `${ev.clientY}`)
                this.setAttribute('mouse-buttons', `${ev.buttons}`)
                const {width,height}=document.body.getBoundingClientRect()
                this.setAttribute('mouse-w', `${width}`)
                this.setAttribute('mouse-h', `${height}`)
            }).bind(this))
            document.body.addEventListener('mousedown', (function onDocumentBodyMouseDown(ev) {
                this.mouse.down = {...ev}
                this.setAttribute('mouse-buttons', `${ev.buttons}`)
            }).bind(this))
            document.body.addEventListener('mouseup', (function onDocumentBodyMouseUp(ev) {
                this.mouse.up = {...ev}
                this.setAttribute('mouse-buttons', `${ev.buttons}`)
            }).bind(this))
        }
        if (this.hasAttribute('window')) {
            const {x,y,width,height}=document.body.getBoundingClientRect()
            this.setAttribute('window-x', `${x}`)
            this.setAttribute('window-y', `${y}`)
            this.setAttribute('window-w', `${width}`)
            this.setAttribute('window-h', `${height}`)
            window.addEventListener('resize', (function windowResize(ev) {
                const {x,y,width,height}=document.body.getBoundingClientRect()
                this.setAttribute('window-x', `${x}`)
                this.setAttribute('window-y', `${y}`)
                this.setAttribute('window-w', `${width}`)
                this.setAttribute('window-h', `${height}`)
            }).bind(this)
            )

            if (window.getScreenDetails) {
                function getScreenDetails() {
                    window.getScreenDetails().then((function screenDetails(sd) {
                        sd.screens.forEach((function logScreen(s) {
                            console.log(s)
                        }).bind(this))
                    }).bind(this))
                    document.body.removeEventListener('click', getScreenDetails)
                }
                document.body.addEventListener('click', getScreenDetails)
            }

            if ('AmbientLightSensor' in window) {
                const sensor = new AmbientLightSensor();
                sensor.addEventListener('reading', (event) => {
                    console.log("Current light level:", sensor.illuminance);
                });
                sensor.addEventListener('error', (event) => {
                    console.log(event.error.name, event.error.message);
                });
                sensor.start();
            }
        }
    }
})