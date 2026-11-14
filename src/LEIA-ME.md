# Código-fonte da Céu de Hoje

A app publicada é o `index.html` na raiz do repositório. Este é o código organizado por módulos que o gera.

## Como atualizar a app
1. Edita os ficheiros `.js` (cada módulo é uma parte da app) ou o `shell.html` (estrutura e estilos).
2. Na pasta `src`, corre: `python3 build.py`. Junta tudo num único `index.html` e verifica erros de sintaxe (precisa de Python 3 e Node.js).
3. Copia o `src/index.html` gerado para a raiz do repositório.
4. Muda o nome da cache no `sw.js` da raiz (ex.: `ceu-v78` → `ceu-v79`), para os telemóveis receberem a versão nova.
5. Faz commit e push no GitHub. A Cloudflare Pages publica em ceudehoje.com em cerca de 1 minuto.

© 2026 Júlio Melo. Todos os direitos reservados (ver LICENSE).
