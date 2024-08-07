/**
 * <card-drag drop-attr="my-droppable"></>
 * <card-drop my-droppable></>
 */
let _overElements = []
customElements.define("card-drag", class extends HTMLElement {
    connectedCallback() {
        this.dragoffset = [0, 0]
        //const options = { frequency: 60, referenceFrame: "device" };
        //const sensor = new AbsoluteOrientationSensor(options);

        this.setAttribute('draggable', `${!(this.getAttribute('aria-disabled'))}`)
        if (this.hasAttribute('ondrop-out')) {
            this.addEventListener('drop-out', (function ondropOut() {
                eval(this.getAttribute('ondrop-out'))
            }).bind(this))
        }
        this.addEventListener('dragstart', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                this.dragoffset = [
                    e.clientX,
                    e.clientY
                ]
                this.toggleAttribute('card-dragging', true)
                this.transform = this.style.transform;
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('dragend', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                this.toggleAttribute('card-dragging', false)
                //this.removeAttribute('data-transfer')
                this.style.transform = this.transform;
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('drag', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                const [x, y] = [
                    `${e.clientX - this.dragoffset[0]}px`,
                    `${e.clientY - this.dragoffset[1]}px`
                ]
                //this.setAttribute('x', `${x}`)
                //this.setAttribute('y', `${y}`)
                //this.style.transform = `translate(${x},${y})`
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('drop', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                throw `unexpected drop ${this.getAttributeNames()}`
            } else {
                console.log('aria-disabled')
            }
        })

        const i = 0;
        this.addEventListener('touchstart', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                this.dragoffset = [
                    e.targetTouches[i].clientX - this.clientLeft,
                    e.targetTouches[i].clientY - this.clientTop
                ]
                this.toggleAttribute('card-touching', true)
                this.transform = this.style.transform;
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('touchend', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                this.style.transform = this.transform;
                //e.target.dispatchEvent(new DragEvent('drop'))
                const target = document.querySelector('[card-dropping]')
                if (target) {
                    //propogateEvent(target, new Event('card-drop'));
                    this.dispatchEvent(new Event('drop-out'));
                    target.dispatchEvent(new Event('drop-in'));
                    target.toggleAttribute('card-dropping', false)
                } else {
                    const [x,y] = this.dragoffset
                    this.setAttribute('x', `${x}`)
                    this.setAttribute('y', `${y}`)
                    this.style.transform = `translate(${x},${y})`
                }
                this.toggleAttribute('card-touching', false)
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('touchmove', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                e.preventDefault();

                const dropAttr = this.getAttribute('drop-attr')||'droppable'
                const overElements = document.elementsFromPoint(e.targetTouches[i].clientX, e.targetTouches[i].clientY)
                const [dropOn] = overElements
                    .filter(e => e.hasAttribute(dropAttr))
                if (dropOn) {
                    dropOn.toggleAttribute('card-dropping', true);
                }
                if (overElements.length !== _overElements.length) {
                    //console.log(overElements)
                    _overElements = overElements
                }

                //const {x, y} = e.target.getBoundingClientRect()
                const [x, y] = [
                    `${e.targetTouches[i].clientX - this.dragoffset[0]}px`,
                    `${e.targetTouches[i].clientY - this.dragoffset[1]}px`
                ]
                this.setAttribute('x', `${x}`)
                this.setAttribute('y', `${y}`)
                this.style.transform = `translate(${x},${y})`
            } else {
                console.log('aria-disabled')
            }
        })

    }
    static get observedAttributes() {
        return ['aria-disabled']
    }
    attributeChangedCallback(name, oldValue, newValue) {
        if (name == 'aria-disabled') {
            this.setAttribute('draggable', !!newValue);
            if (!newValue) {
                this.toggleAttribute('card-touching', !newValue)
                this.toggleAttribute('card-dropping', !newValue)
            }
        }
    }
})
