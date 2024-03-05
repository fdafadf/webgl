// @ts-check
export class TexturedFramebuffer
{
    static Texture_Format = 'RGBA+UNSIGNED_BYTE';
    /** @type {GLint} */
    static Texture_Internal_Format = WebGL2RenderingContext.RGBA;
    /** @type {GLenum} */
    static Texture_Texel_Data_Type = WebGL2RenderingContext.UNSIGNED_BYTE;
    /**
     * @param {WebGL2RenderingContext} gl 
     */
    static initialize(gl)
    {
        let extension = gl.getExtension("EXT_color_buffer_float");
        if (extension)
        {
            TexturedFramebuffer.Texture_Internal_Format = WebGL2RenderingContext.RGBA16F;
            TexturedFramebuffer.Texture_Texel_Data_Type = WebGL2RenderingContext.FLOAT;
            TexturedFramebuffer.Texture_Format = 'RGBA16F+FLOAT';
        }
    }
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {{ repeat?: boolean }} [parameters]
     * @returns 
     */
    static createTexture(gl, parameters)
    {
        let handle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, handle);
        gl.texImage2D(gl.TEXTURE_2D, 0, TexturedFramebuffer.Texture_Internal_Format, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, TexturedFramebuffer.Texture_Texel_Data_Type, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, parameters?.repeat ?? false ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, parameters?.repeat ?? false ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        // gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA32F, gl.canvas.width, gl.canvas.height);
        return handle;
    }
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {{ repeat?: boolean, color_buffer_float?: boolean }} [texture_parameters]
     */
    constructor(gl, texture_parameters)
    {
        this.texture_handle = TexturedFramebuffer.createTexture(gl, texture_parameters);
        this.handle = gl.createFramebuffer();
        // let renderbuffer = gl.createRenderbuffer();
        // gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
        // gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
        // gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, gl.canvas.width, gl.canvas.height);
        // gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, renderbuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.handle);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture_handle, 0);
    }
}
