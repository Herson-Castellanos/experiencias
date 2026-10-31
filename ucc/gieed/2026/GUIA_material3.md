# Guía para crear un curso con diseño Material 3 (material3)

Resume lo que se usa para construir un curso con el diseño del sitio **Archivo_material3**: estilos, arquitectura, lógica de comportamiento, reglas de contenido y cómo se traslada a Moodle. Está escrita para quien vaya a replicar el diseño en otro curso, o para una sesión nueva de Claude Code que no conozca el proyecto.

Estado al 26 de octubre de 2026. Los porcentajes, fechas y textos del curso «Gestión de la Innovación Educativa en la Era Digital» son del ejemplo; lo reutilizable es la estructura.

---

## 1. Qué es y de dónde sale cada cosa

| Pieza | Dónde está | Qué aporta |
|---|---|---|
| **Sitio de referencia** | `C:\Users\br19n\Desktop\Archivo_material3` | Diseño Material 3: CSS, componentes HTML y JS. HTML, CSS y JS puros, sin framework ni compilación. |
| **Reglas de contenido** | `C:\Users\br19n\Documents\Obsidian Vault\ICC` | Cómo se redactan introducciones, objetivos, instrumentos, escalas y referencias (ver §7). |
| **Moodle local** | `C:\Users\br19n\Desktop\MoodleWindowsInstaller-latest-501` | Moodle 5.1.8 con Apache y MariaDB propios. Aquí vive el curso real. |
| **Fuente de las maquetas del curso Moodle** | `C:\Users\br19n\Documents\moodle\moodle\diseno\maqueta_*.html` | De ahí se generan los «landings» que carga Moodle (ver §8). |

Regla de trabajo acordada: del sitio **solo se toman los estilos y las instrucciones de creación**. El contenido de un curso nuevo sale de ese curso, no del sitio.

---

## 2. Arquitectura del sitio de referencia

```
Archivo_material3/
├── index.html                  Bienvenida (video + mensaje, acompañante, unidades temáticas, contacto, material)
├── dinamica.html               Dinámica de trabajo (comunicación, Telegram, lineamientos, agenda, acreditación, evaluación…)
├── sesiones.html               Índice de sesiones
├── sesion_01.html … 05.html    Una página por sesión (solo la 01 visible en el menú)
├── participaciones.html        Índice de foros
├── foro_01.html … 05.html      Un foro por página
├── evidencias.html             Índice de actividades
├── actividad_01.html … 05.html Una actividad por página
├── sitemap.xml · robots.txt
└── assets/
    ├── m3/css/   00-tokens · 10-base · 15-iconos · 20-components · 30-layout · 40-pages · 50-motion · 60-paleta-prueba
    ├── m3/js/    m3.js (único archivo, ~46 KB)
    ├── images/   ilustraciones .webp/.svg (muchas con fondo transparente), logos de la UCC, favicon
    ├── fuentes/  roboto.woff2
    └── files/    PDFs y presentaciones descargables
```

### Anatomía de una página (igual en todas)

1. `<head>`: etiqueta de Google Analytics, metadatos y Open Graph, `canonical`, favicon, siete CSS en orden numérico y un script en línea que aplica las preferencias guardadas **antes** del primer pintado (tema, movimiento, tamaño de texto, menú oculto, modo incrustado).
2. `nav.nav-drawer`: menú lateral con cuatro grupos (Experiencia de aprendizaje · Sesiones · Participaciones · Evidencias). El elemento activo lleva `aria-current="page"`.
3. `header.app-bar`: barra superior con botón de menú, marca, contexto de la página y botón de Telegram. El JS agrega aquí el interruptor de tema y el botón de preferencias.
4. `main#contenido` → `.page-layout > .page-col > .page` con las secciones de la página.
5. Insignia HTML5 (W3C), `footer.footer` (logo, navegación, sitios de interés, contacto, licencia CC0).
6. `nav.nav-primary`: barra inferior en móvil y riel en pantalla media. Se usa un solo elemento para las dos formas.
7. `div.scrim` y `<script src="assets/m3/js/m3.js" defer>`.

