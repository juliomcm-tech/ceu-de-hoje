# Céu de Hoje · Avisos à hora certa (Cloudflare)

Demora uns 10 minutos e faz-se só uma vez. Tudo no painel, sem instalar nada.

## 1. Criar o Worker
1. Entra em **dash.cloudflare.com** com a tua conta.
2. Menu da esquerda: **Workers & Pages** (ou "Compute → Workers") → **Create** → **Create Worker** (modelo "Hello World").
3. Nome: **ceu-avisos** → **Deploy**.
4. Carrega em **Edit code**, apaga tudo o que lá está e cola o conteúdo do ficheiro **worker.js** → **Deploy**.

## 2. Criar o armazenamento (KV)
1. Menu da esquerda: **Storage & Databases → KV** (ou "Workers KV") → **Create** / **Create namespace**.
2. Nome: **ceu-avisos** → criar.

## 3. Ligar o KV ao Worker
1. Volta ao Worker **ceu-avisos** → **Settings** → **Bindings** → **Add** → **KV namespace**.
2. **Variable name:** `PUSH` (exatamente assim, em maiúsculas).
3. **KV namespace:** escolhe **ceu-avisos** → guardar / **Deploy**.

## 4. Agendar (de 15 em 15 minutos)
1. No Worker → **Settings** → **Triggers** (ou "Trigger events") → **Add** → **Cron trigger**.
2. Escreve: `*/15 * * * *` → guardar.

> No plano grátis há 5 agendamentos por conta. Se o Cond.OS já usar alguns, confirma que ainda sobra um.

## 5. (Opcional, para quando houver muita gente)
No Worker → **Settings** → **Variables and Secrets** → **Add**:
- Nome: `SELF_URL`
- Valor: o endereço do teu Worker (ex.: `https://ceu-avisos.o-teu-nome.workers.dev`)

## 6. Confirmar
Abre no navegador: `https://ceu-avisos.o-teu-nome.workers.dev/vapid`
Deve aparecer algo como `{"key":"BHk…"}`. Se aparecer, está tudo a funcionar.

## 7. Dizer ao Claude
Manda o endereço do Worker (`https://ceu-avisos….workers.dev`). Ele põe-no na app e os avisos ficam ativos
nas Definições da app → **⏰ Avisos à hora certa**.

---
**O que o servidor guarda:** só o endereço de notificação do telemóvel e as horas escolhidas (em hora UTC).
Não guarda nomes, aniversários, ciclo nem nada pessoal. Quem desinstala a app é apagado automaticamente.
