customElements.define('media-stream', class extends HTMLElement {
    connectedCallback() {
        if (this.hasAttribute('video')) {
            const videoElement = this.closest('video')
            videoElement.onloadedmetadata = () => {
                videoElement.play();
            };
            if (this.hasAttribute('camera')) {
                navigator.mediaDevices.getUserMedia({video:true}).then((function userMedia(stream) {
                    videoElement.srcObject = stream
                }).bind(this)).catch((function getUserMediaError(e) {
                    console.log(`getUserMedia error ${e}`)
                }).bind(this))
            }
            if (this.hasAttribute('display')) {
                function onTransientActivationFromUserGesture() {
                    navigator.mediaDevices.getDisplayMedia({systemAudio:'include'}).then((function browserMedia(stream) {
                        videoElement.srcObject = stream
                    }).bind(this)).catch((function getUserMediaError(e) {
                        console.log(`getDisplayMedia error ${e}`)
                    }).bind(this))
                    document.body.removeEventListener('click', onTransientActivationFromUserGesture);
                }
                document.body.addEventListener('click', onTransientActivationFromUserGesture)
            }
            if (this.hasAttribute('canvas')) {
                const stream = document.querySelector('canvas').captureStream(25)
                videoElement.srcObject = stream
            }
        }
        if (this.hasAttribute('audio')) {
            const audioElement = this.closest('audio')
            audioElement.onloadedmetadata = () => {
                audioElement.play();
            };
            if (this.hasAttribute('microphone')) {
                navigator.mediaDevices.getUserMedia({audio:true}).then((function userMedia(stream) {
                    audioElement.srcObject = stream
                }).bind(this)).catch((function getUserMediaError(e) {
                    console.log(`getUserMedia error ${e}`)
                }).bind(this))
            }
        }
    }
})
function mediaDeviceTemplate(device, element) {
    const render = `<span device="${device.deviceId}" ${device.kind}>${device.label}</span>`
    element.innerHTML = render
    return element;
}
customElements.define('media-devices', class extends HTMLElement {
    connectedCallback() {
        navigator.mediaDevices.enumerateDevices().then((function mediaDevices(devices) {
            const template = devices.flatMap(d =>
                Array.from(this.children).map(n =>
                    mediaDeviceTemplate(d, n.cloneNode(true))
                )
            )
            this.replaceChildren(...template)
        }).bind(this)).catch((function enumerateDevicesError(e) {
            console.log(`enumerateDevices error ${e}`)
        }).bind(this))
    }
})