### Tipos de página y secciones que llevan

| Tipo | Secciones (en orden) |
|---|---|
| **Sesión** | Banner con fecha, hora y modalidad → Introducción (video + texto) → Activación de recursos previos (videos) → Evidencias de aprendizaje (tarjetas a foro y actividad) → Fuentes de información (APA 7) → Video sugerido → Paginador |
| **Foro / Actividad** | Banner → Introducción (pregunta + 2–3 párrafos + tarjeta «En esta actividad») → Instrucción (texto + cuenta regresiva) → Procedimiento (pasos) → Fuentes → Instrumento de evaluación → Escala de desempeño → Entregas tardías → Paginador |
| **Índice (sesiones, foros, actividades)** | Banner → tarjetas de acceso (`.hub-grid`) |
| **Dinámica** | Contexto → Comunicación → Telegram/QR → Lineamientos → Documentos → Agenda → Servicios escolares → Acreditación → Evaluación → Recomendaciones → Ubicación |

**Menú lateral.** Se repite completo en cada archivo. Un cambio de navegación implica editar todas las páginas (en este proyecto se hizo con un script de Python que regenera el bloque). Las páginas ocultas siguen existiendo; solo se quitan del menú y del `sitemap.xml`.

---

## 3. Estilos

### 3.1 Capas de CSS (se cargan en este orden)

| Archivo | Contenido |
|---|---|
| `00-tokens.css` | Variables de color M3, formas, elevación, movimiento, tipografía, geometría, escala tipográfica. Tema oscuro automático y forzado. |
| `10-base.css` | Reinicio, tipografía, enlaces, enfoque, utilidades. Escala de texto: `html[data-text="large"]` = 112.5 %, `xlarge` = 125 %. |
| `15-iconos.css` | Íconos Material Symbols como **máscaras CSS**: `<i class="icon i-nombre"></i>` toma el color del texto. |
| `20-components.css` | Botones, chips, tarjetas, listas, pestañas, acordeón, progreso, campos de texto, callouts, snackbar, diálogos, botones segmentados, casilla tipo fila. |
| `30-layout.css` | Barra superior, cajón/riel/barra inferior, contenedor de página, paginador, pie, volver arriba, modo incrustado. |
| `40-pages.css` | Héroe, video, agenda, barra de porcentajes, hubs, cuenta regresiva, pasos, instrumento, escala, penalización, fuentes APA, paginador bloqueado. |
| `50-motion.css` | Aparición al desplazarse, entradas, barras que se llenan, transiciones entre páginas, cambio de tema con círculo, movimiento reducido, impresión. |
| `60-paleta-prueba.css` | Paleta azul/gris definitiva (anula los tokens morados originales), logos, insignia, mezclas de imágenes. |

### 3.2 Paleta

Tres colores de partida, tomados del logo de la UCC: azul `rgb(0, 126, 174)`, gris `rgb(101, 101, 102)` y blanco. De ahí:

| Rol | Claro | Oscuro |
|---|---|---|
| `--md-primary` | `#007eae` | `#80d0f4` |
| `--md-primary-container` | `#cdeaf7` | `#004c6b` |
| `--md-secondary` | `rgb(101,101,102)` | `#c9c9cb` |
| `--md-tertiary` | `#3b7389` | `#a3cde0` |
| `--md-surface` | `#ffffff` | `#101415` |
| Superficies tonales | `#f5f9fb` → `#e1e8ec` | `#181c1e` → `#323638` |

Degradados reutilizables: `--grad-primario` (azul claro → azul profundo, 135°), `--grad-hero` (azul muy claro → gris), `--grad-suave` (blanco → gris azulado). Se aplican a banner, botones rellenos, fechas de la agenda, paneles, menú y pie.

### 3.3 Tipografía, forma, elevación y movimiento

