# 🐧 Guia Linux Básico (nível zero) – Alpine/iSH Edition

> 🧠 **Objetivo:** Ensinar os comandos mais básicos pra navegar, instalar coisas e não travar.

---

## 📁 1. **Navegando entre pastas**

| Comando            | O que faz                              |
| ------------------ | -------------------------------------- |
| `pwd`              | Mostra onde você está (ex: `/root`)    |
| `ls`               | Lista arquivos e pastas                |
| `cd nome_da_pasta` | Entra numa pasta                       |
| `cd ..`            | Sobe uma pasta                         |
| `cd /`             | Vai pra raiz do sistema                |
| `cd ~`             | Vai pra pasta do usuário (ex: `/root`) |

📦 Exemplo:

```bash
cd /
ls
cd etc
ls
```

---

## 📄 2. **Criando e manipulando arquivos/pastas**

| Comando          | O que faz                          |
| ---------------- | ---------------------------------- |
| `mkdir nome`     | Cria uma pasta                     |
| `touch nome.txt` | Cria um arquivo vazio              |
| `nano nome.txt`  | Edita arquivo no terminal          |
| `cat nome.txt`   | Mostra o conteúdo do arquivo       |
| `rm nome.txt`    | Apaga um arquivo                   |
| `rm -r pasta/`   | Apaga uma pasta e o que tem dentro |

📦 Exemplo:

```bash
mkdir projetos
cd projetos
touch anotacoes.txt
nano anotacoes.txt
```

Dentro do `nano`, digita o que quiser. Pra salvar:

* Pressiona `CTRL + O` → Enter
* Depois `CTRL + X` pra sair

---

## 📦 3. **Instalando pacotes com `apk`**

```bash
apk update             # Atualiza a lista de pacotes
apk upgrade            # Atualiza os pacotes instalados
apk add nome_pacote    # Instala um pacote
apk del nome_pacote    # Remove um pacote
```

Exemplos úteis:

```bash
apk add bash nano git curl python3
```

---

## 🔍 4. **Procurar pacotes disponíveis**

```bash
apk search nome
```

Exemplo:

```bash
apk search python
```

---

## 💡 5. **Informações básicas do sistema**

```bash
uname -a       # Mostra kernel e arquitetura
df -h          # Espaço em disco
free -h        # Memória RAM
whoami         # Mostra o usuário atual
```

---

## 📌 6. **Saindo, limpando e ajudando**

| Comando       | O que faz                   |
| ------------- | --------------------------- |
| `clear`       | Limpa a tela                |
| `exit`        | Sai do terminal             |
| `man comando` | Mostra ajuda (ex: `man ls`) |

---

## 🧪 7. **Exemplo de sessão básica**

```bash
apk update
apk add nano
mkdir teste
cd teste
touch arquivo.txt
nano arquivo.txt
cat arquivo.txt
```
