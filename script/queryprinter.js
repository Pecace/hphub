let datos = null;
let eanActual = ''; // Variable para rastrear el EAN actual

// Cargar los datos cuando se inicie la página
window.onload = async function() {
    try {
        const response = await fetch('../script/data.json');
        datos = await response.json();
        inicializarFiltros();

        // Agregar event listeners para realizar la búsqueda automáticamente
        document.getElementById('skuInput').addEventListener('input', realizarConsulta);
        document.getElementById('familyFilter').addEventListener('change', realizarConsulta);
        document.getElementById('modelInput').addEventListener('input', realizarConsulta);
        document.getElementById('functionFilter').addEventListener('change', realizarConsulta);
        // document.getElementById('skuFilter').addEventListener('change', realizarConsulta);
        // document.getElementById('familyInput').addEventListener('input', realizarConsulta);
        // document.getElementById('modelFilter').addEventListener('change', realizarConsulta);

    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
};

// Función para normalizar el texto: convertir a minúsculas y eliminar caracteres no numéricos
function normalizarTexto(texto) {
    return texto.toLowerCase().replace(/[^0-9]/g, '');
}

function inicializarFiltros() {
    
    if (!datos) {
        console.error("Los datos no se han cargado correctamente.");
        return;
    }

    // Inicializar Familias solo para la categoría relacionadas con "printer"
    const printerfamilies = [...new Set(
        datos.printer
            .map(p => {
                const codef = datos.code.find(c => c.id_code === p.id_code);
                const productf = datos.product.find(p => p.id_product === codef.id_product);
                return productf ? productf.family : null;
            })
            .filter(family => family !== null)
        )];
    const familyFilter = document.getElementById('familyFilter');
    familyFilter.innerHTML = '<option value="">Seleccionar Familia</option>';
    printerfamilies.forEach(family => {
        const option = document.createElement('option');
        option.value = family;
        option.textContent = family;
        familyFilter.appendChild(option);
    });

    // Inicializar Funciones
    const functions = [...new Set(datos.code_pr.map(p => p.function))];
    const functionFilter = document.getElementById('functionFilter');
    functionFilter.innerHTML = '<option value="">Seleccionar Función</option>';
    functions.forEach(func => {
        const option = document.createElement('option');
        option.value = func;
        option.textContent = func;
        functionFilter.appendChild(option);
    });

    /*/Inicializar SKUs
    const skus = [...new Set(datos.printer.map(p => p.sku))];
    const skuFilter = document.getElementById('skuFilter');
    skuFilter.innerHTML = '<option value="">Seleccionar SKU</option>';
    skus.forEach(sku => {
        const option = document.createElement('option');
        option.value = sku;
        option.textContent = sku;
        skuFilter.appendChild(option);
    }); */
    
    /*/Inicializar Modelos
    const models = [...new Set(datos.printer.map(p => normalizarTexto(String(p.model))))];
    const modelFilter = document.getElementById('modelFilter');
    modelFilter.innerHTML = '<option value="">Seleccionar Modelo</option>';
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelFilter.appendChild(option);
    });*/

    // Limpiar input
    document.getElementById('skuInput').value = '';
    document.getElementById('modelInput').value = '';
    // document.getElementById('familyInput').value = '';
}

function realizarConsulta() {
    const skuInput = document.getElementById('skuInput').value.trim().toUpperCase();
    const familySelected = document.getElementById('familyFilter').value;
    const modelInput = normalizarTexto(document.getElementById('modelInput').value.trim()); // Normalizar el input
    const functionSelected = document.getElementById('functionFilter').value;
    // const skuSelected = document.getElementById('skuFilter').value;
    // const familyInput = document.getElementById('familyInput').value.trim().toUpperCase();
    // const modelSelected = document.getElementById('modelFilter').value;

    // Verificar si todos los campos están vacíos
    if (!skuInput && !familySelected && !modelInput && !functionSelected) { // !skuSelected && !familyInput && !modelSelected &&
        // Restablecer los resultados a su estado inicial
        mostrarResultados([], '', '');
        return;
    }

    // Usar el valor del input si está presente, de lo contrario usar el select
    const skuq = skuInput; // || skuSelected;
    const familyq = familySelected; // || familyInput
    const modelq = modelInput; // || modelSelected;

    // Filtrar impresoras según los criterios seleccionados
    let resultados = datos.printer;

    if (skuq) {
        resultados = resultados.filter(p => p.sku === skuq);
    }
    if (modelq) {
        resultados = resultados.filter(p => normalizarTexto(String(p.model)) === modelq); // Comparar usando normalizarTexto
    }

    // Obtener información completa para cada impresora
    const resultadosCompletos = resultados.map(printer => {
        const code = datos.code.find(c => c.id_code === printer.id_code);
        const product = datos.product.find(p => p.id_product === code.id_product);
        const codePrinter = datos.code_pr.find(cp => cp.id_code === printer.id_code);
        
        // Filtrar por función si está seleccionada
        if (functionSelected && codePrinter.function !== functionSelected) {
            return null;
        }
        
        // Filtrar por familia si está seleccionada
        if (familyq && product.family !== familyq) {
            return null;
        }

        // Obtener suministros compatibles
        const compatibles = datos.compatible.filter(c => c.id_code === printer.id_code);
        const supplies = compatibles.map(comp => {
            const supply = datos.supply.find(s => s.id_supply === comp.id_supply);
            const productsp = datos.product.find(p => p.id_product === supply.id_product);
            return {
                sku: supply.sku,
                model: supply.model,
                color: supply.color,
                yield: supply.yield,
                pname: productsp.product_name
            };
        });

        return {
            printerSku: printer.sku,
            family: product.family,
            model: printer.model,
            function: codePrinter.function,
            volumeMin: codePrinter.volume_min,
            volumeMax: codePrinter.volume_max,
            reference: printer.reference,
            upc: printer.upc,
            supplies: supplies,
            oid: printer.oid,
            image: printer.image,
            indexado: printer.indexado,
        };

    }).filter(result => result !== null);

    mostrarResultados(resultadosCompletos, skuq, modelq);
}

function mostrarResultados(resultados) {
    const contenedor = document.getElementById('resultadosTabla');
    const fichaContainer = document.getElementById('contenidoIndexado');
    
    if (resultados.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron resultados</p>';
        fichaContainer.innerHTML = ''; // Limpiamos el contenedor de indexado
        return;
    }

    let html = `
        <table>
            <thead>
                <tr>
                    <th>Imagen</th>
                    <th>SKU</th>
                    <th>Familia</th>
                    <th>Nombre</th>
                    <th>Volumen mensual</th>
                    <th>Compatibles</th>
                    <th>Indexado</th>
                    <th>PCB</th>
                </tr>
            </thead>
            <tbody>
    `;

    resultados.forEach(r => {

        html += `
        <tr>
            <td><img class="imgpr" src="https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/${r.image}.jpg"></td>
            <td><a target="_blank" href="../product/resultprinter.html?sku=${encodeURIComponent(r.printerSku)}">${r.printerSku}</a></td>
            <td>${r.family}</td>
            <td>${r.reference}</td>
            <td>${r.volumeMin} - ${r.volumeMax}</td>
            <td>${r.supplies.map(s => `${s.pname} ${s.model} ${s.color}`).join('<hr>')}</td>
            <td><a href="https://front.indexado.production.alquimio.cloud/spec?modelId=${r.indexado}&lang=esCL&version=V5" target="_blank"><img src="../media/icon/eye.png"></a></td>
            <td><a href="https://pcb.inc.hp.com/webapp/#/la-en/${r.oid}/T" target="_blank"><img src="../media/icon/eye.png"></a></td>
        </tr>

        `;

    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;

    /*/ Recreamos el script con el nuevo EAN
    if (resultados[0].upc && resultados[0].upc !== eanActual) {
        eanActual = resultados[0].upc;
        console.log('Nuevo EAN:', eanActual); // Para debug
    }

    // Mostrar indexado solo si la consulta se hizo con SKU
    if ((skuq || modelq) && resultados[0].upc) {
        fichaContainer.innerHTML = ''; // Limpiamos el contenedor
        const script = document.createElement('script');
        script.async = true;
        script.type = 'text/javascript';
        script.src = 'https://storage.googleapis.com/indexado/assets/alquimioIndexado.v2.js';
        script.setAttribute('data-ean', resultados[0].upc);
        script.setAttribute('data-lang', 'esCL');
        script.setAttribute('data-country', 'CL');
        script.setAttribute('data-brand', 'HP');
        fichaContainer.appendChild(script);
    }else {
        fichaContainer.innerHTML = ''; // Limpiamos el contenedor de indexado
    }*/

}

function limpiarFiltros() {
    inicializarFiltros();
    mostrarResultados([], '', '');
    location.reload();
}