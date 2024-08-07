customElements.define('wasm-module', class extends HTMLElement {
    connectedCallback() {
        const src = this.getAttribute('src')
        const fetch = new XMLHttpRequest()
        fetch.responseType = 'arraybuffer'
        fetch.open('GET', src)
        fetch.addEventListener('readystatechange', (function fetchModule(e) {
            if (fetch.readyState == XMLHttpRequest.DONE) {
                this.imports = this.closest('canvas').getContext('webgl')||window
                //this.imports = {
                //    printf: console.log
                //}
                WebAssembly.instantiate(fetch.response,{imports:this.imports}).then((function loadModule(wasm) {
                    this.exports = wasm.instance.exports
                    //this = {...this,...wasm.instance.exports}
                    this.innerHTML = JSON.stringify(this.exports)
                    this.exports._start();
                    this.dispatchEvent(new Event('wasm-module'))
                    var x = 0
                    var y = this.exports.readline('hello world\n', function foo(line) {
                        console.log(`foo${line}`)
                    }, x)
                    console.log(y)
                }).bind(this))
            }
        }).bind(this))
        fetch.send()
    }
})