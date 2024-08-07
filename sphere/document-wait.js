customElements.define('document-wait', class extends HTMLElement {
    connectedCallback() {
        this.replaceChildren()
        let element = document
        let hack = 0;
        if (this.hasAttribute('closest')) {
            ++hack;
            const closest = this.getAttribute('closest')
        
            if (!closest) {
                element = this.parentElement 
            } else {
                element = this.closest(closest)
            }
        }
        if (this.hasAttribute('query')) {
            ++hack;
            const query = this.getAttribute('query')
            element = element.querySelector(query)
        }
        if (!element) throw `cannot wait for ${this.getAttribute('event')} on ${this.getAttribute('closest')} ${this.getAttribute('query')}`
        let eventA = 'load'
        if (this.hasAttribute('event')) {
            ++hack
            eventA = this.getAttribute('event')
        }
        
        const props = this.getAttributeNames()
        element.addEventListener(eventA, (function init() {
            const el = document.createElement(props[hack])
            for (let n of props.slice(hack+1)) {
                el.setAttribute(n, this.getAttribute(n))
            }
            this.appendChild(el)
            this.dispatchEvent(new Event('document-wait'))
        }).bind(this))
    }
})