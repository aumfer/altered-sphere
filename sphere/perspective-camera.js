DEG2RAD = Math.PI / 180;
RAD2DEG = 180 / Math.PI;
//https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js#L777
function makePerspectiveGL( left, right, top, bottom, near, far) {

    const te = this;
    const x = 2 * near / ( right - left );
    const y = 2 * near / ( top - bottom );

    const a = ( right + left ) / ( right - left );
    const b = ( top + bottom ) / ( top - bottom );

    let c, d;

    //if ( coordinateSystem === WebGLCoordinateSystem ) {

        c = - ( far + near ) / ( far - near );
        d = ( - 2 * far * near ) / ( far - near );

    /*} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

        c = - far / ( far - near );
        d = ( - far * near ) / ( far - near );

    } */

    te[ 0 ] = x;	te[ 4 ] = 0;	te[ 8 ] = a; 	te[ 12 ] = 0;
    te[ 1 ] = 0;	te[ 5 ] = y;	te[ 9 ] = b; 	te[ 13 ] = 0;
    te[ 2 ] = 0;	te[ 6 ] = 0;	te[ 10 ] = c; 	te[ 14 ] = d;
    te[ 3 ] = 0;	te[ 7 ] = 0;	te[ 11 ] = - 1;	te[ 15 ] = 0;

    return this;

}
customElements.define('perspective-camera', class extends HTMLElement {
    constructor() {
        super()
        this.array = new Float32Array(16)
        this.zoom = 1.0
    }
    connectedCallback() {
        this.aspect = Number.parseFloat(this.getAttribute('aspect'))
        this.fov = Number.parseFloat(this.getAttribute('fov'))
        this.near = 0.001
        this.far = 100.0

        const modelViewMatrix = document.createElement('span')
        modelViewMatrix.toggleAttribute('model-view-matrix', true)
        modelViewMatrix.innerHTML = `0 0 0 0
        0 0 0 0
        0 0 0 0
        0 0 0 0`

        const projectionMatrix = document.createElement('span')
        projectionMatrix.toggleAttribute('projection-matrix', true)
        projectionMatrix.innerHTML = `0 0 0 0
        0 0 0 0
        0 0 0 0
        0 0 0 0`
        
        this.appendChild(modelViewMatrix)
        this.appendChild(projectionMatrix)
    }
})