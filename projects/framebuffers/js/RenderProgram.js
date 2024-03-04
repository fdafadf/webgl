// @ts-check
import * as WebGL2 from "../../../js/webgl2/index.js";
/**
 * @extends {WebGL2.ShaderProgram<typeof RenderProgram.AttributesModel, typeof RenderProgram.UniformsModel>}
 */
export class RenderProgram extends WebGL2.ShaderProgram
{
    /** @type {{ position: 'vec3', uv: 'vec2' }} */
    static AttributesModel = { position: 'vec3', uv: 'vec2' };
    /** @type {{ }} */
    static UniformsModel = { Texture: 'sampler2D' };
    static Vertex_Shader_Source = `#version 300 es
        in vec3 position;
        in vec2 uv;
        out vec2 out_uv;
        void main()
        {
            out_uv = uv;
            gl_Position = vec4(position, 1.0);
        }
    `;
    static Fragment_Shader_Source = `#version 300 es
        precision highp float;
        uniform sampler2D Texture;
        in vec2 out_uv;
        out vec4 out_color;
        void main()
        {
            out_color = texture(Texture, out_uv.yx * 2.0);
            out_color = vec4(out_color.rgb, 0.5);
        }
    `;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    constructor(gl)
    {
        super(gl, RenderProgram.AttributesModel, RenderProgram.UniformsModel, RenderProgram.Vertex_Shader_Source, RenderProgram.Fragment_Shader_Source);
    }
}