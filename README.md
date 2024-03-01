# Symulacja cząsteczek

## Demo

https://fdafadf.github.io/webgl/projects/particles/.

## Założenia symulacji

- W ograniczonej przestrzeni dwuwymiarowej poruszają się cząsteczki. 
- Cząsteczki odbijają się od krawędzi przestrzeni. 
- Prędkość poruszania się cząsteczek jest stała.
- Cząsteczka nieustannie ulatnia niewielką ilość feromonu.
- Kierunek ruchu cząsteczki zmienia się na podstawie obserwacji poziomu feromonu w otoczeniu każdej cząsteczki.

## Algorytm

Poniższy opis dotyczy pojedynczego cyklu symulacji.

1. Aktualizacja pozycji i ruchu cząsteczek.
    1. Wyliczenie nowej pozycji.
        ```GLSL
        vec2 scaledVelocity = VelocityScale * velocity;
        outPosition = position + scaledVelocity;
        ```
    1. Jeśli cząsteczka przekroczyła granicę przestrzeni następuje odpowiednie odwrócenie wektora ruchu.
        ```GLSL
        outVelocity.x = outPosition.x < -1.0 || outPosition.x > 1.0 ? -velocity.x : velocity.x;
        outVelocity.y = outPosition.y < -1.0 || outPosition.y > 1.0 ? -velocity.y : velocity.y;
        ```
    1. Odczytanie wartości feromonu w dwóch punktach przed cząsteczką pod kątem 45° i -45° w odległości `ViewingDistance`.
        ```GLSL
        #define LOOK_ANGLE 0.7853981
        const mat2 LOOK_L = mat2(cos(-LOOK_ANGLE), sin(-LOOK_ANGLE), -sin(-LOOK_ANGLE), cos(-LOOK_D));
        const mat2 LOOK_R = mat2(cos(LOOK_ANGLE), sin(LOOK_ANGLE), -sin(LOOK_ANGLE), cos(LOOK_ANGLE));
        vec4 f1 = texture(Screen, uv + normalize(velocity * LOOK_L) * ViewingDistance);
        vec4 f2 = texture(Screen, uv + normalize(velocity * LOOK_R) * ViewingDistance);
        ```
    1. W zależności od tego w którym z dwóch punktów wartość feromonu jest większa następuje zmiana kierunku ruchu w lewo lub w prawo o kąt `direction_change_angle`.
        ```GLSL
        outVelocity = outVelocity * (f1.b > f2.b ? RotateL : RotateR);
        ```
        W rzeczywiśtości wykorzystywane są macierze obrotu wyliczane poza shaderem.
        ```JS    
        set direction_change_angle(value)
        {
            value = value * Math.PI / 180;
            this.context.uniformMatrix2fv(this.uniform_locations.RotateL, false, [ Math.cos(-value), Math.sin(-value), -Math.sin(-value), Math.cos(-value) ]);
            this.context.uniformMatrix2fv(this.uniform_locations.RotateR, false, [ Math.cos(value), Math.sin(value), -Math.sin(value), Math.cos(value) ]);
        }
        ```
2. Rozproszenie oraz zanik feromonu.
    1. Rozproszenie odbywa się poprzez kilkukrotne zastosowanie efektu rozmycia (gaussian blur).
        ```GLSL
        float c1 = texture(Screen, uv + vec2(-P, -P)).b * 0.045;
        float c2 = texture(Screen, uv + vec2(0, -P)).b * 0.122;
        float c3 = texture(Screen, uv + vec2(P, -P)).b * 0.045;
        float c4 = texture(Screen, uv + vec2(-P, 0)).b * 0.122;
        float c5 = texture(Screen, uv + vec2(0, 0)).b * 0.332;
        float c6 = texture(Screen, uv + vec2(P, 0)).b * 0.122;
        float c7 = texture(Screen, uv + vec2(-P, P)).b * 0.045;
        float c8 = texture(Screen, uv + vec2(0, P)).b * 0.122;
        float c9 = texture(Screen, uv + vec2(P, P)).b * 0.045;
        float c = c1 + c2 + c3 + c4 + c5 + c6 + c7 + c8 + c9;
        ```
    2. Zanik feromonu to przemnożenie bieżącej wartości przez ustalony parametr `PheromoneDecayFactor`.
        ```GLSL
        color = vec4(0.0, 0.0, c * PheromoneDecayFactor, 1.0);
        ```
## Implementacja

### Aktualizacja cząsteczek

Każda cząsteczka opisywana jest przez pozycję i wektor ruchu. Do przechowywania tych danych wykorzystano `WebGLBuffer`. Pozycje cząsteczek i wektory ruchu przechowywane są w osobnych buforach.

```JS
let buffers = { position: gl.createBuffer(), velocity: gl.createBuffer(), framebuffer };
```

Każdy bufor przechowuje dwie liczby typu float dla każdej cząsteczki. Ponieważ wykorzystujemy jednocześnie więcej niż jeden bufor, kojarzymy je z  obiektem _VAO_ (`WebGLVertexArrayObject`).

