// Pegando os elementos do HTML que vou usar nos filtros e resultados.
const tela = document.getElementById('tela');
const filtroInput = document.getElementById('filtroInput');
const filtroArea = document.getElementById('filtroArea');
const filtroStatus = document.getElementById('filtroStatus');
const filtroVoluntario = document.getElementById('filtroVoluntario');
const limparFiltros = document.getElementById('limparFiltros');
const contadorProjetos = document.getElementById('contadorProjetos');

// Guardo a lista atual para saber qual projeto abrir no botão de detalhes.
let projetosVisiveis = [];

// Variáveis para controlar a janela de detalhes.
let modalAtual = null;
let botaoAnteriorModal = null;


// Alguns projetos podem ter várias áreas em uma lista, enquanto outros podem ter as áreas separadas por vírgulas.
function obterAreas(projeto) {
    const areas = Array.isArray(projeto.area)
        ? projeto.area
        : String(projeto.area || '').split(',');

    return areas
        .map(area => String(area).trim())
        .filter(Boolean);
}


// Evita que textos dos dados sejam interpretados como código HTML.
function escaparHTML(valor) {
    return String(valor ?? '').replace(/[&<>"']/g, caractere => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    })[caractere]);
}


// O valor pode estar como booleano ou como texto no dados.js.
function obterBooleano(valor) {
    return valor === true || valor === 'true';
}


// Não deixo endereços com esquemas perigosos serem usados nas imagens.
function obterImagemSegura(valor) {
    const url = String(valor ?? '').trim();

    if (
        url.startsWith('javascript:') ||
        url.startsWith('data:') ||
        url.startsWith('vbscript:')
    ) {
        return '';
    }

    return url;
}


// Cria a lista de áreas sem repetir opções.
function carregarAreas() {
    const areas = new Set();

    projetos.forEach(projeto => {
        obterAreas(projeto).forEach(area => {
            areas.add(area);
        });
    });

    // Deixo as áreas em ordem alfabética para facilitar a escolha.
    const areasOrdenadas = [...areas].sort(
        (a, b) => a.localeCompare(b, 'pt-BR')
    );

    // Cada área vira uma caixa que pode ser marcada.
    filtroArea.innerHTML = areasOrdenadas
        .map((area, indice) => {
            const id = `area-${indice}`;

            return `
                <label class="opcao-area" for="${id}">
                    <input
                        type="checkbox"
                        class="filtro-area-checkbox"
                        value="${escaparHTML(area)}"
                        id="${id}"
                    >
                    <span>${escaparHTML(area)}</span>
                </label>
            `;
        })
        .join('');
}


// Mostra os cards dos projetos que passaram pelos filtros.
function renderizarProjetos(listaDeProjetos) {
    // Se a lista mudar, fecho os detalhes que estavam abertos.
    fecharModal();

    tela.innerHTML = '';

    // Atualizo a lista para os botões abrirem o projeto correto.
    projetosVisiveis = listaDeProjetos;

    // Quando não há resultados, mostro uma mensagem no lugar dos cards.
    if (listaDeProjetos.length === 0) {
        tela.innerHTML = `
            <p class="mensagem-vazia">
                Nenhum projeto encontrado.
            </p>
        `;
        return;
    }

    // Monto os cards e junto tudo antes de colocar na tela.
    tela.innerHTML = listaDeProjetos.map((p, i) => {
        const ativo = obterBooleano(p.status);
        const corStatus = ativo ? 'status-ativo' : 'status-inativo';
        const textoStatus = ativo ? 'Ativo' : 'Inativo';

        const areasTexto = escaparHTML(obterAreas(p).join(', '));
        const nome = escaparHTML(p.nome);
        const bairro = escaparHTML(p.bairro);
        const imagem = escaparHTML(obterImagemSegura(p.imagem));
        const alt = escaparHTML(p.alt || p.nome);

        return `
            <article class="card-projeto">

                <img
                    src="${imagem}"
                    class="imagem-cartao"
                    alt="${alt}"
                    loading="lazy"
                >

                <div class="conteudo-cartao">

                    <span class="selo-status ${corStatus}">
                        ${textoStatus}
                    </span>

                    <h3>${nome}</h3>

                    <p class="informacoes-cartao">
                        📍 ${bairro} | 📚 ${areasTexto}
                    </p>

                    <button
                        type="button"
                        class="botao-detalhes"
                        data-indice="${i}"
                    >
                        Ver detalhes
                    </button>

                </div>
            </article>
        `;
    }).join('');
}


// Abre a janela com as informações completas do projeto.
function abrirModal(projeto, botao) {
    // Guardo o botão para devolver o foco quando a janela fechar.
    botaoAnteriorModal = botao;

    const nome = escaparHTML(projeto.nome);
    const bairro = escaparHTML(projeto.bairro);
    const imagem = escaparHTML(obterImagemSegura(projeto.imagem));
    const alt = escaparHTML(projeto.alt || projeto.nome);
    const descricao = escaparHTML(projeto.descricao);
    const atividade = escaparHTML(projeto.atividade);
    const objetivo = escaparHTML(projeto.objetivo);
    const publico = escaparHTML(projeto.publico);
    const contato = escaparHTML(projeto.contato);

    // Verifico se o projeto aceita voluntários para mostrar a resposta.
    const aceitaVoluntario = obterBooleano(projeto.aceitaVoluntario)
        ? 'Sim'
        : 'Não';

    // Crio o fundo escuro e a janela usando apenas HTML e CSS próprios.
    modalAtual = document.createElement('div');
    modalAtual.className = 'fundo-modal';
    modalAtual.setAttribute('role', 'presentation');

    modalAtual.innerHTML = `
        <section
            class="modal-projeto"
            role="dialog"
            aria-modal="true"
            aria-labelledby="tituloModal"
            tabindex="-1"
        >

            <button
                type="button"
                class="botao-fechar-modal"
                aria-label="Fechar detalhes"
            >
                &times;
            </button>

            <img
                src="${imagem}"
                class="imagem-modal"
                alt="${alt}"
            >

            <h2 id="tituloModal">${nome}</h2>

            <p class="modal-bairro">📍 ${bairro}</p>

            <p class="modal-descricao">${descricao}</p>

            <h3>Atividades</h3>
            <ul>
                <li>${atividade}</li>
            </ul>

            <h3>Objetivos</h3>
            <ul>
                <li>${objetivo}</li>
            </ul>

            <div class="dados-adicionais">
                <p><strong>Público:</strong> ${publico}</p>
                <p><strong>Voluntários:</strong> ${aceitaVoluntario}</p>
                <p><strong>Contato:</strong> ${contato}</p>
            </div>

        </section>
    `;

    // Coloco a janela diretamente no body para ficar sobre a página toda.
    document.body.appendChild(modalAtual);

    // Evito que a página de trás role enquanto os detalhes estão abertos.
    document.body.style.overflow = 'hidden';

    // O botão de fechar encerra a janela.
    modalAtual.querySelector('.botao-fechar-modal')
        .addEventListener('click', fecharModal);

    // Também fecho se a pessoa clicar no fundo escuro, fora da janela.
    modalAtual.addEventListener('click', evento => {
        if (evento.target === modalAtual) {
            fecharModal();
        }
    });

    // Permito fechar a janela usando a tecla Esc.
    document.addEventListener('keydown', tratarTeclaModal);

    // Coloco o foco dentro da janela para facilitar a navegação.
    modalAtual.querySelector('.botao-fechar-modal').focus();
}


// Fecha a janela de detalhes e devolve o foco ao botão usado para abri-la.
function fecharModal() {
    if (!modalAtual) {
        return;
    }

    modalAtual.remove();
    modalAtual = null;

    document.body.style.overflow = '';

    // Removo o evento para não acumular ouvintes a cada abertura.
    document.removeEventListener('keydown', tratarTeclaModal);

    if (botaoAnteriorModal && botaoAnteriorModal.isConnected) {
        botaoAnteriorModal.focus();
    }

    botaoAnteriorModal = null;
}


// Essa função fica separada para que eu possa remover o evento depois.
function tratarTeclaModal(evento) {
    if (evento.key === 'Escape') {
        fecharModal();
    }
}


// Uso um único evento nos cards para descobrir qual botão foi clicado.
tela.addEventListener('click', evento => {
    const botao = evento.target.closest('.botao-detalhes');

    // Se o clique não foi em um botão de detalhes, não faço nada.
    if (!botao || !tela.contains(botao)) {
        return;
    }

    // O índice aponta para o projeto correspondente na lista exibida.
    const indice = Number(botao.dataset.indice);
    const projeto = projetosVisiveis[indice];

    if (projeto) {
        abrirModal(projeto, botao);
    }
});


// Junta as condições dos filtros para encontrar os projetos desejados.
function aplicarFiltros() {
    const termoBusca = filtroInput.value
        .trim()
        .toLocaleLowerCase('pt-BR');

    // Pego somente as áreas que estão marcadas.
    const areasSelecionadas = Array.from(
        filtroArea.querySelectorAll('.filtro-area-checkbox:checked')
    ).map(opcao => opcao.value);

    const statusSelecionado = filtroStatus.value;
    const voluntarioSelecionado = filtroVoluntario.value;

    const projetosFiltrados = projetos.filter(projeto => {

        // A busca pelo nome não diferencia letras maiúsculas e minúsculas.
        const correspondeNome = String(projeto.nome || '')
            .toLocaleLowerCase('pt-BR')
            .includes(termoBusca);

        const areasProjeto = obterAreas(projeto);

        // Se houver várias áreas marcadas, basta ter uma em comum.
        const correspondeArea =
            areasSelecionadas.length === 0 ||
            areasProjeto.some(area =>
                areasSelecionadas.includes(area)
            );

        // Se o campo estiver vazio, não filtro pelo status.
        const correspondeStatus =
            statusSelecionado === '' ||
            obterBooleano(projeto.status) ===
                (statusSelecionado === 'true');

        // Faço a mesma verificação para a aceitação de voluntários.
        const correspondeVoluntario =
            voluntarioSelecionado === '' ||
            obterBooleano(projeto.aceitaVoluntario) ===
                (voluntarioSelecionado === 'true');

        // O projeto precisa atender a todos os filtros escolhidos.
        return correspondeNome &&
            correspondeArea &&
            correspondeStatus &&
            correspondeVoluntario;
    });

    // Mostro quantos projetos passaram pelos filtros em relação ao total.
    const total = projetos.length;
    const encontrados = projetosFiltrados.length;

    contadorProjetos.textContent =
        `${encontrados} de ${total} projetos encontrados`;

    // Atualizo os cards com os resultados encontrados.
    renderizarProjetos(projetosFiltrados);
}


// Refaço a busca sempre que algum filtro for alterado.
filtroInput.addEventListener('input', aplicarFiltros);
filtroArea.addEventListener('change', aplicarFiltros);
filtroStatus.addEventListener('change', aplicarFiltros);
filtroVoluntario.addEventListener('change', aplicarFiltros);


// Limpa as escolhas e volta a mostrar todos os projetos.
limparFiltros.addEventListener('click', () => {
    filtroInput.value = '';

    filtroArea
        .querySelectorAll('.filtro-area-checkbox')
        .forEach(opcao => {
            opcao.checked = false;
        });

    filtroStatus.value = '';
    filtroVoluntario.value = '';

    aplicarFiltros();
});


// Quando a página abre, carrego as áreas e mostro os projetos.
carregarAreas();
aplicarFiltros();