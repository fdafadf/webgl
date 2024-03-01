// @ts-check
export class VertexArray
{
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {[number, number, number][]} vertices
     * @param {import('./../ShaderProgram.js').ShaderProgram<{ position: 'vec3' }, any>} program
     */
    static createVertexArray3(gl, vertices, program)
    {
        let handle = gl.createVertexArray();
        gl.bindVertexArray(handle);
        let position = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, position);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(program.attribute_locations.position);
        gl.vertexAttribPointer(program.attribute_locations.position, 3, gl.FLOAT, false, 0, 0);
        return { handle }
    }
}