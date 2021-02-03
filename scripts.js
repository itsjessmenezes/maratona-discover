const Modal = {
  open() {
    //Abrir modal
    document
    .querySelector('.modal-overlay')
    //Adicionar a class active ao modal
    .classList
    .add('active')
    
  },
  close() {
    //Fechar modal
    document
    .querySelector('.modal-overlay')
    //Remover a class active ao modal
    .classList
    .remove('active')
  }
};

const Storage = {
  get(){
    //o retorno deverá transformar a string em um array novamente || devolve um array vazio
    //JSON.parse irá transformar de string para array, ou obj
    return JSON.parse(localStorage.getItem(
      "dev.finances:transactions"
      )) ||
    [];

  },
  set(transactions){
    //armazenar dados no servidor 
    //setItem recebe 1 argumentos: a chave(nome) que será guardada no localStorage e o valor
    //o localStorage armazena em string, para transformar o transactions (que é array) em string utilizamos o JSON.stringfy()
    localStorage.setItem(
      "dev.finances:transactions",
      JSON.stringify(transactions)
      );

  }
};

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    Transaction.all.push(transaction);

    App.reload();
  },
  remove(index) {
    Transaction.all.splice(index, 1);
    App.reload();
  },
  incomes() {
    //somar as entradas
    let income = 0;

    Transaction.all.forEach((transaction) => {
      if(transaction.amount > 0) {
        income += transaction.amount; 
      }
    });
    return income;
  },
  expenses() {
    //somar as saídas
    let expense = 0;

    Transaction.all.forEach((transaction) => {
      if(transaction.amount < 0) {
        expense += transaction.amount; 
      }
    });
    return expense;
  },
  total() {
    //subtrair as entradas pelas saídas
    return Transaction.incomes() + Transaction.expenses();
  }
};

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody'),
  
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    DOM.transactionsContainer.appendChild(tr);

  },
  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? "incomes" : "expenses";
    
    const amount = Utils.formatCurrency(transaction.amount);
    
    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="data">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação"/>
      </td>
    `;

    return html;
  },

  //atualizar entradas, saídas e total
  updateBalance() {
    document
    .getElementById('incomeDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.incomes());
    document
    .getElementById('expenseDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.expenses());
    document
    .getElementById('totalDisplay')
    .innerHTML = Utils.formatCurrency(Transaction.total());
  },
  clearTransactions() {
    DOM.transactionsContainer.innerHTML = "";
  }
};
//transformando o valor em real(R$)
const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;
      return value;
  },
  
  formatDate(date) {
    //separar os dados de ano, mes e dia
    const splittedDate = date.split("-");
    //retornar na formatação que quero (dia, mes e ano)
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`;
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? "-" : "";

    //transforme o numero em string e substitui tudo o que nao seja numero por vazio (ou seja, todos os sinais de negativo)
    value = String(value).replace(/\D/g, "")

    //transforme novamente em numero e divida-o por 100
    value = Number(value) / 100

    //transforme o numero para moeda brasileira
    //toLocaleString recebe 2 parametro("que local estou", {obj com o estilo:"moeda", tipo de moeda:"BRL" })
    value = value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL"
    });

    return signal + value;
  }
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  //pegar os valores
  getValues() {
  
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value
    };
  },

    //validar os campos
    validateFileds() {
      const { description, amount, date } = Form.getValues();
      if(
        description.trim() === ""||
        amount.trim() === "" ||
        date.trim() === "") {
          throw new Error("Por favor, preencha todos os campos");
        }
      console.log(description);
    },

  //fotmatar os dados
  formatValues() {
    let { description, amount, date } = Form.getValues();
    
    amount = Utils.formatAmount(amount);
    
    date = Utils.formatDate(date);
    
    return {
      description,
      amount,
      date
    };

  },

  //salvar transações
  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  //apagar dados
  clearFields(){
    Form.description.value = "";
    Form.amount.value = "";
    Form.date.value = "";
  },


  submit(event) {
    event.preventDefault();

    try {
      Form.validateFileds();
      const transaction = Form.formatValues();
      
      Form.saveTransaction(transaction);
      Form.clearFields();

      Modal.close();

    } catch(error) {
      alert(error.message);
    }
  }
};


const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index);
    });

    DOM.updateBalance();

    Storage.set(Transaction.all);


  },
  reload(){
    DOM.clearTransactions();
    App.init();
  }
};

App.init();