let datos = null;
let eanActual = ''; // Variable para rastrear el EAN actual

// Cargar los datos cuando se inicie la página
window.onload = async function() {
    try {
        const response = await fetch('../script/data.json');
        datos = await response.json();
        inicializarFiltros();
    } catch (error) {
        console.error('Error al cargar los datos:', error);
    }
};

function inicializarFiltros() {
    // Inicializar SKUs
    const skus = [...new Set(datos.printer.map(p => p.sku))];
    const skuFilter = document.getElementById('skuFilter');
    skuFilter.innerHTML = '<option value="">Seleccionar SKU</option>';
    skus.forEach(sku => {
        const option = document.createElement('option');
        option.value = sku;
        option.textContent = sku;
        skuFilter.appendChild(option);
    });

    // Inicializar Familias solo para la categoría "printer"
    const printerfamilies = [...new Set(datos.product
        .filter(p => p.category === 'impresion')
        .map(p => p.family))];
    const familyFilter = document.getElementById('familyFilter');
    familyFilter.innerHTML = '<option value="">Seleccionar Familia</option>';
    printerfamilies.forEach(family => {
        const option = document.createElement('option');
        option.value = family;
        option.textContent = family;
        familyFilter.appendChild(option);
    });

    // Inicializar Modelos
    const models = [...new Set(datos.printer.map(p => p.model))];
    const modelFilter = document.getElementById('modelFilter');
    modelFilter.innerHTML = '<option value="">Seleccionar Modelo</option>';
    models.forEach(model => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model;
        modelFilter.appendChild(option);
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

    // Limpiar input
    document.getElementById('skuInput').value = '';
    document.getElementById('familyInput').value = '';
    document.getElementById('modelInput').value = '';
}

function realizarConsulta() {
    const skuSelected = document.getElementById('skuFilter').value;
    const skuInput = document.getElementById('skuInput').value.trim().toUpperCase();
    const familySelected = document.getElementById('familyFilter').value;
    const familyInput = document.getElementById('familyInput').value.trim();
    const modelSelected = document.getElementById('modelFilter').value;
    const modelInput = document.getElementById('modelInput').value.trim();
    const functionSelected = document.getElementById('functionFilter').value;

    // Usar el valor del input si está presente, de lo contrario usar el select
    const skuq = skuInput || skuSelected;
    const familyq = familyInput || familySelected;
    const modelq = modelInput || modelSelected;

    // Filtrar impresoras según los criterios seleccionados
    let resultados = datos.printer;

    if (skuq) {
        resultados = resultados.filter(p => p.sku === skuq);
    }
    if (modelq) {
        resultados = resultados.filter(p => p.model === parseInt(modelq));
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
        };
    }).filter(result => result !== null);

    mostrarResultados(resultadosCompletos, skuq, modelq);
}

function mostrarResultados(resultados, skuq, modelq) {
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
                    <th>SKU</th>
                    <th>Familia</th>
                    <th>Nombre</th>
                    <th>Función</th>
                    <th>Volumen Mín</th>
                    <th>Volumen Máx</th>
                    <th>SKU suministros</th>
                    <th>Compatibles</th>
                    <th>Rendimiento</th>
                    <th>PCB</th>
                </tr>
            </thead>
            <tbody>
    `;

    resultados.forEach(r => {

        html += `
            <tr>
                <td><a href="../product/resultprinter.html?sku=${encodeURIComponent(r.printerSku)}">${r.printerSku}</a></td>
                <td>${r.family}</td>
                <td>${r.reference}</td>
                <td>${r.function}</td>
                <td>${r.volumeMin}</td>
                <td>${r.volumeMax}</td>
                <td>${r.supplies.map(s => `${s.sku}`).join('<br>')}</td>
                <td>${r.supplies.map(s => `<div>${s.pname} ${s.model} ${s.color}</div>`).join('')}</td>
                <td>${r.supplies.map(s => `<div>${s.yield}</div>`).join('')}</td>
                <th><a href="https://pcb.inc.hp.com/webapp/#/la-en/${r.oid}/T" target="blank">Ver Detalles</a></th>
            </tr>

        `;

        document.getElementById('result').appendChild(r.printerSku);
        
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;

    // Recreamos el script con el nuevo EAN
/*    if (resultados[0].upc && resultados[0].upc !== eanActual) {
        eanActual = resultados[0].upc;
        console.log('Nuevo EAN:', eanActual); // Para debug
    }*/

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
    }

}

function limpiarFiltros() {
    inicializarFiltros();
    mostrarResultados([], '', '');
    location.reload();
}