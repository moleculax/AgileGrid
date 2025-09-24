/* grid.js - Grid robusto corregido */
(function(){
  function debounce(fn, wait) {
    let t;
    return function(...args){
      clearTimeout(t);
      t = setTimeout(()=>fn.apply(this, args), wait);
    };
  }

  function Grid(container, options = {}) {
    if (!container) throw new Error("Container requerido");
    this.container = container;
    this.options = options;
    this.pageSize = options.pageSize || 5;
    this.currentPage = options.currentPage || 1;
    this.filters = {};         // { field: value }
    this.filterInputs = {};    // referencias a inputs para mantener los valores
    // asegurarnos que options.data existe
    this.options.data = Array.isArray(this.options.data) ? this.options.data : [];
    // asegurarse flags por fila
    this.options.data.forEach(r => {
      if (typeof r.selectedRow === 'undefined') r.selectedRow = false;
      if (typeof r._editing === 'undefined') r._editing = false;
    });
    this.render();
  }

  // Filtrado aplica sobre options.data (fuente de la verdad)
  Grid.prototype.filteredData = function(){
    let data = this.options.data.slice();
    for (const f in this.filters) {
      const v = (this.filters[f] || "").toString().toLowerCase();
      if (!v) continue;
      data = data.filter(row => (row[f] ?? "").toString().toLowerCase().includes(v));
    }
    return data;
  };

  Grid.prototype.paginatedData = function(){
    const filtered = this.filteredData();
    if (this.options.showPaginator === false) return filtered;
    const totalPages = Math.max(1, Math.ceil(filtered.length / this.pageSize));
    // ajustar currentPage si fuera necesario
    if (this.currentPage > totalPages) this.currentPage = totalPages;
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  };

  Grid.prototype.render = function(){
    // limpiar container
    this.container.innerHTML = '';
    const cols = this.options.columnDefs || [];

    const table = document.createElement('table');
    table.className = 'table table-bordered table-hover';

    // THEAD - headers
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');
    cols.forEach(col => {
      if (col.visible === false) return;
      const th = document.createElement('th');
      th.textContent = col.displayName || col.field;
      th.style.verticalAlign = 'middle';
      trHead.appendChild(th);
    });
    if (this.options.acciones) {
      const th = document.createElement('th');
      th.textContent = this.options.accionesHeaderText || 'Acciones';
      trHead.appendChild(th);
    }
    thead.appendChild(trHead);

    // Fila de filtros (si habilitado)
    if (this.options.enableFiltering) {
      const trFilter = document.createElement('tr');
      cols.forEach(col => {
        if (col.visible === false) return;
        const td = document.createElement('td');
        if (col.enableFiltering !== false && col.field !== 'acciones') {
          const input = document.createElement('input');
          input.type = 'text';
          input.className = 'form-control form-control-sm';
          input.placeholder = 'Filtrar...';
          input.value = this.filters[col.field] || '';
          // debounce al 220ms
          input.addEventListener('input', debounce((e) => {
            this.filters[col.field] = e.target.value;
            this.currentPage = 1;
            this.render();
          }, 220));
          td.appendChild(input);
          this.filterInputs[col.field] = input;
        }
        trFilter.appendChild(td);
      });
      if (this.options.acciones) trFilter.appendChild(document.createElement('td'));
      thead.appendChild(trFilter);
    }

    table.appendChild(thead);

    // TBODY - filas
    const tbody = document.createElement('tbody');
    const rows = this.paginatedData();
    rows.forEach(row => {
      const tr = document.createElement('tr');
      tr.dataset.id = row.ID;
      if (row.selectedRow) tr.classList.add('table-success');

      // columnas
      cols.forEach(col => {
        if (col.visible === false) return;
        const td = document.createElement('td');
        td.className = 'celda';
        // editable inline: si row._editing y col.editable => input
        if (row._editing && col.editable) {
          const inp = document.createElement('input');
          inp.type = 'text';
          inp.className = 'form-control form-control-sm';
          inp.value = row[col.field] ?? '';
          // actualizar inmediatamente en options.data
          inp.addEventListener('input', (e) => {
            const master = this.options.data.find(r => r.ID === row.ID);
            if (master) master[col.field] = e.target.value;
          });
          td.appendChild(inp);
        } else {
          td.textContent = row[col.field] ?? '';
        }
        tr.appendChild(td);
      });

      // acciones por fila
      if (this.options.acciones) {
        const td = document.createElement('td');

        // Seleccionar (botón toggle)
        if (this.options.acciones.seleccionar?.visible !== false) {
          const btnSel = document.createElement('button');
          btnSel.className = row.selectedRow ? 'btn btn-sm btn-primary me-1 selected-btn' : 'btn btn-sm btn-outline-primary me-1 selected-btn';
          btnSel.textContent = row.selectedRow ? 'Deseleccionar' : 'Seleccionar';
          btnSel.addEventListener('click', () => {
            const master = this.options.data.find(r => r.ID === row.ID);
            if (master) master.selectedRow = !master.selectedRow;
            this.render();
          });
          td.appendChild(btnSel);
        }

        // Editar/Guardar toggle
        if (this.options.acciones.editar?.visible !== false) {
          const btnEdit = document.createElement('button');
          btnEdit.className = row._editing ? 'btn btn-sm btn-success me-1' : 'btn btn-sm btn-info me-1';
          btnEdit.textContent = row._editing ? 'Guardar' : 'Editar';
          btnEdit.addEventListener('click', () => {
            const master = this.options.data.find(r => r.ID === row.ID);
            if (!master) return;
            // si estaba editando, al guardar simplemente salir edición (los inputs ya actualizaron el master)
            master._editing = !master._editing;
            this.render();
          });
          td.appendChild(btnEdit);
        }

        // Copiar
        if (this.options.acciones.copiar?.visible !== false) {
          const btnCopy = document.createElement('button');
          btnCopy.className = 'btn btn-sm btn-primary me-1';
          btnCopy.textContent = 'Copiar';
          btnCopy.addEventListener('click', () => {
            const fila = this.options.data.find(r => r.ID === row.ID);
            if (!fila) return;
            if (!this.options.destinoGrid) return alert('No hay grid destino configurado.');
            const destino = this.options.destinoGrid.options.data;
            if (!destino.some(r => r.ID === fila.ID)) {
              destino.push(Object.assign({}, fila, { selectedRow:false, _editing:false }));
              // opcional: actualizar destino.dataOriginal si existiera
              if (Array.isArray(this.options.destinoGrid.options.dataOriginal)) {
                this.options.destinoGrid.options.dataOriginal = this.options.destinoGrid.options.data.slice();
              }
              this.options.destinoGrid.render();
            } else {
              // ya existe, opcional: notificar
            }
          });
          td.appendChild(btnCopy);
        }

        // PDF
        if (this.options.acciones.pdf?.visible !== false) {
          const btnPDF = document.createElement('button');
          btnPDF.className = 'btn btn-sm btn-danger me-1';
          btnPDF.textContent = 'PDF';
          btnPDF.addEventListener('click', () => {
            const fila = this.options.data.find(r => r.ID === row.ID);
            if (!fila) return;
            if (!window.jspdf) {
              alert('jsPDF no cargado. Incluye jsPDF para exportar PDF.');
              return;
            }
            try {
              const { jsPDF } = window.jspdf;
              const doc = new jsPDF();
              const lines = JSON.stringify(fila, null, 2).split('\n');
              let y = 10;
              lines.forEach(line => {
                doc.text(line, 10, y);
                y += 7;
              });
              doc.save(`registro_${fila.ID}.pdf`);
            } catch (e) {
              console.error(e);
              alert('Error generando PDF.');
            }
          });
          td.appendChild(btnPDF);
        }

        // Eliminar
        if (this.options.acciones.eliminar?.visible !== false) {
          const btnDel = document.createElement('button');
          btnDel.className = 'btn btn-sm btn-warning';
          btnDel.textContent = 'Eliminar';
          btnDel.addEventListener('click', () => {
            this.options.data = this.options.data.filter(r => r.ID !== row.ID);
            // si existe dataOriginal, sincronizar
            if (Array.isArray(this.options.dataOriginal)) {
              this.options.dataOriginal = this.options.data.slice();
            }
            // ajustar pagina
            const totalPages = Math.max(1, Math.ceil(this.filteredData().length / this.pageSize));
            if (this.currentPage > totalPages) this.currentPage = totalPages;
            this.render();
          });
          td.appendChild(btnDel);
        }

        tr.appendChild(td);
      }

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);

    // Contenedor y paginador
    const wrapper = document.createElement('div');
    wrapper.appendChild(table);

    if (this.options.showPaginator !== false) {
      const totalPages = Math.max(1, Math.ceil(this.filteredData().length / this.pageSize));
      const pag = document.createElement('div');
      pag.className = 'd-flex justify-content-between align-items-center mt-2';

      const left = document.createElement('div');
      const btnPrev = document.createElement('button');
      btnPrev.className = 'btn btn-sm btn-outline-secondary me-2';
      btnPrev.textContent = 'Anterior';
      btnPrev.disabled = this.currentPage <= 1;
      btnPrev.addEventListener('click', () => {
        if (this.currentPage > 1) { this.currentPage--; this.render(); }
      });
      left.appendChild(btnPrev);

      const btnNext = document.createElement('button');
      btnNext.className = 'btn btn-sm btn-outline-secondary';
      btnNext.textContent = 'Siguiente';
      btnNext.disabled = this.currentPage >= totalPages;
      btnNext.addEventListener('click', () => {
        if (this.currentPage < totalPages) { this.currentPage++; this.render(); }
      });
      left.appendChild(btnNext);

      const center = document.createElement('div');
      center.textContent = `Página ${this.currentPage} de ${totalPages}`;

      pag.appendChild(left);
      pag.appendChild(center);

      wrapper.appendChild(pag);
    }

    // Guardar Grid global (envía al DAO)
    if (this.options.guardarBtn) {
      const btnSave = document.createElement('button');
      btnSave.className = 'btn btn-success mt-3';
      btnSave.textContent = 'Guardar Grid';
      btnSave.addEventListener('click', () => this.guardarGrid());
      wrapper.appendChild(btnSave);
    }

    // render
    this.container.appendChild(wrapper);
  };

  // enviar al DAO (POST JSON) o mostrar en consola si daoUrl no configurado
  Grid.prototype.guardarGrid = async function(){
    const datos = this.options.data;
    if (this.options.daoUrl) {
      try {
        const res = await fetch(this.options.daoUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(datos)
        });
        if (!res.ok) {
          const txt = await res.text();
          alert('Error guardando: ' + res.status + ' - ' + txt+ ' '+JSON.stringify(datos));
          return;
        }
        const txt = await res.text();
        alert('DAO respondió: ' + txt);
      } catch (err) {
        console.error(err);
        alert('Error comunicándose con DAO: ' + err.message);
      }
    } else {
      console.log('Datos a enviar al DAO:', datos);
      alert('daoUrl no configurado. Revisa consola para datos JSON.');
    }
  };

  window.Grid = Grid;
})();
