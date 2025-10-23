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

        const title = await getTextFromTextarea("Insira o título da redação:");
        const text = await getTextFromTextarea("Insira o texto (redação):");

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
