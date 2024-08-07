function Quat_computeW(q) {
    const W = 3, X = 0, Y = 1, Z = 2
    const t = 1.0 - (q[X] * q[X]) - (q[Y] * q[Y]) - (q[Z] * q[Z]);
    if (t < 0.0)
        q[W] = 0.0;
    else
        q[W] = -Math.sqrt (t);
}
function Quat_normalize(q) {
    const W = 3, X = 0, Y = 1, Z = 2
    const mag = Math.sqrt ((q[X] * q[X]) + (q[Y] * q[Y])
		    + (q[Z] * q[Z]) + (q[W] * q[W]));
    if (mag > 0) {
        const oneOverMag = 1.0 / mag;

        q[W] *= oneOverMag;
        q[X] *= oneOverMag;
        q[Y] *= oneOverMag;
        q[Z] *= oneOverMag;
    }
}
function Quat_multQuat(qa,qb,out) {
    const W = 3, X = 0, Y = 1, Z = 2
    out[W] = (qa[W] * qb[W]) - (qa[X] * qb[X]) - (qa[Y] * qb[Y]) - (qa[Z] * qb[Z]);
    out[X] = (qa[X] * qb[W]) + (qa[W] * qb[X]) + (qa[Y] * qb[Z]) - (qa[Z] * qb[Y]);
    out[Y] = (qa[Y] * qb[W]) + (qa[W] * qb[Y]) + (qa[Z] * qb[X]) - (qa[X] * qb[Z]);
    out[Z] = (qa[Z] * qb[W]) + (qa[W] * qb[Z]) + (qa[X] * qb[Y]) - (qa[Y] * qb[X]);
}
function Quat_multVec(q,v,out) {
    const W = 3, X = 0, Y = 1, Z = 2
    out[W] = - (q[X] * v[X]) - (q[Y] * v[Y]) - (q[Z] * v[Z]);
    out[X] =   (q[W] * v[X]) + (q[Y] * v[Z]) - (q[Z] * v[Y]);
    out[Y] =   (q[W] * v[Y]) + (q[Z] * v[X]) - (q[X] * v[Z]);
    out[Z] =   (q[W] * v[Z]) + (q[X] * v[Y]) - (q[Y] * v[X]);
}
function Quat_rotatePoint(q,a,out) {
    const W = 3, X = 0, Y = 1, Z = 2
    const inv = new Float32Array(4)
    inv[X] = -q[X]; inv[Y] = -q[Y];
    inv[Z] = -q[Z]; inv[W] =  q[W];
    Quat_normalize(inv)
    const tmp0 = new Float32Array(4)
    Quat_multVec(q,a,tmp0);
    const final = new Float32Array(4)
    Quat_multQuat(tmp0,inv,final)
    out[X] = final[X]
    out[Y] = final[Y]
    out[Z] = final[Z]
}
customElements.define('geometry-md5', class extends HTMLElement {
    connectedCallback() {
        this.joints = {array:[]}
        this.scale = this.hasAttribute('scale') ? Number.parseFloat(this.getAttribute('scale')) : 1
        if (Number.isNaN(this.scale)) throw `bad scale`

        function parseMd5(line, start, end) {
            let s = line.slice(start,end)
            const md5Version = s.match(/MD5Version\s+(\d+)/)
            if (md5Version) {
                this.setAttribute('md5-version', md5Version[1])
            }
            const numJoints = s.match(/numJoints\s+(\d+)/)
            if (numJoints) {
                this.setAttribute('num-joints', numJoints[1])
            }
            const numMeshes = s.match(/numMeshes\s+(\d+)/)
            if (numMeshes) {
                this.setAttribute('num-meshes', numMeshes[1])
            }

            if (this.joints) {
                const joint = s.match(/["]\s?(\S+)\s?["]\s+([-+]?\d+)\s+[(]\s*([-+]?[0-9]+\.?[0-9]*)\s+([-+]?[0-9]+\.?[0-9]*)\s+([-+]?[0-9]+\.?[0-9]*)\s*[)]\s+[(]\s*([-+]?[0-9]+\.?[0-9]*)\s+([-+]?[0-9]+\.?[0-9]*)\s+([-+]?[0-9]+\.?[0-9]*)\s*[)]/)
                if (joint) {
                    const jointIndex = this.joints.array.length
                    const j = {
                        parent:this.joints.array[Number.parseInt(joint[2])],
                        position:new Float32Array([Number.parseFloat(joint[3]),Number.parseFloat(joint[4]),Number.parseFloat(joint[5])]),
                        orientation:new Float32Array([Number.parseFloat(joint[6]),Number.parseFloat(joint[7]),Number.parseFloat(joint[8]), 0.0])
                    }
                    Quat_computeW(j.orientation)
                    this.joints[joint[1]] = j
                    this.joints.array.push(j)
                    const jointE = document.createElement('span')
                    jointE.setAttribute('md5-joint', joint[1])
                    //this.appendChild(jointE)
                }
            }
            if (s.match(/joints\s+{/)) {
                //if (this.joints) throw 'only one set of joints is supported'
                //this.joints = {}
            }
            if (s.match(/mesh\s+{/)) {
                this.mesh = document.createElement('span')
                this.mesh.toggleAttribute('md5-mesh', true)
                this.mesh.uv = document.createElement('span')
                this.mesh.uv.toggleAttribute('md5-uv', true)
                this.mesh.appendChild(this.mesh.uv);
                this.mesh.tri = document.createElement('span')
                this.mesh.tri.toggleAttribute('md5-index', true)
                this.mesh.appendChild(this.mesh.tri)
                this.mesh.vert = document.createElement('span')
                this.mesh.vert.toggleAttribute('md5-vert', true);
                this.mesh.appendChild(this.mesh.vert)
                this.mesh.norm = document.createElement('span')
                this.mesh.norm.toggleAttribute('md5-norm')
                this.mesh.appendChild(this.mesh.norm)
                this.appendChild(this.mesh)
            }
            
            if (this.mesh) {
                if (s.match(/}/)) {
                    //delete this.mesh
                    for (let i = 0; i < this.mesh['num-verts']; ++i) {
                        const vert = new Float32Array([0,0,0])
                        for (let j = this.mesh.vert[i]['start-weight']; j < this.mesh.vert[i]['start-weight']+this.mesh.vert[i]['count-weight']; ++j) {
                            const weight = this.mesh.weights[j]
                            const joint = weight.joint;//this.joints[weight.joint]
                            const wv = new Float32Array([0,0,0])
                            Quat_rotatePoint(joint.orientation,weight.position,wv)
                            vert[0] += (joint.position[0]+wv[0])*weight.bias
                            vert[1] += (joint.position[1]+wv[1])*weight.bias
                            vert[2] += (joint.position[2]+wv[2])*weight.bias
                        }
                        vert[0] *= this.scale
                        vert[1] *= this.scale
                        vert[2] *= this.scale
                        if (Number.isNaN(vert[0]) || Number.isNaN(vert[1]) || Number.isNaN(vert[2])) throw NaN
                        this.mesh.vert.innerHTML += `${vert[0]} ${vert[1]} ${vert[2]}\n`

                        const h = 1.0 / Math.hypot(...vert)
                        const norm = [
                            vert[0]*h,
                            vert[1]*h,
                            vert[2]*h
                        ]
                        this.mesh.norm.innerHTML += `${norm[0]} ${norm[1]} ${norm[2]}`
                    }
                }
            }
            if (this.mesh) {
                const shader = s.match(/shader\s+"(\S+)"/)
                if (shader) {
                    this.mesh.setAttribute('shader', shader[1])
                }
                const numVerts = s.match(/numverts\s+(\d+)/)
                if (numVerts) {
                    this.mesh.setAttribute('num-verts', numVerts[1])
                    this.mesh['num-verts'] = Number.parseInt(numVerts[1])
                }
                const numTris = s.match(/numtris\s+(\d+)/)
                if (numTris) {
                    this.mesh.setAttribute('num-tris', numTris[1])
                }
                const numWeights = s.match(/numweights\s+(\d+)/)
                if (numWeights) {
                    this.mesh.setAttribute('num-weights', numWeights[1])
                    this.mesh.weights = new Array(Number.parseInt(this.mesh.getAttribute('num-weights')))
                }
                const vert = s.match(/vert\s+(\d+)\s+[(]\s?([-+]?[0-9]+\.?[0-9]*)\s+([-+]?[0-9]+\.?[0-9]*)\s?[)]\s+(\d+)\s+(\d+)/)
                if (vert) {
                    this.mesh.uv.innerHTML += `${vert[2]} ${vert[3]}\n`
                    const vertIndex = Number.parseInt(vert[1])
                    this.mesh.vert[vertIndex] = {['start-weight']:Number.parseInt(vert[4]),['count-weight']:Number.parseInt(vert[5])}
                    //this.mesh.vert
                }
                const tri = s.match(/tri\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)/)
                if (tri) {
                    this.mesh.tri.innerHTML += `${tri[1]} ${tri[2]} ${tri[3]}`
                }
                const weight = s.match(/weight\s+(\d+)\s+(\d+)\s+([-+]?[0-9]+\.?[0-9]*)\s+[(]\s?([-+]?[0-9]+\.?[0-9]*)\s+([-+]?[0-9]+\.?[0-9]*)\s+([-+]?[0-9]+\.?[0-9]*)\s?[)]/)
                if (weight) {
                    const weightIndex = Number.parseInt(weight[1])
                    const jointIndex = Number.parseInt(weight[2])
                    if (Number.isNaN(jointIndex)) throw `weight ${weight[1]}: bad joint`
                    //this.mesh.weights[weightIndex] = {
                    const w = {
                        joint:this.joints.array[jointIndex],
                        bias:Number.parseFloat(weight[3]),
                        position:new Float32Array([Number.parseFloat(weight[4]),Number.parseFloat(weight[5]),Number.parseFloat(weight[6])])
                    }
                    //this.mesh.weights.push(w)
                    this.mesh.weights[weightIndex] = w
                    if (!this.mesh.weights[weightIndex].joint) throw weight
                }
            }

            const numFrames = s.match(/numFrames\s+(\d+)/)
            if (numFrames) {
                this.setAttribute('md5-frames', numFrames[1])
            }
            const framerate = s.match(/frameRate\s+(\d+)/)
            if (framerate) {
                this.setAttribute('framerate', framerate[1])
            }
            const numAnimatedComponents = s.match(/numAnimatedComponents (\d+)/)
            if (numAnimatedComponents) {
                this.setAttribute('num-animated-components', numAnimatedComponents[1])
            }
            s.match(/hierarchy {/)
        }
        const src = this.getAttribute('src')
        const fetch = new XMLHttpRequest()
        fetch.open('GET', src)
        let parsed = 0
        fetch.addEventListener('progress', (function loadMd5(e) {
            if (e.loaded > parsed) {
                //console.log(fetch.responseText)

                // todo readable stream?
                let s = 0
                for (var i = s; i < e.loaded; ++i) {
                    if (fetch.response[i] == '\n') {
                        parseMd5.call(this, fetch.response, s, i)
                        parsed += (i-s)
                        s = i
                    }
                }
                
            }
        }).bind(this))
        fetch.addEventListener('readystatechange', (function GeometryMD5(e) {
            if (fetch.readyState === 4) {
                this.dispatchEvent(new Event('geometry-md5'))
            }
        }).bind(this))
        fetch.send()

        // todo compute md5-position
    }
})