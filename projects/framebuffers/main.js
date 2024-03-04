// @ts-check
import { Framebuffers } from './js/Framebuffers.js';
async function onWindowLoad()
{
    let canvas_placeholder = document.getElementById('webgl-placeholder');
    if (!canvas_placeholder) throw Error('Canvas placeholder not found.');
    let project = new Framebuffers();
    canvas_placeholder.appendChild(project.canvas_element);
    await project.run();
}
window.addEventListener('load', onWindowLoad);