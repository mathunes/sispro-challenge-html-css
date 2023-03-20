const endpointUrl = "http://dados.recife.pe.gov.br/api/3/action/";
const endpointAction = "datastore_search_sql?sql=";

const searchForm = document.getElementById("search-form");
const addressInput = document.getElementById("address");
const limitInput = document.getElementById("limit");
const bikeRackList = document.getElementById("bike-rack-list");
const bikeRackListContainer = document.getElementById("bike-rack-list-container");
const btnSearchLabel = document.getElementById("btn-search-label");
const btnSearchLoad = document.getElementById("btn-search-load");

const bikeRackMap = L.map('map').setView([-8.05428, -34.8813], 11);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(bikeRackMap);

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const address = addressInput.value.trim();
    const limit = parseInt(limitInput.value);
    const sqlQuery = `SELECT * FROM "e6e4ac72-ff15-4c5a-b149-a1943386c031" WHERE localizacao LIKE '%${address}%' LIMIT ${limit}`;

    btnSearchLabel.style.display = "none";
    btnSearchLoad.style.display = "block";
    bikeRackListContainer.style.display = "block";

    bikeRackMap.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
            bikeRackMap.removeLayer(layer);
        }
    });

    bikeRackList.innerHTML = "<ul id=\"bike-rack-list\"></ul>";

    fetch(encodeURI(endpointUrl + endpointAction + sqlQuery))
        .then(response => response.json())
        .then(data => {
            const records = data.result.records;

            if (records.length == 0) {
                let li = document.createElement("li");
                li.appendChild(document.createTextNode("Nenhum bicicletário encontrado nesse endereço."));
                bikeRackList.appendChild(li);
            } else {
                data.result.records.forEach(record => {
                    let li = document.createElement("li");
                    li.appendChild(document.createTextNode(record.nome));
                    bikeRackList.appendChild(li);

                    L.marker([record.latitude, record.longitude])
                        .addTo(bikeRackMap)
                        .bindPopup(`<b>${record.nome}</b><br>${record.localizacao}`);
                });
            }

            btnSearchLabel.style.display = "block";
            btnSearchLoad.style.display = "none";
        })
        .catch(error => console.error(error));
});