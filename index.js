"use strict";

//const display = document.getElementById("data");
let csvKeys = [];
let csvData = [];
let counts = {};

function readCsv() {
    const csvFile = document.getElementById("csvFile");
    const input = csvFile.files[0];
    const reader = new FileReader();

    reader.onload = function (e) {
        const text = e.target.result;
        const data = d3.dsvFormat(";").parse(text);
        csvData = data;
        console.log(data);
        console.log(data.columns);
        console.log(...data);
        csvKeys = data.columns;
        counts = {};
        csvKeys.forEach((category) => {
            for (let index = 0; index < csvData.length; index++) {
                if (data[index][category]) {
                    counts[category] = (counts[category] + 1 || undefined) ?? 1;
                }
            }
        });
        console.log("counts", counts);
    };

    reader.readAsText(input);
    printJSON();
}

async function printJSON() {
    const response = await fetch("data.json");
    const json = await response.json();
    const documento = document.getElementById("documento").value;
    console.log("documento", documento);

    console.log("json", json);
    const jsonArray = Object.entries(json);
    const jsonKeys = new Set(Object.keys(json));
    console.log("json keys", jsonKeys);
    console.log("json array", jsonArray);
    console.log("csvKeys", csvKeys);

    console.log(
        "está no arquivo: ",
        csvKeys.filter((x) => jsonKeys.has(x))
    );
    console.log(
        "NÃO está no arquivo: ",
        csvKeys.filter((x) => !jsonKeys.has(x))
    );

    // console.log("categorias no arquivo", categoriasNoArquivo);

    //const categoriasNoArquivo = csvKeys.filter((x) => jsonKeys.has(x));
    const chavesNoArquivo = new Set(csvKeys);
    console.log("chaves no arquivo", chavesNoArquivo);
    const jsonNoArquivo = jsonArray.filter((x) => chavesNoArquivo.has(x[0]));
    console.log("json no arquivo", jsonNoArquivo);

    // const categoriesJson = new Set(
    //     Object.values(json).map((val) => val.category)
    // );
    const categoriesJson = new Set(
        Object.values(jsonNoArquivo).map((val) => val[1].category)
    );

    console.log("categories json", categoriesJson);
    let data = [];
    categoriesJson.forEach((category) => {
        // Cabeçalho - Header
        data.push([
            {
                value: category,
                fontWeight: "bold",
                span: 2,
                align: "center",
                backgroundColor: "#3E58D9",
                color: "#FFFFFF",
                wrap: false,
            },
            null,
            {
                value: "Qtd",
                fontWeight: "bold",
                backgroundColor: "#3E58D9",
                color: "#FFFFFF",
                wrap: false,
            },
            {
                value: "%",
                fontWeight: "bold",
                backgroundColor: "#3E58D9",
                color: "#FFFFFF",
                wrap: false,
            },
        ]);

        // Pegando apenas as linhas da categoria
        let rows = jsonArray.filter(
            (val) => val[1].category === category && chavesNoArquivo.has(val[0])
        );
        // Inserindo dados/modelos/atributos
        rows.forEach((row) => {
            data.push([
                // nome amigável
                {
                    type: String,
                    value: row[1]["name"],
                    wrap: true,
                },
                // nome da chave - id
                {
                    type: String,
                    value: row[0],
                    wrap: true,
                },
                // quantidade (contagem)
                {
                    type: Number,
                    format: "#.##0",
                    value: counts[row[0]],
                    align: "right",
                },
                // porcentagem
                {
                    type: Number,
                    format: "0.00%",
                    value: counts[row[0]] / counts[documento],
                    align: "right",
                },
            ]);
        });
    });

    // Tamanho das colunas (medida em qtd de caracteres)
    const columns = [
        { width: 35 },
        { width: 35 },
        { width: 10 },
        { width: 10 },
    ];

    const HEADER_ROW = [
        {
            value: "Modelos Negativos",
            fontWeight: "bold",
            span: 2,
            align: "center",
        },
        null,
        {
            value: "Qtd",
            fontWeight: "bold",
        },
        {
            value: "%",
            fontWeight: "bold",
        },
    ];

    let DATA_ROWS = jsonArray.map((element) => {
        return [
            // nome amigável
            {
                type: String,
                value: element[1]["name"],
            },
            // nome da chave
            {
                type: String,
                value: element[0],
            },
            // quantidade (contagem)
            {
                type: Number,
                value: 9999,
            },
            // porcentagem
            {
                type: String,
                value: "100%",
            },
        ];
    });

    //let datas = [];
    // datas.push(HEADER_ROW);
    // datas.push(...DATA_ROWS);

    // console.log(datas);
    // console.log([HEADER_ROW, ...DATA_ROWS]);

    //const data = [HEADER_ROW, ...DATA_ROWS, ...DATA_ROWS, HEADER_ROW];
    //const data = datas;

    console.log("data", data);

    const os = document.getElementById("os").value;

    document.getElementById("download").onclick = async () => {
        await writeXlsxFile(data, {
            columns,
            fileName: `${os}_Estatística.xlsx`,
            sheet: `${os}`,
        });
    };
}
