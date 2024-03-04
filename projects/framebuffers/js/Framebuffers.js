// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
import * as WebGL2Helpers from "../../../js/webgl2/helpers/index.js";
import { FramebufferProgram } from "./FramebufferProgram.js";
import { RenderProgram } from "./RenderProgram.js";
export class Framebuffers extends WebGL2.Project
{
    constructor()
    {
        super();
    }
    async run()
    {
        let gl = this.context;
        let framebuffer = new WebGL2.TexturedFramebuffer(gl, { repeat: true });
        let framebuffer_program = new FramebufferProgram(gl);
        let framebuffer_triangle = WebGL2Helpers.VertexArray.createVertexArray3(gl, framebuffer_program, WebGL2.Geometry.createTriangleVertices());
        let render_program = new RenderProgram(gl);
        let render_triangle = new WebGL2Helpers.VertexArrayBuilder(gl);
        render_triangle.createBoundBufferWithData3('position', WebGL2.Geometry.createTriangleVertices(), render_program);
        render_triangle.createBoundBufferWithData2('uv', WebGL2.Geometry.createTriangleUV(10), render_program);
    
        const animate = () =>
        {
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer.handle);
            gl.clearColor(0.0, 1.0, 0.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(framebuffer_program.handle);
            gl.bindVertexArray(framebuffer_triangle.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 3);

            gl.activeTexture(gl.TEXTURE0 + 0);
            gl.bindTexture(gl.TEXTURE_2D, framebuffer.texture_handle);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.clearColor(0.0, 0.0, 1.0, 1.0);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.useProgram(render_program.handle);
            gl.bindVertexArray(render_triangle.handle);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
            // gl.useProgram(framebuffer_program.handle);
            // gl.bindVertexArray(framebuffer_triangle.handle);
            // gl.drawArrays(gl.TRIANGLES, 0, 3);

            window.requestAnimationFrame(animate);
        }
        
        window.requestAnimationFrame(animate);
    }
}