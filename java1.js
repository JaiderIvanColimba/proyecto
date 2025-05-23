// script.js - Archivo separado para la lógica de la calculadora

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("calcular").addEventListener("click", function () {
    // Entradas del usuario
    const consumo = parseFloat(document.getElementById("consumo").value) * 1000; // kWh a Wh
    const panel = parseInt(document.getElementById("panel").value);
    const bateria = document.getElementById("bateria").value.split("-");
    const V_bat = parseFloat(bateria[0]);
    const Cap_bat = parseFloat(bateria[1]);
    const controladorId = document.getElementById("controlador").value;
    const inversorId = document.getElementById("inversor").value;

    if (
      isNaN(consumo) ||
      isNaN(panel) ||
      isNaN(V_bat) ||
      isNaN(Cap_bat) ||
      controladorId === "" ||
      inversorId === ""
    ) {
      alert("Por favor completa todos los campos correctamente.");
      return;
    }

    // Parámetros de diseño
    const HSP = 4.5; // Horas solares pico (promedio)
    const perdidas = 0.2; // 20%
    const PdD = 0.5; // 50% profundidad de descarga
    const NAuto = 1; // 1 día de autonomía
    const ICC = panel / 10; // Supuesto ejemplo ICC = potencia/10

    // Cálculos
    const P_Necesaria = consumo / HSP;
    const P_Pratica = P_Necesaria / (1 - perdidas);
    const N_Paneles = Math.ceil(P_Pratica / panel);

    const EnergíaAlmacenadaPorBateria = V_bat * Cap_bat * PdD; // Wh por batería útil
    const TotalEnergiaRequerida = consumo * NAuto;
    const N_Baterias = Math.ceil(TotalEnergiaRequerida / EnergíaAlmacenadaPorBateria);

    const I_Ccarga = Math.ceil(1.25 * ICC); // Redondear al entero superior
    const P_inv = Math.ceil(1.2 * consumo); // Redondear al entero superior

    // Traducción de ID de controlador e inversor a nombre
    const controladores = {
      "1": "Controlador de Carga 20A",
      "2": "Controlador de Carga 30A",
      "3": "Controlador de Carga 60A"
    };
    const inversores = {
      "1": "Inversor Cargador 6000 W",
      "2": "Inversor Cargador 10000 W",
      "3": "Inversor On Grid 10000 W"
    };

    const resultadoHTML = `
      <table class="table table-bordered mt-4">
        <thead><tr><th>Componente</th><th>Cantidad / Valor</th></tr></thead>
        <tbody>
          <tr><td>Paneles Solares (${panel} W)</td><td>${N_Paneles} unidades</td></tr>
          <tr><td>Baterías (${V_bat} V - ${Cap_bat} Ah)</td><td>${N_Baterias} unidades</td></tr>
          <tr><td>Controlador de Carga</td><td>${controladores[controladorId] || 'No definido'} - Corriente de carga: ${I_Ccarga} A</td></tr>
          <tr><td>Inversor de Corriente</td><td>${inversores[inversorId] || 'No definido'} - Potencia requerida: ${P_inv} W</td></tr>
        </tbody>
      </table>
    `;

    document.getElementById("resultado").innerHTML = resultadoHTML;

    // Gráfica con Chart.js
    const canvas = document.getElementById("grafico");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (window.miGrafico) window.miGrafico.destroy();
      window.miGrafico = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['Consumo Diario', 'Producción Estimada'],
          datasets: [{
            label: 'Energía (Wh)',
            data: [consumo, N_Paneles * panel * HSP],
            backgroundColor: ['#f39c12', '#27ae60']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Comparación Consumo vs. Producción Solar' }
          }
        }
      });
    } else {
      console.warn("No se encontró el canvas con id 'grafico'.");
    }
  });
});
