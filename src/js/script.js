
class Grid {
  constructor(container, options) {
    this.container = container;
    this.options = options;
    this.pageSize = options.pageSize || 5;
    this.currentPage = 1;
    this.filters = {};
    this.filterInputs = {};
    this.enableActions = options.acciones === true;
    this.showPaginator = options.showPaginator !== false; 
    this.render();
  }

  get filteredData() {
    let data = this.options.data;
    for (const field in this.filters) {
      const value = this.filters[field].toLowerCase();
      if (value) data = data.filter(row => row[field].toString().toLowerCase().includes(value));
    }
    return data;
  }

  get paginatedData() {
    if (!this.showPaginator) return this.filteredData;
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  render() {
    const wrapper = document.createElement("div");
    const table = document.createElement("table");
    table.className = "grid";

    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    const thSelect = document.createElement("th"); thSelect.textContent = "Sel"; trHead.appendChild(thSelect);
    this.options.columnDefs.forEach(col => {
      if (col.visible !== false) {
        const th = document.createElement("th");
        th.textContent = col.displayName || col.field;
        th.title = col.headerTooltip || "";
        if (col.enableSorting !== false && this.options.enableSorting) {
          th.addEventListener("click", () => this.sortBy(col.field));
        }
        trHead.appendChild(th);
      }
    });
    if (this.enableActions) { const th = document.createElement("th"); th.textContent = "Acciones"; trHead.appendChild(th); }
    thead.appendChild(trHead);

    const trFilter = document.createElement("tr");
    trFilter.appendChild(document.createElement("td"));
    this.options.columnDefs.forEach(col => {
      if (col.visible !== false) {
        const td = document.createElement("td");
        if (col.enableFiltering !== false && this.options.enableFiltering) {
          const input = document.createElement("input");
          input.className = "filter-input";
          input.placeholder = "Filtrar...";
          input.value = this.filters[col.field] || "";
          input.addEventListener("input", e => { this.filters[col.field] = e.target.value; this.currentPage = 1; this.renderBody(tbody); });
          td.appendChild(input);
          this.filterInputs[col.field] = input;
        }
        trFilter.appendChild(td);
      }
    });
    if (this.enableActions) { trFilter.appendChild(document.createElement("td")); }
    thead.appendChild(trFilter);

    const tbody = document.createElement("tbody");
    this.renderBody(tbody);

    table.appendChild(thead);
    table.appendChild(tbody);
    wrapper.appendChild(table);

    if (this.showPaginator) {
      const paginator = document.createElement("div"); paginator.className = "paginador";
      const btnPrev = document.createElement("button"); btnPrev.textContent = "Anterior";
      btnPrev.addEventListener("click", () => { if(this.currentPage>1){ this.currentPage--; this.renderBody(tbody); this.updatePaginatorInfo(info,btnPrev,btnNext); }});
      const info = document.createElement("span");
      const btnNext = document.createElement("button"); btnNext.textContent = "Siguiente";
      btnNext.addEventListener("click", () => { const totalPages=Math.ceil(this.filteredData.length/this.pageSize); if(this.currentPage<totalPages){ this.currentPage++; this.renderBody(tbody); this.updatePaginatorInfo(info,btnPrev,btnNext); }});
      paginator.appendChild(btnPrev); paginator.appendChild(info); paginator.appendChild(btnNext);
      wrapper.appendChild(paginator);
      this.updatePaginatorInfo(info,btnPrev,btnNext);
    }

    this.container.innerHTML = ""; this.container.appendChild(wrapper);
  }

  renderBody(tbody) {
    tbody.innerHTML = "";
    this.paginatedData.forEach(row => {
      const tr = document.createElement("tr"); tr.className = row.selectedRow ? "selectedRow" : "";
      const tdSelect = document.createElement("td"); const checkbox=document.createElement("input"); checkbox.type="checkbox"; checkbox.checked=row.selectedRow||false;
      tdSelect.appendChild(checkbox); tr.appendChild(tdSelect);

      this.options.columnDefs.forEach(col => {
        if(col.visible!==false){
          const td=document.createElement("td"); td.className=col.cellClass||"";
          if(col.editable){ const input=document.createElement("input"); input.type="text"; input.value=row[col.field]; input.className="cell-input"; input.addEventListener("input", e=>row[col.field]=e.target.value); td.appendChild(input); }
          else td.textContent=row[col.field];
          td.title=typeof col.cellTooltip==="function"? col.cellTooltip({entity:row}): (col.cellTooltip||"");
          tr.appendChild(td);
        }
      });

      if(this.enableActions){
        const td=document.createElement("td");

        const btnDelete=document.createElement("button"); btnDelete.textContent="Eliminar"; btnDelete.className="btn-accion btn-delete";
        btnDelete.addEventListener("click", ()=>{ const index=this.options.data.indexOf(row); if(index>-1) this.options.data.splice(index,1); this.renderBody(tbody); });
        td.appendChild(btnDelete);

        const btnPDF=document.createElement("button"); btnPDF.textContent="PDF"; btnPDF.className="btn-accion btn-pdf";
        btnPDF.addEventListener("click", ()=>alert(`Generar PDF RVA: ${row.ID}`));
        td.appendChild(btnPDF);

        const btnCopy=document.createElement("button"); btnCopy.textContent="Copiar"; btnCopy.className="btn-accion btn-copy";
        btnCopy.addEventListener("click", ()=>{
          if(this.options.destinoGrid){
            const destino=this.options.destinoGrid.options.data;
            const existe=destino.some(r=>r.ID===row.ID);
            if(!existe){ destino.push({...row, selectedRow:false}); this.options.destinoGrid.render(); }
          }
        });
        td.appendChild(btnCopy);

        tr.appendChild(td);
      }

      checkbox.addEventListener("change", e=>{ row.selectedRow=e.target.checked; tr.className=row.selectedRow?"selectedRow":""; });

      tbody.appendChild(tr);
    });
  }

  updatePaginatorInfo(info, btnPrev, btnNext){
    const totalPages=Math.ceil(this.filteredData.length/this.pageSize)||1;
    info.textContent=`Página ${this.currentPage} de ${totalPages}`;
    btnPrev.disabled=this.currentPage===1;
    btnNext.disabled=this.currentPage===totalPages;
  }

  sortBy(field){ this.options.data.sort((a,b)=>{ const valA=a[field].toString().toLowerCase(); const valB=b[field].toString().toLowerCase(); if(valA<valB) return -1; if(valA>valB) return 1; return 0; }); this.render(); }
}

// === Datos iniciales ===
const data = [
  { ID:101, Cliente:"Juan Pérez", Ciudad:"Cumana", selectedRow:true },
  { ID:102, Cliente:"María López", Ciudad:"Carupano", selectedRow:true },
  { ID:103, Cliente:"Carlos García", Ciudad:"Ciuda Bolivar", selectedRow:true },
  { ID:104, Cliente:"Ana Torres", Ciudad:"Maturin", selectedRow:true },
  { ID:105, Cliente:"Luis Fernández", Ciudad:"Porlamar", selectedRow:true }
];

const gridPrincipal=new Grid(document.getElementById("miGrid"), {
  data, columnDefs:[
    { field:"ID", displayName:"ID", cellClass:"celda_BOLD celda_CENT", editable:false, visible:true, enableFiltering:true, enableSorting:true, cellTooltip:true },
    { field:"Cliente", displayName:"Cliente", editable:true, visible:true, enableFiltering:true, enableSorting:true, cellTooltip:true },
    { field:"Ciudad", displayName:"Ciudad", editable:true, visible:true, enableFiltering:true, enableSorting:true, cellTooltip:true }
  ], acciones:true, enableFiltering:true, enableSorting:true, pageSize:4
});

const gridSecundaria=new Grid(document.getElementById("gridDestino"), {
  data:[], columnDefs:[
    { field:"ID", displayName:"ID", cellClass:"celda_BOLD celda_CENT", editable:false, visible:true, enableFiltering:true, enableSorting:true, cellTooltip:true },
    { field:"Cliente", displayName:"Cliente", editable:true, visible:true, enableFiltering:true, enableSorting:true, cellTooltip:true },
    { field:"Ciudad", displayName:"Destino", editable:true, visible:true, enableFiltering:true, enableSorting:true, cellTooltip:true }
  ], acciones:true, showPaginator:true
});
gridPrincipal.options.destinoGrid=gridSecundaria;

// --- Botones ---
document.getElementById("guardarGrid").addEventListener("click", ()=>{
  const seleccionadas=gridPrincipal.options.data.filter(r=>r.selectedRow);
  alert("Guardar seleccionadas:\n"+JSON.stringify(seleccionadas,null,2));
});

document.getElementById("copiarSeleccionadas").addEventListener("click", ()=>{
  const seleccionadas=gridPrincipal.options.data.filter(r=>r.selectedRow);
  seleccionadas.forEach(r=>{
    const existe=gridSecundaria.options.data.some(row=>row.ID===r.ID);
    if(!existe) gridSecundaria.options.data.push({...r, selectedRow:false});
  });
  gridSecundaria.render();
});

document.getElementById("guardarGridDestino").addEventListener("click", ()=>{
  alert("Guardar grid secundaria:\n"+JSON.stringify(gridSecundaria.options.data,null,2));
});

document.getElementById("pushDatos").addEventListener("click", ()=>{
  const n = gridPrincipal.options.data.length;
  for(let i=1;i<=3;i++){
    gridPrincipal.options.data.push({ID:n+i, Cliente:`Cliente ${n+i}`, Destino:`Destino ${n+i}`, selectedRow:false});
  }
  gridPrincipal.render();
});
