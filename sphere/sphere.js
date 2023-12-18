customElements.define('terrarium-image', class extends HTMLElement {
    connectedCallback() {
        const images = []
        const x = 0;
        const y = 0;
        const z = 16;
        for (var i = 0; i < 16; ++i) {
            for (var j = 0; j < 16; ++j) {
                const image = document.createElement('img')
                image.setAttribute('draggable', 'false')
                
                image.width = 256
                image.height = 256
                const scale = 1.0;
                image.style.position = 'absolute'
                image.style.transform = `translate(${x + (i * image.width * scale)}px,${y + (j * image.width * scale)}px) scale(${scale})`
                //image.style.transform = `${image.style.transform}, translate(${x + (i * image.width * scale)}px,${y + (j * image.width * scale)}px) scale(${scale})`
                //image.style.top = p[1] * image.height * scale;
                //image.style.left = p[0] * image.width * scale;

                images.push(image)

                const path = [
                    `${Math.floor(Math.sqrt(z))}`,
                    `${Math.floor(x + i)}`,
                    `${Math.floor(y + j)}`
                ]

                image.setAttribute('src', `/terrarium/${path.join('/')}.png`)
                image.setAttribute('i', `${i}`)
                image.setAttribute('j', `${j}`)
                this.appendChild(image)
            }
        }
    }
})