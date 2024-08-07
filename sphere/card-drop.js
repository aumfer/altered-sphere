/**
 * <card-drop ondrop-in="(e)=>{var cardDragging=e.target}"></>
 */
customElements.define('card-drop', class extends HTMLElement {
    connectedCallback() {
        this.setAttribute('droppable', `${!(this.getAttribute('aria-disabled'))}`)
        if (this.hasAttribute('ondrop-in')) {
            this.addEventListener('drop-in', (function ondropIn() {
                eval(this.getAttribute('ondrop-in'))
            }).bind(this))
        }
        this.addEventListener('dragenter', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                const scope = this.closest(this.getAttribute('scope')) ?? document
                const target = scope.querySelector(`[card-dragging]`)
                const dropAttr = target.getAttribute('drop-attr')||'droppable'
                if (this.hasAttribute(dropAttr)) {
                    this.toggleAttribute('card-dropping', true)
                    e.preventDefault();
                }
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('dragleave', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                this.toggleAttribute('card-dropping', false)
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('dragover', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {

                const target = document.querySelector(`[card-dragging]`)
                const dropAttr = target.getAttribute('drop-attr')||'droppable'
                if (this.hasAttribute(dropAttr)) {
                    this.toggleAttribute('card-dropping', true)
                    e.preventDefault();
                }
                
            } else {
                console.log('aria-disabled')
            }
        })
        this.addEventListener('drop', (e) => {
            if (!(this.getAttribute('aria-disabled'))) {
                // https://stackoverflow.com/questions/76813374/how-do-i-access-both-the-drag-and-drop-element-in-html
                const target = document.querySelector(`[card-dragging]`)
                target.dispatchEvent(new Event('drop-out'));
                this.dispatchEvent(new Event('drop-in'));
                target.toggleAttribute('card-dragging', false);
                this.toggleAttribute('card-dropping', false);
            } else {
                console.log('aria-disabled')
            }
        })

        /*this.addEventListener('mouseenter', (e) => {
            this.toggleAttribute('card-dropping', `${true}`)
        })
        this.addEventListener('mouseleave', (e) => {
            this.toggleAttribute('card-dropping', `${false}`)
        })*/
    }
})
