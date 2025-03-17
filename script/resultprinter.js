let data = null;

// Función para cambiar el título de la página
function cambiarTitulo(nuevoTitulo) {
    document.title = nuevoTitulo;
}

// Cargar datos
window.onload = async function() {
    try {
        const response = await fetch('../script/data.json');
        data = await response.json();
        skuResultados();
    } catch (error) {
        console.error('Error al cargar los datos.', error);
    }
};

// Capitalizar texto
function toCapitalCase(str) {
    if (!str) return ''; // Si el texto es null o undefined, devuelve una cadena vacía
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Obtener valor de parámetro de la URL
function obtenerParametroURL(parametro) {
    const params = new URLSearchParams(window.location.search);
    return params.get(parametro);
}


// Cargar datos SKU
function skuResultados() {
    
    // Obtener el valor del parametro 'sku'
    const skuRecibido = obtenerParametroURL('sku');
    
    console.log("SKU:", skuRecibido);

    if(data) {
        // Filtrar los datos para encontrar skuRecibido
        const printerx = data.printer.find(p => p.sku === skuRecibido);

        if (printerx) {
            // Convertir el modelo a una cadena de texto
            const modeloTitulo = `🖨️ ${printerx.model}`;
            cambiarTitulo(modeloTitulo);
        } else {
            console.log("Impresora no encontrada.");
        }
    
        if(printerx) {
            // Obtener información completa de la impresora
            const codex = data.code.find(c => c.id_code === printerx.id_code);
            const productx = data.product.find(p => p.id_product === codex.id_product);
            const codeprx = data.code_pr.find(cp => cp.id_code === printerx.id_code);
            
            // Obtener gramages compatibles
            const weightx = data.weight.filter(w => w.id_code === codeprx.id_code);
            const papersx = weightx.map(wg => {
                const paperx = data.paper.find(p => p.id_paper === wg.id_paper);
                const paperwg = data.weight.find(pw => pw.id_paper === paperx.id_paper);
                return {
                    media: paperx.media,
                    wmax: paperwg.weight_max_gm,
                    wmin: paperwg.weight_min_gm,
                }
            });
    
            // Obtener suministros compatibles
            const compatiblex = data.compatible.filter(c => c.id_code === printerx.id_code);
            const suppliesx = compatiblex.map(cm => {
                const supplyx = data.supply.find(s => s.id_supply === cm.id_supply);
                const productsp = data.product.find(p => p.id_product === supplyx.id_product);
                return {
                    sku: supplyx.sku,
                    reference: supplyx.reference,
                    model: supplyx.model,
                    color: supplyx.color,
                    yield: supplyx.yield,
                    pname: productsp.product_name,
                    pfamily: productsp.family,
                    ptype: productsp.type,
                    image: supplyx.image
                };
            });
    
            //Mostrar resultados especificos de impresora
            mostrarResultados(printerx, productx, codeprx, suppliesx, codex, weightx, papersx);
    
        } else {
            console.log("No se encontró ninguna impresora con el SKU:", skuRecibido);
        }
    } else {
        console.error("Los datos no se han cargado correctamente.");
    }

}

function mostrarResultados(printerx, productx, codeprx, suppliesx, codex, weightx, papersx) {
    const contenedor = document.getElementById('resultados');
    const indexado = document.getElementById('contenidoIndexado');

    // Condición para tecnología de impresión
    if (codeprx.tecnology === "tij") {
        codeprx.tecnology = "Inyección térmica de tinta HP"
    } else {
        codeprx.tecnology = "Láser"
    }

    let html = `
        <h2>${printerx.reference}</h2>
        <img class="imgpr" src="https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/${printerx.image}.jpg" />
        <p><strong>SKU:</strong> ${printerx.sku}</p>
        <p><strong>Familia:</strong> ${productx.family}</p>
        <p><strong>Modelo:</strong> ${printerx.model}</p>
        <p><strong>Función:</strong> ${toCapitalCase(codeprx.function)}</p>
        <p><strong>Tecnología:</strong> ${codeprx.tecnology}</p>
        <p><strong>Copy ID:</strong> ${toCapitalCase(codeprx.copy_id)}</p>
        <hr />
        <h3>Gramajes</h3>
        <p><strong>Gramaje recomendado:</strong> <b>${codeprx.weight}</b> g/m<sup>2</sup>.</p>
        <ul>
    `;

    papersx.forEach(p => {
        html +=`
            <li><b>${toCapitalCase(p.media)}:</b> ${p.wmin === "null" ? "Hasta" : "De <b>" + p.wmin + "</b> g/m<sup>2</sup> hasta "} <b>${p.wmax}</b> g/m <sup>2</sup>.</li>
        `
    });

    html +=`</ul>
        <hr />
        <strong>Volumen mensual recomendado</strong>
        <p>Desde ${codeprx.volume_min} hasta ${codeprx.volume_max} páginas al mes.</p>
        <hr />
        <strong>Velocidad de impresión</strong>
        <p><b>Normal:</b> con velocidad de impresión de hasta ${codeprx.speed_print_black_ppm} ppm (negro)${codeprx.speed_print_color_ppm === 0 ? "." : " y hasta " + codeprx.speed_print_color_ppm + "ppm (color)."}</p>
        <p><b>Borrador:</b> ${codeprx.speed_draft_black_ppm === 0 ? "Sin borrador" : "con velocidad de impresión de hasta " + codeprx.speed_draft_black_ppm + " ppm (negro) y hasta " + codeprx.speed_draft_color_ppm + " ppm (color)."}</p>
        <hr />
        <strong>Capacidad bandejas</strong>
        <p>Bandeja de entrada: ${codeprx.input_tray} hojas.</p>
        <p>Bandeja de salida: ${codeprx.output_tray} hojas.</p>
        <hr />
        <h3>Suministros Compatibles</h3>
        <ul>
    `;

    suppliesx.forEach(s => {
        html += `
            <li>${s.ptype} <b>${s.model}</b> ${s.pfamily === "Essential" ? "" : s.pfamily} ${s.color}, rendimiento hasta ${s.yield} páginas.</li>
            `
        });
    
    html +=`</ul>
        <div class="divimg">`
    
    suppliesx.forEach(s => {
        html += `<div class="imgwrapper">
            <img src="https://ssl-product-images.www8-hp.com/digmedialib/prodimg/lowres/${s.image}.jpg" alt="${s.sku}"/>
            <label><b>${s.sku}</b></label>
        </div>
        `
    });

    html += `</div>
        <h3>PCB</h3>
        <div class="divicon">
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/la-en/${printerx.oid}/T">Latam<img src="../media/icon/globe.png"></a></p>
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/ar-mx/${printerx.oid}/T">Argentina<img src="../media/icon/globe.png"></a></p>
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/cl-mx/${printerx.oid}/T">Chile<img src="../media/icon/globe.png"></a></p>
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/co-mx/${printerx.oid}/T">Colombia<img src="../media/icon/globe.png"></a></p>
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/mx-mx/${printerx.oid}/T">México<img src="../media/icon/globe.png"></a></p>
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/pe-mx/${printerx.oid}/T">Perú<img src="../media/icon/globe.png"></a></p>
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/la-en/${printerx.oid}/A">PLC<img src="../media/icon/globe.png"></a></p>
            <p><a target="_blank" href="https://pcb.inc.hp.com/webapp/#/la-en/${printerx.oid}/L">Compatibles<img src="../media/icon/globe.png"></a></p>
        </div>
    `;
    contenedor.innerHTML = html;

    if (printerx.upc) {
        indexado.innerHTML = ''; // Limpiamos el contenedor
        const scriptx = document.createElement('script');
        scriptx.async = true;
        scriptx.type = 'text/javascript';
        scriptx.src = 'https://storage.googleapis.com/indexado/assets/alquimioIndexado.v2.js';
        scriptx.setAttribute('data-ean', printerx.upc);
        scriptx.setAttribute('data-lang', 'esCL');
        scriptx.setAttribute('data-country', 'CL');
        scriptx.setAttribute('data-brand', 'HP');
        indexado.appendChild(scriptx);
    }else {
        indexado.innerHTML = ''; // Limpiamos el contenedor de indexado
    }
}