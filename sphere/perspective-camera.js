DEG2RAD = Math.PI / 180;
RAD2DEG = 180 / Math.PI;
if (!Math.hypot) Math.hypot = function () {
    var y = 0,
        i = arguments.length;

    while (i--) {
      y += arguments[i] * arguments[i];
    }

    return Math.sqrt(y);
  };
  function normalize(v) {
    const hh = Math.hypot(...v)
    const h = 1.0 / hh
    var i = v.length;
    while (i--) {
        v[i] *= h;
    }
  }
//https://github.com/mrdoob/three.js/blob/dev/src/math/Matrix4.js#L777
function makePerspective( left, right, top, bottom, near, far) {

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
function makeOrthographic( left, right, top, bottom, near, far ) {

    const te = this;
    const w = 1.0 / ( right - left );
    const h = 1.0 / ( top - bottom );
    const p = 1.0 / ( far - near );

    const x = ( right + left ) * w;
    const y = ( top + bottom ) * h;

    let z, zInv;

    //if ( coordinateSystem === WebGLCoordinateSystem ) {

        z = ( far + near ) * p;
        zInv = - 2 * p;

    //} else if ( coordinateSystem === WebGPUCoordinateSystem ) {

        //z = near * p;
        //zInv = - 1 * p;

    //}

    te[ 0 ] = 2 * w;	te[ 4 ] = 0;		te[ 8 ] = 0; 		te[ 12 ] = - x;
    te[ 1 ] = 0; 		te[ 5 ] = 2 * h;	te[ 9 ] = 0; 		te[ 13 ] = - y;
    te[ 2 ] = 0; 		te[ 6 ] = 0;		te[ 10 ] = zInv;	te[ 14 ] = - z;
    te[ 3 ] = 0; 		te[ 7 ] = 0;		te[ 11 ] = 0;		te[ 15 ] = 1;

    return this;

}
function lookAt( eye, target, up ) {

    const te = this;

    const _z = [
        eye[0] - target[0],
        eye[1] - target[1],
        eye[2] - target[2]
    ]

    if ( Math.hypot(..._z) === 0 ) {

        // eye and target are in the same position

        _z.z = 1;

    }

    normalize(_z);
    let _x = [ //crossVectors
        up[1]*_z[2] - up[2]*_z[1],
        up[2]*_z[0] - up[0]*_z[2],
        up[0]*_z[1] - up[1]*_z[0]
    ]

    if ( Math.hypot(..._x) === 0 ) {

        // up and z are parallel

        if ( Math.abs( up[2] ) === 1 ) {

            _z[0] += 0.0001;

        } else {

            _z[2] += 0.0001;

        }

        normalize(_z)
        _x = [ //crossVectors
            up[1]*_z[2] - up[2]*_z[1],
            up[2]*_z[0] - up[0]*_z[2],
            up[0]*_z[1] - up[1]*_z[0]
        ]

    }

    normalize(_x);
    const _y = [ //crossVectors
        _z[1]*_x[2] - _z[2]*_x[1],
        _z[2]*_x[0] - _z[0]*_x[2],
        _z[0]*_x[1] - _z[1]*_x[0]
    ]

    te[ 0 ] = _x[0]; te[ 4 ] = _y[0]; te[ 8 ] = _z[0];
    te[ 1 ] = _x[1]; te[ 5 ] = _y[1]; te[ 9 ] = _z[1];
    te[ 2 ] = _x[2]; te[ 6 ] = _y[2]; te[ 10 ] = _z[2];

    return this;

}
function invert() {

    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    const te = this,

        n11 = te[ 0 ], n21 = te[ 1 ], n31 = te[ 2 ], n41 = te[ 3 ],
        n12 = te[ 4 ], n22 = te[ 5 ], n32 = te[ 6 ], n42 = te[ 7 ],
        n13 = te[ 8 ], n23 = te[ 9 ], n33 = te[ 10 ], n43 = te[ 11 ],
        n14 = te[ 12 ], n24 = te[ 13 ], n34 = te[ 14 ], n44 = te[ 15 ],

        t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
        t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
        t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
        t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if ( det === 0 ) return //this.set( 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 );

    const detInv = 1 / det;

    te[ 0 ] = t11 * detInv;
    te[ 1 ] = ( n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44 ) * detInv;
    te[ 2 ] = ( n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44 ) * detInv;
    te[ 3 ] = ( n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43 ) * detInv;

    te[ 4 ] = t12 * detInv;
    te[ 5 ] = ( n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44 ) * detInv;
    te[ 6 ] = ( n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44 ) * detInv;
    te[ 7 ] = ( n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43 ) * detInv;

    te[ 8 ] = t13 * detInv;
    te[ 9 ] = ( n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44 ) * detInv;
    te[ 10 ] = ( n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44 ) * detInv;
    te[ 11 ] = ( n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43 ) * detInv;

    te[ 12 ] = t14 * detInv;
    te[ 13 ] = ( n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34 ) * detInv;
    te[ 14 ] = ( n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34 ) * detInv;
    te[ 15 ] = ( n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33 ) * detInv;

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
        this.near = 0.1
        this.far = 100.0
        this.left = -1
        this.right = +1
        this.top = -1
        this.bottom = +1

        const modelViewMatrix = document.createElement('span')
        modelViewMatrix.toggleAttribute('model-view-matrix', true)
        modelViewMatrix.innerHTML = `
        1 0 0 0
        0 1 0 0
        0 0 1 0
        0 0 0 1`
        let mvm = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
        lookAt.call(mvm, [10,0,-100],[0,0,0],[0,1,0])
        invert.call(mvm)
        //modelViewMatrix.innerHTML = mvm.join(' ')

        const projectionMatrix = document.createElement('span')
        projectionMatrix.toggleAttribute('projection-matrix', true)
        projectionMatrix.innerHTML = `
        1 0 0 0
        0 1 0 0
        0 0 1 0
        0 0 0 1`
        let pm = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]
        makePerspective.call(pm, this.left, this.right, this.top, this.bottom, this.near, this.far);
        makeOrthographic.call(pm, this.left, this.right, this.top, this.bottom, this.near, this.far)
        //projectionMatrix.innerHTML = pm.join(' ')
        
        this.appendChild(modelViewMatrix)
        this.appendChild(projectionMatrix)
    }
})