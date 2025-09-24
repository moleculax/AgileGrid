fetch("datos.json")
  .then(r => r.json())
  .then(datos => {
    const gridPrincipal = new Grid(document.getElementById("miGrid"), {
      data: [...datos],
      dataOriginal: [...datos],
      columnDefs:[
        { field:"ID", displayName:"ID", visible:true },
        { field:"Cliente", displayName:"Cliente", visible:true },
        { field:"Ciudad", displayName:"Ciudad", visible:true }
      ],
      acciones: {
        seleccionar:{visible:true},
        editar:{visible:true},
        copiar:{visible:true},
        pdf:{visible:true},
        eliminar:{visible:true}
      },
      guardarBtn: true,
      daoUrl: "/guardarGridPrincipal"
    });

    const gridSecundaria = new Grid(document.getElementById("gridDestino"), {
      data: [],
      dataOriginal: [],
      columnDefs:[
        { field:"ID", displayName:"ID", visible:true },
        { field:"Cliente", displayName:"Cliente", visible:true },
        { field:"Ciudad", displayName:"Ciudad", visible:true }
      ],
      acciones: {
        seleccionar:{visible:true},
        editar:{visible:true},
        copiar:{visible:false},
        pdf:{visible:true},
        eliminar:{visible:true}
      },
      guardarBtn: true,
      daoUrl: "/guardarGridSecundaria"
    });

    gridPrincipal.options.destinoGrid = gridSecundaria;
  });
