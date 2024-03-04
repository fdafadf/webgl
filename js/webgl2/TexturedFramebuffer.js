// @ts-check
export class TexturedFramebuffer
{
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {{ repeat: [boolean] }} [parameters]
     * @returns 
     */
    static createTexture(gl, parameters)
    {
        let ext = gl.getExtension("EXT_color_buffer_float");
        let handle = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, handle);
        if (ext) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.FLOAT, null);
        else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width, gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, parameters?.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, parameters?.repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE);
        // gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA32F, gl.canvas.width, gl.canvas.height);
        return handle;
    }
    /**
     * @param {WebGL2RenderingContext} gl 
     * @param {{ repeat: [boolean] }} [texture_parameters]
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
