(async () => {
    const DEBUG = true;

    function dlog(...args) {
        if (DEBUG) console.log("[DEBUG]", ...args);
    }

    // função helper para criar textarea temporário e obter valor
    async function getTextFromTextarea(message, defaultValue = "") {
        return new Promise(resolve => {
            const ta = document.createElement('textarea');
            ta.style.position = 'fixed';
            ta.style.top = '10px';
            ta.style.left = '10px';
            ta.style.width = '95%';
            ta.style.height = '300px';
            ta.style.zIndex = 10000;
            ta.style.fontSize = '16px';
            ta.placeholder = message;
            ta.value = defaultValue;

            const btn = document.createElement('button');
            btn.textContent = 'OK';
            btn.style.position = 'fixed';
            btn.style.top = '320px';
            btn.style.left = '10px';
            btn.style.zIndex = 10001;
            btn.style.backgroundColor = "#2aa22a";

            btn.onclick = () => {
                resolve(ta.value);
                document.body.removeChild(ta);
                document.body.removeChild(btn);
            };

            document.body.appendChild(ta);
            document.body.appendChild(btn);
            ta.focus();
        });
    }

    try {
        dlog("Iniciando...");

        const rawFetchIDUrl = window.location.href.split('/');
        const authCookie = `Bearer ${localStorage.getItem("Token")}`;

        dlog("URL atual:", window.location.href);
        dlog("Tentando GET da proposta com:", rawFetchIDUrl[4], rawFetchIDUrl[5]);

        const propostaUrl = `https://redacao-api.pr.gov.br/api/v2/proposta/${rawFetchIDUrl[4]}/estudante/${rawFetchIDUrl[5]}`;
        const getRes = await fetch(propostaUrl, {
            headers: { 'Authorization': authCookie, 'Content-Type': 'application/json' }
        });

        dlog("GET status:", getRes.status);
        const getBody = await getRes.json();
        dlog("GET body:", getBody);

        const essayId = getBody?.proposta?.idProposta;
        dlog("essayId obtido:", essayId);

        const html = document.documentElement.innerHTML;
        const scriptNodes = Array.from(document.scripts || []);
        const haystack = html + "\n" + scriptNodes.map(s => s.textContent || "").join("\n");

        const uidRegex = /[A-Za-z0-9\-]{6,}-\d+/g;
        const matches = [...new Set((haystack.match(uidRegex) || []))];

        dlog("UIDs potencialmente encontrados:", matches);

        let uid;
        if (matches.length > 0) {
            uid = matches.find(m => /[A-Za-z]/.test(m) && /\d/.test(m)) || matches[0];
            dlog("UID escolhido automaticamente:", uid);
        } else {
            uid = await getTextFromTextarea("UID do endpoint (ex: 026AC795-9) — cole aqui:");
            dlog("UID inserido pelo usuário:", uid);
        }

        if (!uid) {
            throw new Error("UID do endpoint não fornecido. Não é possível continuar.");
        }

        const saveUrl = `https://redacao-api.pr.gov.br/api/v2/redacao/salvar/${uid}`;
        dlog("URL de salvamento:", saveUrl);

        const geminiKey = await getTextFromTextarea("Insira sua chave de api gemini:");
        
        let title;
        let text;
        if (!geminiKey) {
            title = await getTextFromTextarea("Insira o título da redação:");
            text = await getTextFromTextarea("Insira o texto (redação):");
        } else {
            const ppText = getBody?.proposta?.proposta;
            const textoMotivacional = getBody?.proposta?.textoMotivacional?.map((texts) => texts?.texto);
            const prompt = `Redija um texto com base em: ${ppText}

            O texto não deve ser formatado (no máximo parágrafos com espaços) e não deve conter o titulo.
            A resposta deve ser apenas a redação/texto. Sem conter titulo, tema e outros.
            A resposta deve ter entre 200 e 290 palavras.

            Os parágrafos não são linhas vazias e sim um tab (4 espaços), exemplo:

            "
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer libero neque, gravida vel accumsan in, mattis posuere risus. Nam ornare fringilla elementum. 
            Quisque rutrum diam nisl, a elementum ante molestie ut. Morbi eget nisi eu mi iaculis congue et vitae dui. Maecenas finibus turpis eleifend, vestibulum purus at, viverra est. Pellentesque eu placerat leo, eget maximus arcu. 
            Aenean id purus at justo pulvinar volutpat vel vel nisi. Aliquam non lectus nisl. Nam lobortis ex ut mollis ornare. Sed dapibus viverra porta. In sagittis orci quis justo aliquet auctor. 
            Etiam eu nisl ac enim laoreet facilisis. In turpis nibh, porta nec elit non, finibus ultricies mi.
            "
            
            Textos de apoio:
            
            ${textoMotivacional.join("\n")}`;

            dlog("Prompt gerado para Gemini:", prompt);
            const geminiEndpoint = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent";

            try {
                const res = await fetch(geminiEndpoint, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "x-goog-api-key": geminiKey
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    { text: prompt }
                                ]
                            }
                        ]
                    })
                });

                const data = await res.json();
                console.log("Resposta Gemini:", data);

                // Pega o texto gerado
                text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                console.log("Texto gerado:", text);

            } catch (err) {
                console.error("[ERRO GEMINI]", err);
            }

        }
        
        const payload = {
            essayId: essayId || null,
            text,
            title,
            status: 2
        };

        dlog("Payload:", payload);

        const postRes = await fetch(saveUrl, {
            method: "POST",
            headers: {
                'Authorization': authCookie,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        dlog("POST status:", postRes.status);
        const postText = await postRes.text();
        dlog("POST resposta (raw):", postText);

        try {
            const postJson = JSON.parse(postText);
            dlog("POST resposta (json):", postJson);
        } catch (e) {
            dlog("Resposta não é JSON válido.");
        }

        dlog("Fim do script. Não houve reload.");
    } catch (err) {
        console.error("[ERRO]", err);
    }

    window.location.reload();
})();