- **Fuente:** Roboto (`assets/fuentes/roboto.woff2`, peso variable). Toda la tipografía está en `rem`.
- **Escala M3:** `.display-*`, `.headline-*`, `.title-*`, `.body-*`, `.label-*`.
- **Forma:** `--md-shape-xs` 4 px … `xl` 28 px, `xxl` 40 px, `full` 999 px. Tarjetas y paneles redondeados; botones en píldora.
- **Elevación:** `--md-elev-1` a `--md-elev-5` (sombras M3).
- **Movimiento:** curvas `--md-ease-standard`, `emphasized`, `emphasized-decel`; duraciones `short1` 50 ms a `long4` 600 ms. Capas de estado: hover 8 %, foco/presionado 10 %, arrastre 16 %.
- **Geometría:** barra superior 64 px, cajón 320 px, riel 88 px, barra inferior 80 px, ancho de contenido 1120 px, márgenes 16/24/32 px.

### 3.4 Clases de ventana (adaptativo)

| Ancho | Navegación |
|---|---|
| < 600 px | Barra inferior; el menú es un cajón modal con `scrim`. |
| 600–1099 px | Riel lateral de 88 px. |
| ≥ 1100 px | Cajón estándar permanente (`position: sticky; inset: auto; top: 0`, alto 100vh). Se puede ocultar con el botón `data-nav-collapse` (clase `nav-collapsed`, guarda `dava-menu`). |
| ≥ 1560 px | Aparece el índice «En esta página» a la derecha. |

### 3.5 Catálogo de componentes (HTML que se reutiliza)

| Componente | Marcado base |
|---|---|
| Botón | `a/button.btn.btn--filled|tonal|text|elevated` + `.btn__label`; `--lg` para tamaño grande |
| Chip | `.chip`, `.chip--primary|tonal|tertiary|success|error`, `.chip--pill` |
| Tarjeta | `.card.card--filled|outlined|tonal|interactive`, `.card__media/__body/__title/__text/__actions` |
| Hub de acceso | `.hub-grid > a.card.hub-card` |
| Héroe | `header.hero.hero--compact|solo|task|secondary|tertiary` con `.hero__body`, `.hero__title`, `.hero__facts`, `.hero__media--plain` |
| Sección | `section.section[data-toc]` con `.section__head > .eyebrow + .section__title + .section__lead`; `.section--panel` para fondo tonal |
| Dos columnas | `.split` (`--wide-left`, `--wide-right`, `--center`, `--sticky`) |
| Video | `div.video[data-video="ID"][data-title]` (el reproductor se carga al pulsar) |
| Agenda | `ol.agenda > li.agenda__item > .agenda__date + article.agenda__card` |
| Barra de porcentajes | `.weights` con `.weights__seg--1…n` y `.weights__legend` |
| Pasos | `ol.steps[data-steps] > li.step[data-n] > h3.step__title + .step__body`; `.steps__phase` separa fases |
| Cuenta regresiva | `.deadline[data-deadline="AAAA/MM/DD"]` con `.deadline__head` y `.deadline__date` |
| Instrumento | `.criteria[data-criteria] > .criteria-grid > article.criteria-group[data-points] > h3.criteria-group__title + ul.criteria-group__list > li` |
| Escala | `.scale > article.level.level--1…4` con `.level__head`, `.level__pct`, `.level__bar`, `.level__text` |
| Penalización | `.penalty` con `.penalty__rule` y `.penalty__media` |
| Fuentes APA 7 | `.refs > p` (sin numeración, sangría francesa de 48 px); para listas numeradas antiguas: `ol.sources > li.source` |
| Avisos | `.callout.callout--note|tip|warn|ok` |
| Acordeón | `details.acc > summary.acc__summary + .acc__body` |
| Paginador | `nav.pager > a.pager__link--prev|next`; bloqueado con `aria-disabled="true"` sin `href` |
| Tarjeta de reglas / requisitos | `.rule`, `.req`, `.doc`, `.platform`, `.qr`, `.share`, `.banner`, `.tabs` |

---

## 4. Lógica (`assets/m3/js/m3.js`)

Un solo IIFE sin dependencias. Secciones en orden:

