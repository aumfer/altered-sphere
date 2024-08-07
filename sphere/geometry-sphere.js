customElements.define('geometry-sphere', class extends HTMLElement {
    connectedCallback() {
        let radius = 1, widthSegments = 32, heightSegments = 16, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI
        const thetaEnd = Math.min( thetaStart + thetaLength, Math.PI );

        const grid = []
        const indices = [];
		const vertices = [];
		const normals = [];
		const uvs = [];

		// generate vertices, normals and uvs
        let index = 0;

		for ( let iy = 0; iy <= heightSegments; iy ++ ) {

			const verticesRow = [];

			const v = iy / heightSegments;

			// special case for the poles

			let uOffset = 0;

			if ( iy === 0 && thetaStart === 0 ) {

				uOffset = 0.5 / widthSegments;

			} else if ( iy === heightSegments && thetaEnd === Math.PI ) {

				uOffset = - 0.5 / widthSegments;

			}

			for ( let ix = 0; ix <= widthSegments; ix ++ ) {

				const u = ix / widthSegments;

				// vertex

				const x = - radius * Math.cos( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );
				const y = radius * Math.cos( thetaStart + v * thetaLength );
				const z = radius * Math.sin( phiStart + u * phiLength ) * Math.sin( thetaStart + v * thetaLength );

				vertices.push( x, y, z );

				// normal

				const l2 = (x*x)+(y*y)+(z*z)
				normals.push( x/l2, y/l2, z/l2 );

				// uv

				uvs.push( u + uOffset, 1 - v );

				verticesRow.push( index ++ );

			}

			grid.push( verticesRow );

		}

		// indices

		for ( let iy = 0; iy < heightSegments; iy ++ ) {

			for ( let ix = 0; ix < widthSegments; ix ++ ) {

				const a = grid[ iy ][ ix + 1 ];
				const b = grid[ iy ][ ix ];
				const c = grid[ iy + 1 ][ ix ];
				const d = grid[ iy + 1 ][ ix + 1 ];

				if ( iy !== 0 || thetaStart > 0 ) indices.push( a, b, d );
				if ( iy !== heightSegments - 1 || thetaEnd < Math.PI ) indices.push( b, c, d );

			}

		}

        const vElement = document.createElement('span')
        vElement.toggleAttribute('sphere-position', true)
        vElement.innerHTML = vertices.join(' ')
        this.appendChild(vElement)

        const nElement = document.createElement('span')
        nElement.toggleAttribute('sphere-normal', true)
        nElement.innerHTML = normals.join(' ')
        this.appendChild(nElement)

        const uvElement = document.createElement('span')
        uvElement.toggleAttribute('sphere-uv', true)
        uvElement.innerHTML = uvs.join(' ')
        this.appendChild(uvElement)

        const iElement = document.createElement('span')
        iElement.toggleAttribute('sphere-index', true)
        iElement.innerHTML = indices.join(' ')
        this.appendChild(iElement)

        this.setAttribute('num-verts', `${vertices.length}`)
        this.setAttribute('num-tris', `${indices.length/3}`)
    }
})