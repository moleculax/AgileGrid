// initGrid.js
(async function(){
  try {
    const resp = await fetch('src/js/datos.json');
    if (!resp.ok) throw new Error('datos.json no encontrado: ' + resp.status);
    const datos = await resp.json();

    // asegurarse flags por fila
    datos.forEach(d => { if (typeof d.selectedRow === 'undefined') d.selectedRow = false; if (typeof d._editing === 'undefined') d._editing = false; });

    const gridPrincipal = new Grid(document.getElementById('miGrid'), {
      data: [...datos],
      dataOriginal: [...datos], // opcional, se mantiene para otras necesidades
      columnDefs: [
        { field: 'ID', displayName: 'ID', editable: false, visible: true },
        { field: 'Cliente', displayName: 'Cliente', editable: true, visible: true },
        { field: 'Ciudad', displayName: 'Ciudad', editable: true, visible: true }
      ],
      acciones: {
        seleccionar: { visible: true },
        editar: { visible: true },
        copiar: { visible: true },
        pdf: { visible: true },
        eliminar: { visible: true }
      },
      guardarBtn: true,
      daoUrl: '/guardarGridPrincipal', // <- cambia por tu endpoint real
      pageSize: 4,
      enableFiltering: true,
      showPaginator: true
    });

    const gridSecundaria = new Grid(document.getElementById('gridDestino'), {
      data: [],
      dataOriginal: [],
      columnDefs: [
        { field: 'ID', displayName: 'ID', editable: false, visible: true },
        { field: 'Cliente', displayName: 'Cliente', editable: true, visible: true },
        { field: 'Ciudad', displayName: 'Destino', editable: true, visible: true }
      ],
      acciones: {
        seleccionar: { visible: true },
        editar: { visible: true },
        copiar: { visible: false }, // no copiar desde secundaria
        pdf: { visible: true },
        eliminar: { visible: true }
      },
      guardarBtn: true,
      daoUrl: '/guardarGridSecundaria', // <- cambia por tu endpoint real
      pageSize: 5,
      enableFiltering: true,
      showPaginator: true
    });

    // link destino
    gridPrincipal.options.destinoGrid = gridSecundaria;

    // listo
  } catch (err) {
    console.error('Error iniciando grids:', err);
    alert('Error inicializando la aplicación: ' + err.message);
  }
})();