| Módulo | Qué hace | Se activa con |
|---|---|---|
| Altura para iframe | Avisa la altura al contenedor (`postMessage`) | automático |
| Elementos por script | Agrega interruptor de tema, botón y diálogo de preferencias, snackbar, botón «volver arriba», índice «En esta página», navegación incrustada | automático |
| Preferencias | Tema (claro/oscuro/sistema), animaciones, tamaño de texto; el cambio de tema usa `startViewTransition` | diálogo «Preferencias» |
| Diálogos | Abre/cierra `<dialog>`; cierra con clic fuera | `data-dialog-open`, `data-dialog-close` |
| Ondas (ripple) | Ola al presionar | automático |
| Barra superior y cajón | Sombra al desplazarse, barra de lectura, cajón modal con atrapa-foco, ocultar el menú en pantalla ancha | `data-nav-toggle`, `data-nav-close`, `data-nav-collapse` |
| Pestañas | Pestañas con indicador, teclado | `.tabs` |
| Copiar | Copia al portapapeles con aviso | `data-copy`, `data-copy-msg` |
| Cuenta regresiva | Rodillos de dígitos; chip de estado (más de 7 días, menos de 7, horas, minutos, vencido) | `[data-deadline]` |
| Video | Carga el iframe de YouTube al pulsar | `.video[data-video]` |
| Marcos externos | Mapa, encuesta | `.embed[data-src]` |
| Pasos | Progreso guardado por paso | `[data-steps]` |
| Instrumento | Casillas, conteo y barra, reinicio, guardado | `[data-criteria]` |
| Formularios | Validación y envío | `form[data-formoid]` |
| Aparición suave | Entrada al desplazarse | clases en `50-motion.css` |
| Sección activa | Resalta en «En esta página»; al llegar al final marca la última sección | automático |
| Enlaces internos | Abre acordeones y pestañas cuando un enlace apunta dentro | automático |

**Almacenamiento local:** `dava-tema`, `dava-movimiento`, `dava-texto`, `dava-menu` y, por página, `dava:<página>:criterios` y avance de pasos. Los nombres conservan el prefijo `dava-` del curso anterior; si se renombran, hay que cambiarlos también en el script de `<head>`.

### Reglas de la cuenta regresiva

- `data-deadline="AAAA/MM/DD"` cuenta hasta las **00:00 de ese día**.
- Para que la entrega cierre «a las 12 de la noche» del día publicado, el día visible es uno antes: se muestra «28 de Octubre» y `data-deadline="2026/10/29"`.
- La fecha visible va en `.deadline__date`; la escribe a mano quien arma la página.

### Reglas de calendario

- Semana 1 = del sábado de la sesión 1 al viernes siguiente; «domingo de la semana 2» es el domingo posterior a la sesión 2.
- Una sola actividad o foro por semana; nunca más de dos semanas seguidas sin entrega.

---

## 5. Imágenes y logos

- Las ilustraciones se usan **sin fondo** (PNG/WebP con transparencia) para que se fundan con la tarjeta o el banner. Procedimiento: eliminar el fondo plano conectado con los bordes y suavizar el contorno; para ilustraciones con manchas pastel sobre blanco, convertir el blanco en transparencia gradual (conserva las manchas como semitransparentes). Recortar el espacio vacío y actualizar `width`/`height` en el HTML.
- Si una imagen debe quedar con fondo blanco, se usa `mix-blend-mode: multiply` en modo claro y se desactiva en modo oscuro.
- El tamaño real de la ilustración del banner lo manda la **columna** del héroe (en `hero--compact`, ≈ 30 % del ancho), no `max-width`. Para ajustarla se usa `width: N %`.
- Logos: escudo de la UCC en barra y menú; logo completo en el pie; favicon 64 px y `apple-touch-icon` 180 px con fondo blanco. En modo oscuro llevan un fondo blanco detrás.

---

## 6. Piezas de cierre de cada página

- Etiqueta de Google Analytics (`G-P9P824DFV7`) al inicio del `<head>`.
- Insignia HTML5 del W3C antes del pie.
- Pie con licencia CC0 1.0 (`.cc-nowrap` mantiene texto e íconos en una línea).
- `canonical` y `og:url` en `https://herson-castellanos.github.io/experiencias/ucc/gieed/2026/…`.
- `sitemap.xml` y `robots.txt` al día con las páginas visibles.

