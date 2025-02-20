let datos = null;

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
    skus.forEach(skux => {
        const option = document.createElement('option');
        option.value = skux;
        option.textContent = skux;
        skuFilter.appendChild(option);
    });

    // Inicializar Familias
    const families = [...new Set(datos.product.map(p => p.family))];
    const familyFilter = document.getElementById('familyFilter');
    families.forEach(familyx => {
        const option = document.createElement('option');
        option.value = familyx;
        option.textContent = familyx;
        familyFilter.appendChild(option);
    });

    // Inicializar Modelos
    const models = [...new Set(datos.printer.map(p => p.model))];
    const modelFilter = document.getElementById('modelFilter');
    models.forEach(modelx => {
        const option = document.createElement('option');
        option.value = modelx;
        option.textContent = modelx;
        modelFilter.appendChild(option);
    });

    // Inicializar Funciones
    const functions = [...new Set(datos.code_pr.map(p => p.function))];
    const functionFilter = document.getElementById('functionFilter');
    functions.forEach(func => {
        const option = document.createElement('option');
        option.value = func;
        option.textContent = func;
        functionFilter.appendChild(option);
    });
}

function realizarConsulta() {
    const skuSelected = document.getElementById('skuFilter').value;
    const familySelected = document.getElementById('familyFilter').value;
    const modelSelected = document.getElementById('modelFilter').value;
    const functionSelected = document.getElementById('functionFilter').value;

    // Filtrar impresoras según los criterios seleccionados
    let resultados = datos.printer;

    if (skuSelected) {
        resultados = resultados.filter(p => p.sku === skuSelected);
    }
    if (modelSelected) {
        resultados = resultados.filter(p => p.model === parseInt(modelSelected));
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
        if (familySelected && product.family !== familySelected) {
            return null;
        }

        // Obtener suministros compatibles
        const compatibles = datos.compatible.filter(c => c.id_code === printer.id_code);
        const supplies = compatibles.map(comp => {
            const supply = datos.supply.find(s => s.id_supply === comp.id_supply);
            const products = datos.product.find(p => p.id_product === supply.id_product);
            return {
                sku: supply.sku,
                model: supply.model,
                color: supply.color,
                yield: supply.yield,
                pname: products.product_name
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
        };
    }).filter(result => result !== null);

    mostrarResultados(resultadosCompletos);
}

function mostrarResultados(resultados) {
    const contenedor = document.getElementById('resultadosTabla');
    const fichaContainer = document.getElementById('contenidoIndexado');

    if (resultados.length === 0) {
        contenedor.innerHTML = '<p>No se encontraron resultados</p>';
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
                    <th>UPC</th>
                    <th>SKU suministros</th>
                    <th>Compatibles</th>
                    <th>Rendimiento</th>
                </tr>
            </thead>
            <tbody>
    `;

    resultados.forEach(r => {
        html += `
            <tr>
                <td>${r.printerSku}</td>
                <td>${r.family}</td>
                <td>${r.reference}</td>
                <td>${r.function}</td>
                <td>${r.volumeMin}</td>
                <td>${r.volumeMax}</td>
                <td>${r.upc}</td>
                <td>${r.supplies.map(s => `${s.sku}`).join('<br>')}</td>
                <td>${r.supplies.map(s => `${s.pname} ${s.model} ${s.color}`).join('<br>')}</td>
                <td>${r.supplies.map(s => `${s.yield}`).join('<br>')}</td>
            </tr>

        `;
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;

    // Recreamos el script con el nuevo EAN
    if (resultados[0].upc) {
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
    }

}