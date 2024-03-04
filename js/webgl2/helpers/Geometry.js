// @ts-check
export class Geometry
{
    /**
     * @returns {[number, number, number][]}
     */
    static createRectangleVertices()
    {
        /** @type {[number, number, number][]} */
        let triangle_1 = [[-1, -1, 0], [-1, 1, 0], [1, 1, 0]];
        /** @type {[number, number, number][]} */
        let triangle_2 = [[-1, -1, 0], [1, 1, 0], [1, -1, 0]];
        return [...triangle_1, ...triangle_2];
    }
    /**
     * @returns {[number, number, number][]}
     */
    static createTriangleVertices()
    {
        return [[-1, -1, 0], [0, 1, 0], [1, -1, 0]];
    }
    /**
     * @param {number} scale
     * @returns {[number, number][]}
     */
    static createTriangleUV(scale)
    {
        return [[0, 0], [0.5 * scale, 1 * scale], [1 * scale, 0]];
    }
}