---

## 7. Reglas de contenido (memoria de Obsidian)

Provienen de las notas `Proceso de conversión de cursos ICC`, `Instrumento de evaluación interactivo`, `Metodología de objetivos y evaluación (Tobón)` y `Cacofonía en la redacción`.

**Redacción**
- Segunda persona del singular (tú). Incisos con guion largo, nunca paréntesis.
- «experiencia de aprendizaje» (no «curso»), «módulo» o «sesión» según el curso, «Docente Digital» (no facilitador).
- Evitar cacofonía: cadenas de «que», -ción/-miento repetidos, «de… de… de», «con… con base en».
- Lenguaje académico, sin personificaciones.

**Introducción de una actividad o sesión**
1. Segunda persona, 2–3 párrafos, sin subencabezados.
2. Discursiva: explica por qué existe la tarea y qué pone en juego; no lista lo que «harás».
3. Sin verbos de objetivo (conocer, identificar, analizar…).
4. Sin cita del objetivo, sin porcentajes ni fechas (van en «Instrucción»).

**Objetivos (fórmula de Tobón):** verbo de desempeño (uno, futuro, segunda persona) + objeto de conocimiento + problema del contexto real + criterio de idoneidad. El nivel taxonómico sigue el momento del curso (inicial → resolutivo, intermedio → autónomo, cierre → estratégico).

**Instrumento de evaluación**
- Lista de cotejo (criterios binarios) o rúbrica (grados de logro).
- Criterios derivados del objetivo; cada uno es un enunciado verificable.
- Puntos enteros; **cada criterio de fondo debe superar la suma de los de forma**, con el entero mínimo posible.
- Texto estándar bajo la tabla: «Nota» (el puntaje es autoevaluación; revisa el Docente Digital) y «Calificación» (los N aspectos deben cumplirse para el % completo).

**Escala de desempeño**
- Cuatro niveles; el nivel superior muestra un valor único, no un rango; rangos sin huecos ni traslapes; cada banda debe ser alcanzable considerando los criterios obligatorios.
- Un porcentaje fijo por nivel; texto del nivel superior inicia con «¡Felicidades!»; los mensajes validan el esfuerzo antes de señalar lo que falta.

**Fuentes:** APA 7, orden alfabético, sin numeración, sangría francesa, enlaces activos; sufijos a/b cuando coinciden autor y año.

---

## 8. Traslado a Moodle (curso real)

### 8.1 Cómo guarda Moodle el contenido

- Las etiquetas de cada sección llevan solo un código: `{icc:pregrado/LIEDEA/propedeutico/PROPICC-EXP/landing/centro}`.
- El filtro `filter_iccembed` lo convierte en un contenedor y `loader.js` carga `/cursos/<ruta>.html` dentro de la página (sin iframe), junto con su CSS y JS.
- Los archivos están en `server\public\cursos\…\landing\`: `centro.html`, `presentacion.html`, `semana1.html`, `semana2.html`, más `icc-m3.css`, `icc-m3.js`, `imagenes\` y `fuentes\`.
- Los enlaces a actividades usan `data-icc-act` y `data-icc-sec`; el cargador los traduce a las URL del curso en cada réplica. El avance se guarda por curso.
- Los landings se **generan** desde `Documents\moodle\moodle\diseno\maqueta_*.html` (el encabezado dice «no editar a mano»).

### 8.2 Estilo en Moodle: tokens `--icc-*`

El CSS de los landings (`icc-m3.css`) ya está parametrizado con variables. El diseño del sitio se aplica sobreescribiendo esas variables y ajustando componentes en una hoja posterior, sin tocar HTML ni JS:

| Token ICC | Equivalencia del sitio |
|---|---|
| `--icc-primary` / `--icc-on-primary` | `--md-primary` / `--md-on-primary` (`#007eae` / blanco) |
| `--icc-container` / `--icc-on-container` | `--md-primary-container` / `--md-on-primary-container` |
| `--icc-surface`, `-1`, `-2`, `-3` | `--md-surface` y los contenedores tonales |
| `--icc-on`, `--icc-on-var` | `--md-on-surface`, `--md-on-surface-variant` |
| `--icc-outline`, `--icc-outline-var` | `--md-outline`, `--md-outline-variant` |
| `--icc-elev-1`, `--icc-elev-3` | `--md-elev-1`, `--md-elev-3` |

