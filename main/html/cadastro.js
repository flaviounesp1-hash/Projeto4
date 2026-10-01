function obterCarrinho() {
  return JSON.parse(localStorage.getItem('carrinho')) || [];
}

/**
 * Renderiza os itens do carrinho na coluna de resumo
 */
function renderizarResumoPedido() {
  const carrinho = obterCarrinho();
  const resumoContainer = document.getElementById('resumo-produtos');
  const totalContainer = document.getElementById('total-checkout');

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio! Redirecionando para a loja...");
    window.location.href = "index.html";
    return;
  }

  let totalGeral = 0;

  const itensHtml = carrinho.map(item => {
    const subtotal = item.preco * item.quantidade;
    totalGeral += subtotal;
	return `   `
    /*return `
	aqui
      <li class="resumo-item">
        <span>${item.quantidade}x ${item.nome}</span>
        <strong>R$ ${subtotal.toFixed(2)}</strong>
      </li>
    ` */
  }).join('');

  resumoContainer.innerHTML = itensHtml;
 /* totalContainer.innerHTML = `Total: R$ ${totalGeral.toFixed(2)}`; */
}

/* ==========================================================================
   FUNÇÕES DE MÁSCARA DE ENTRADA (FORMATAR ENQUANTO DIGITA)
   ========================================================================== */

function mascaraTelefone(valor) {
  return valor
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/^(\d{2})(\d)/g, '($1) $2') // DDD com parênteses
    .replace(/(\d)(\d{4})$/, '$1-$2'); // Hífen antes dos últimos 4 dígitos
}

function mascaraCEP(valor) {
  return valor
    .replace(/\D/g, '') // Remove tudo que não é dígito
    .replace(/^(\d{5})(\d)/, '$1-$2'); // Hífen após os 5 primeiros dígitos
}

/* ==========================================================================
   FUNÇÕES DE VALIDAÇÃO COM REGEX
   ========================================================================== */

function validarNome(nome) {
  return nome.trim().length >= 3;
}

function validarEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email.trim());
}

function validarTelefone(telefone) {
  const apenasNumeros = telefone.replace(/\D/g, '');
  return apenasNumeros.length === 10 || apenasNumeros.length === 11;
}

function validarCEP(cep) {
  const apenasNumeros = cep.replace(/\D/g, '');
  return apenasNumeros.length === 8;
}

function validarEndereco(endereco) {
  return endereco.trim().length >= 5;
}

/* ==========================================================================
   FUNÇÃO AUXILIAR PARA EXIBIR/OCULTAR MENSAGENS DE ERRO
   ========================================================================== */

function exibirErro(idCampo, idErro, mensagem) {
  const campo = document.getElementById(idCampo);
  const elementoErro = document.getElementById(idErro);

  if (mensagem) {
    campo.classList.add('campo-invalido');
    elementoErro.textContent = mensagem;
    elementoErro.style.display = 'block';
  } else {
    campo.classList.remove('campo-invalido');
    elementoErro.textContent = '';
    elementoErro.style.display = 'none';
  }
}

/* ==========================================================================
   VALIDADORES ESPECÍFICOS POR CAMPO
   ========================================================================== */

function validarCampoEspecifico(idCampo) {
  const valor = document.getElementById(idCampo).value;

  switch (idCampo) {
    case 'nome':
      if (!validarNome(valor)) {
        exibirErro('nome', 'erro-nome', 'Informe o seu nome completo (mínimo 3 caracteres).');
        return false;
      } else {
        exibirErro('nome', 'erro-nome', null);
        return true;
      }

    case 'email':
      if (!validarEmail(valor)) {
        exibirErro('email', 'erro-email', 'Informe um e-mail válido (ex: usuario@dominio.com).');
        return false;
      } else {
        exibirErro('email', 'erro-email', null);
        return true;
      }

    case 'telefone':
      if (!validarTelefone(valor)) {
        exibirErro('telefone', 'erro-telefone', 'Informe um telefone válido com DDD. Ex: (11) 99999-9999');
        return false;
      } else {
        exibirErro('telefone', 'erro-telefone', null);
        return true;
      }

    case 'cep':
      if (!validarCEP(valor)) {
        exibirErro('cep', 'erro-cep', 'Informe um CEP válido com 8 dígitos. Ex: 01001-000');
        return false;
      } else {
        exibirErro('cep', 'erro-cep', null);
        return true;
      }

    case 'endereco':
      if (!validarEndereco(valor)) {
        exibirErro('endereco', 'erro-endereco', 'Informe seu endereço completo.');
        return false;
      } else {
        exibirErro('endereco', 'erro-endereco', null);
        return true;
      }

    default:
      return true;
  }
}

/**
 * Valida todos os campos ao enviar o formulário
 */
function validarFormularioCompleto() {
  const campos = ['nome', 'email', 'telefone', 'cep', 'endereco'];
  let todosValidos = true;

  campos.forEach(idCampo => {
    const valido = validarCampoEspecifico(idCampo);
    if (!valido) todosValidos = false;
  });

  return todosValidos;
}

/* ==========================================================================
   CONFIGURAÇÃO DOS EVENTOS EM TEMPO REAL E SUBMIT
   ========================================================================== */

function configurarEventosValidação() {
  const campos = [
    { id: 'nome' },
    { id: 'email' },
    { id: 'telefone', mascara: mascaraTelefone },
    { id: 'cep', mascara: mascaraCEP },
    { id: 'endereco' }
  ];

  campos.forEach(item => {
    const campo = document.getElementById(item.id);
    if (!campo) return;

    // 1. Aplica máscara (se houver) enquanto digita
    campo.addEventListener('input', (e) => {
      if (item.mascara) {
        e.target.value = item.mascara(e.target.value);
      }
      // Valida imediatamente enquanto o usuário digita
      validarCampoEspecifico(item.id);
    });

    // 2. Valida quando o usuário clica/muda para outro campo (perde o foco)
    campo.addEventListener('blur', () => {
      validarCampoEspecifico(item.id);
    });
  });
}

function processarCheckout(event) {
  event.preventDefault();

  if (!validarFormularioCompleto()) {
    return; // Não envia se houver erros
  }

  const comprador = {
    nome: document.getElementById('nome').value.trim(),
    email: document.getElementById('email').value.trim(),
    telefone: document.getElementById('telefone').value.trim(),
    cep: document.getElementById('cep').value.trim(),
    endereco: document.getElementById('endereco').value.trim()
  };

  alert(`Obrigado pela compra, ${comprador.nome}!\n\nSeu pedido foi confirmado e será enviado para:\n${comprador.endereco} - CEP: ${comprador.cep}\n\nConfirmação enviada para: ${comprador.email}`);

  localStorage.removeItem('carrinho');
  window.location.href = 'index.html';
}

document.addEventListener('DOMContentLoaded', () => {
  renderizarResumoPedido();
  configurarEventosValidação();

  const form = document.getElementById('form-checkout');
  if (form) {
    form.addEventListener('submit', processarCheckout);
  }
});