// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @extends {WebGL2.ShaderProgram<typeof FramebufferProgram.AttributesModel, typeof FramebufferProgram.UniformsModel>}
 */
export class FramebufferProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec3' }} */
    static AttributesModel = { position: 'vec3' };
    /** @type {{ }} */
    static UniformsModel = { };
    static Vertex_Shader_Source = `#version 300 es
        in vec3 position;
        void main()
        {
            gl_Position = vec4(position, 1.0);
        }
    `;
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        out vec4 outColor;
        void main()
        {
            outColor = vec4(1, 0, 0, 1);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, FramebufferProgram.AttributesModel, FramebufferProgram.UniformsModel, FramebufferProgram.Vertex_Shader_Source, FramebufferProgram.Fragment_Shader_Source);
    }
}