Archivo: `PROPICC-EXP-M3\landing\m3-sitio.css`, que se agrega con un segundo `<link>` después de `icc-m3.css`.

Cuidados de especificidad: el CSS original usa `!important` para el color del texto (`--icc-c`) y en el botón de tema; la hoja nueva repite `!important` en esos mismos puntos.

### 8.3 Crear el curso copia (procedimiento comprobado)

1. **Ubicar Moodle:** carpeta `…\MoodleWindowsInstaller-latest-501\server`. PHP: `server\php\php.exe`. Scripts CLI: `server\admin\cli\`. El `id` de `section.php?id=N` es una **sección**, no un curso: se obtiene el curso con `course_sections.id = N`.
2. **Categoría:** crear `material3` con `core_course_category::create()` desde un script PHP (`define('CLI_SCRIPT', true); require config.php`).
3. **Respaldo del original (solo lectura):** `php admin\cli\backup.php --courseid=<id> --destination=<carpeta>`.
4. **Restaurar en la categoría:** `php admin\cli\restore_backup.php --file=<archivo.mbz> --categoryid=<id>`. Devuelve el id del curso nuevo.
5. **Carpeta de landings de la copia:** copiar `PROPICC-EXP` a `PROPICC-EXP-M3` dentro de `server\public\cursos\…\propedeutico\`.
6. **Apuntar las etiquetas del curso copia** a la carpeta nueva (`UPDATE label SET intro = REPLACE(intro, 'PROPICC-EXP/landing/', 'PROPICC-EXP-M3/landing/')` por la API de Moodle) y reconstruir caché (`rebuild_course_cache`).
7. **Aplicar el diseño** a cada landing: enlazar `m3-sitio.css`, corregir rutas absolutas de imágenes (p. ej. la del árbol en `centro.html`) y verificar en tema claro y oscuro.
8. **Verificar:** abrir el landing suelto en un navegador sin ventana (para capturas) y luego en el curso con sesión iniciada.

### 8.4 Lo que NO se debe hacer

- No sobrescribir el contenido de la copia con el del sitio: la copia conserva el contenido del curso original; del sitio solo viene el diseño.
- No modificar el curso original ni sus landings (`PROPICC-EXP`).
- No editar a mano los archivos generados si existe la maqueta fuente, salvo acuerdo.

### 8.5 Pendiente en Moodle

- Aplicar `m3-sitio.css` a `presentacion`, `semana1` y `semana2` (revisar sus componentes propios: pestañas, instrumentos, escalas).
- Revisar en el curso copia (con sesión) el árbol de avance y los acentos: en la prueba suelta aparecen sin imagen y con mojibake porque el filtro carga el HTML como UTF-8 y la prueba no.
- Rúbricas, ponderaciones y libro de calificaciones: no se configuraron.

---

## 9. Lista de verificación para un curso nuevo

- [ ] Carpeta de páginas con las siete capas de CSS y `m3.js`.
- [ ] Menú lateral con solo lo visible; `aria-current` correcto en cada página.
- [ ] Fechas visibles y `data-deadline` coherentes (día visible + 1 a las 00:00).
- [ ] Introducciones sin verbos de objetivo, sin porcentajes ni fechas.
- [ ] Instrumento: fondo > Σ forma, puntos enteros, escala sin huecos.
- [ ] Fuentes en APA 7, orden alfabético, sin numeración.
- [ ] Imágenes con fondo transparente o fundidas con su contenedor; `width`/`height` actualizados.
- [ ] Paleta y logos aplicados en todas las páginas.
- [ ] `sitemap.xml`, `canonical` y pie con la URL definitiva.
- [ ] Verificación en navegador: sin errores en consola, navegación y botones probados.
- [ ] En Moodle: copia limpia, etiquetas apuntando a la carpeta M3, tema claro/oscuro revisados.
