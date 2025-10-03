# AgileGrid (Proyecto UiGrid Generica)

![Descripción de la imagen](https://github.com/moleculax/AgileGrid/blob/main/pantalla.png)

**AgileGrid** es un proyecto de grilla dinámica y modular en JavaScript puro, inspirado en la filosofía de UI-Grid de AngularJS, pero **sin depender de frameworks**. Permite mostrar, filtrar, paginar y manipular datos en tablas de manera sencilla, con soporte para acciones personalizadas y grids secundarias.

![javaScript](https://img.shields.io/badge/java-Script-blue?logo=javascript&logoColor=white)
![NeuroCode](https://img.shields.io/badge/Moleculax-AgileGrid-red?logo=moleculax&logoColor=white)


## Características

- Grid principal y secundaria.
- Selección de filas (`checkbox`) con cambio de color.
- Filtros por columna.
- Paginación configurable para la grid principal.
- Botones por fila: `Eliminar`, `Copiar` y `PDF`.
- Previene duplicados al copiar filas a la grid secundaria.
- Botones globales para `Guardar` datos de grids.
- Añadir datos dinámicamente a la grid principal (`push`).
- Separación completa de HTML, CSS y JS para fácil integración.

## Instalación

Abrir `index.html` en cualquier navegador moderno.

## Uso

**Grid Principal:**  
Permite seleccionar filas, copiar a la grid secundaria, eliminar y generar PDF (simulado con alert). Incluye paginación y filtros.

**Grid Secundaria:**  
Solo muestra filas copiadas desde la principal. Se pueden eliminar filas y guardar los datos.

**Botones globales:**  
- `Guardar Grid Principal`: guarda solo las filas seleccionadas.  
- `Guardar Grid Secundaria`: guarda todas las filas de la grid secundaria.  
- `Push Datos a Principal`: agrega una nueva fila a la grid principal.

## Archivos del proyecto

- `index.html` → Contenedor de grids y botones.  
- `style.css` → Estilos de las grids, filtros, paginador y botones.  
- `AgileGrid.js` → Clase modular y reutilizable de la grid.  
- `README.md` → Documentación del proyecto.

## Integración en otros proyectos

Puedes instanciar la clase `AgileGrid` en cualquier proyecto, pasando:

```
Ejecute servidor virtual en caso de no tener apache:

python3 -m http.server 2020

Luego
http://localhost:2020
```

Blog [http://moleculax.blogspot.com](https://moleculax.blogspot.com) 
```
Emilio JGomez
Cumana Sucre - Venezuela
```
