function WebAudio() {
    
}
customElements.define('web-audio', class extends HTMLElement {
    connectedCallback() {
        this.audio = this.parentElement.audio
        if (!this.audio) {
            this.audio = new Promise((function initAudio(setter)  {
                document.addEventListener('click', (function onDocumentClickResumeAudio() {
                    const audio = new AudioContext()
                    this.setAttribute('sink-id', audio.sinkId)
                    audio.addEventListener('sinkchange', (function onSinkChange() {
                        this.setAttribute('sink-id', audio.sinkId)
                    }).bind(this))
                    setter(audio)
                }).bind(this))
            }).bind(this))
        }
        if (this.hasAttribute('resume')) {
            this.audio.then(audio => audio.resume())
        }
        if (this.hasAttribute('oscillator')) {
            this.oscillator = this.audio.then((function initOscillator(audio) {
                const oscillator = new OscillatorNode(audio, {
                    frequency: this.getAttribute('frequency')
                })
                oscillator.connect(audio.destination)
                return oscillator
            }).bind(this))
        }
    }
})