```JS
let handle = gl.createVertexArray();
gl.bindVertexArray(handle);
gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
gl.enableVertexAttribArray(program.attribute_locations.position);
gl.vertexAttribPointer(program.attribute_locations.position, 2, gl.FLOAT, false, 0, 0);
gl.bindBuffer(gl.ARRAY_BUFFER, buffers.velocity);
gl.enableVertexAttribArray(program.attribute_locations.velocity);
gl.vertexAttribPointer(program.attribute_locations.velocity, 2, gl.FLOAT, false, 0, 0);
```

_Vertex Shader_ nie może używać tego samego buforu jednocześnie do czytania i pisania. Dlatego tworzymy dwa zestawy buforów, wejściowe oraz wyjściowe. 

```JS
let vertex_arrays = { input: createVertexArray(), output: createVertexArray() };
```

Zestawy wejściowe i wyjściowe zamieniamy ze sobą w każdym cyklu symulacji.

```JS
[vertex_arrays.input, vertex_arrays.output] = [vertex_arrays.output, vertex_arrays.input];
```

Za aktualizację cząsteczek odpowiada program [`UpdateParticlesProgram`](projects/particles/js/UpdateParticlesProgram.js)

Program ten wykonuje jedynie obliczenia w _Vertex Shader_. Nie renderuje żadnej grafiki, jego _Fragment Shader_ jest pusty. Dlatego uruchamiany jest w konfiguracji WebGL z wyłączoną rasteryzacją.

```JS
gl.enable(gl.RASTERIZER_DISCARD);
```

Do odebrania wyników obliczeń wykorzystywana jest technika transform feedback.

```JS
gl.beginTransformFeedback(gl.POINTS);
gl.drawArrays(gl.POINTS, 0, count);
gl.endTransformFeedback();
```

Jako wejście programu ustawiany jest zestaw buforów wejściowych skojarzony z _VAO_.

```JS
gl.bindVertexArray(vertex_arrays.input.handle);
```

Rezultaty przyjmujemy do buforów wyjściowych.

```JS
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 0, vertex_arrays.output.buffers.position);
gl.bindBufferBase(gl.TRANSFORM_FEEDBACK_BUFFER, 1, vertex_arrays.output.buffers.velocity);
```

### Aktualizacja mapy feromonów

Mapa poziomu feromonów w przestrzeni w której odbywa się symulacja przechowywana jest w postaci tekstury której rozmiary odpowiadają rozmiarowi tej przestrzeni.

Nie jest możliwy jednoczesny odczyt i zapis do tekstury przez shadery. Ponieważ tekstura musi być modyfikowana na podstawie danych w niej zawartych, podobnie jak w przypadku buforów z pozycjami cząsteczek, tworzone są dwie tekstury, wejściowa oraz wyjściowa. Obie tekstury są ze sobą cyklicznie zamieniane.

W rzeczywistości tekstury nie są używane jawnie, ale przez obiekt typu `WebGLFramebuffer`. Implementacja bufora ramki używającego tekstury została zamknięta w klasie [`TexturedFramebuffer`](js/webgl2/TexturedFramebuffer.js).

Tworzenie framebufora z teksturą.

```JS
let framebuffer = new WebGL2.TexturedFramebuffer(gl);
```

Za aktualizację mapy feromonów odpowiada program [`UpdatePheromoneProgram`](projects/particles/js/UpdatePheromoneProgram.js). Cała logika tego programu zawarta jest w _Fragment Shader_. Następuje w nim rozproszenie feromonu na mapie poprzez rozmycie tekstury filtrem gaussian blur. Następnie odbywa się niewielkie zmniejszenie poziomu feromonu na całej mapie poprzez zmniejszenie intensywności koloru każdego z pikseli tekstury. Aktualizacja mapy feromonu jest więc dwiema prostymi operacjami graficznymi przeprowadzonymi na teksturze.

Aby _Fragment Shader_ działał potrzebny jest jakikolwiek obiekt który będzie renderowany. W tym celu wykorzysano dwa trójkąty wypełniające cały widok.

```JS
let render_plane = WebGL2Helpers.VertexArray.createVertexArray3(gl, WebGL2.Geometry.createRectangleVertices(), render_program);
```

Renderowanie tekstury na bufor ramki (teksturę z nim powiązaną).

```JS
gl.bindVertexArray(render_plane.handle);
gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.input.buffers.framebuffer.texture_handle);
gl.bindFramebuffer(gl.FRAMEBUFFER, particles.vertex_arrays.output.buffers.framebuffer.handle);
gl.drawArrays(gl.TRIANGLES, 0, 6);
```

### Właściwe renderowanie

Poprzednie etapy odbywały się w sposób nie widoczny dla użytkownika. Ostatnim krokiem jest wyrenderowanie tekstury wyjściowej przedstawiającej aktualny poziom feromonów na ekranie.

Program renderujący [`RenderProgram`](projects/particles/js/RenderProgram.js) aby działał również potrzebuje dwóch trójkątów wypełniających cały widok.

```JS
gl.bindVertexArray(render_plane.handle);
```

Wiązanie tekstury która my być wyrenderowana na ekranie.

```JS
gl.bindTexture(gl.TEXTURE_2D, particles.vertex_arrays.output.buffers.framebuffer.texture_handle);
```

Ustawienie buforu ramki na domyślny czyli ekran.

```JS
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
```

Uruchomienie programu renderującego.

```JS
gl.useProgram(render_program.handle);
gl.drawArrays(gl.TRIANGLES, 0, 6);
```
