/* ==========================================================
   CONTROLE FINANCEIRO 4.0
   SCRIPT.JS
========================================================== */


/* ==========================================================
   ELEMENTOS
========================================================== */


const nome = document.getElementById("nome");
const cartao = document.getElementById("cartao");
const valor = document.getElementById("valor");

const btnSalvar = document.getElementById("btnSalvar");

const listaContas = document.getElementById("listaContas");

const pesquisa = document.getElementById("pesquisa");

const totais = document.getElementById("totais");


const totalGeral = document.getElementById("totalGeral");
const totalCartoes = document.getElementById("totalCartoes");
const totalLancamentos = document.getElementById("totalLancamentos");




/* ==========================================================
   BANCO LOCAL
========================================================== */


let contas = JSON.parse(
    localStorage.getItem("contas")
) || [];





/* ==========================================================
   SALVAR CONTA
========================================================== */


btnSalvar.addEventListener(
"click",
salvarConta
);



function salvarConta(){


    if(
        nome.value.trim()==="" ||
        valor.value===""
    ){

        alert(
            "Preencha nome e valor."
        );

        return;

    }



    const novaConta={


        id:Date.now(),


        nome:
        nome.value.trim(),


        cartao:
        cartao.value,


        valor:
        Number(valor.value),


        data:
        new Date().toISOString()

    };



    contas.push(novaConta);


    salvarBanco();


    limparCampos();


    atualizarSistema();


}





/* ==========================================================
   LIMPAR CAMPOS
========================================================== */


function limparCampos(){

    nome.value="";

    valor.value="";

    nome.focus();

}





/* ==========================================================
   LOCAL STORAGE
========================================================== */


function salvarBanco(){

    localStorage.setItem(
        "contas",
        JSON.stringify(contas)
    );

}








/* ==========================================================
   GERAR CARDS DAS CONTAS
========================================================== */


function atualizarTabela(){


    listaContas.innerHTML="";


    const filtro =
    pesquisa.value
    .toLowerCase()
    .trim();



    const lista = contas.filter(conta=>

        conta.nome
        .toLowerCase()
        .includes(filtro)

    );



    if(lista.length===0){


        listaContas.innerHTML=`

        <p style="
        color:#777;
        text-align:center;
        padding:20px;
        ">

        Nenhuma conta encontrada.

        </p>

        `;


        return;

    }






    lista.forEach(conta=>{


        listaContas.innerHTML +=`


        <div class="contaCard">



            <div class="cabecalhoConta">


                <div class="nomeConta">

                    👤 ${conta.nome}

                </div>



                <button

                class="btnExcluir"

                onclick="excluirConta(${conta.id})">

                    🗑

                </button>



            </div>





            <div class="cartaoConta">

                💳 ${conta.cartao}

            </div>





            <div class="valorConta">

                ${formatarMoeda(conta.valor)}

            </div>



        </div>


        `;


    });


}









/* ==========================================================
   EXCLUIR
========================================================== */


function excluirConta(id){



    if(confirm(
        "Deseja excluir esta conta?"
    )){


        contas =
        contas.filter(conta=>

            conta.id !== id

        );



        salvarBanco();


        atualizarSistema();


    }


}



window.excluirConta = excluirConta;








/* ==========================================================
   DASHBOARD
========================================================== */


function atualizarDashboard(){


    let total=0;


    let cartoes=[];



    contas.forEach(conta=>{


        total += conta.valor;



        if(
            !cartoes.includes(conta.cartao)
        ){

            cartoes.push(conta.cartao);

        }


    });





    totalGeral.innerHTML =
    formatarMoeda(total);



    totalCartoes.innerHTML =
    cartoes.length;



    totalLancamentos.innerHTML =
    contas.length;


}








/* ==========================================================
   RESUMO POR CARTÃO
========================================================== */


function atualizarResumo(){


    totais.innerHTML="";


    let resumo={};



    contas.forEach(conta=>{


        if(!resumo[conta.cartao]){

            resumo[conta.cartao]=0;

        }


        resumo[conta.cartao]
        += conta.valor;



    });





    Object.keys(resumo)
    .forEach(cartao=>{


        totais.innerHTML +=`


        <div class="itemResumo">


            <span>

            💳 ${cartao}

            </span>



            <strong>

            ${formatarMoeda(
                resumo[cartao]
            )}

            </strong>


        </div>


        `;


    });



}









/* ==========================================================
   PESQUISA
========================================================== */


pesquisa.addEventListener(
"input",
atualizarTabela
);








/* ==========================================================
   FORMATAÇÃO
========================================================== */


function formatarMoeda(valor){


    return valor.toLocaleString(
        "pt-BR",
        {
            style:"currency",
            currency:"BRL"
        }
    );


}







/* ==========================================================
   ATUALIZAR SISTEMA
========================================================== */


function atualizarSistema(){


    atualizarTabela();


    atualizarDashboard();


    atualizarResumo();


}







/* ==========================================================
   PDF POR PESSOA
========================================================== */


document
.getElementById("btnPDF")
.addEventListener(
"click",
gerarPDFPessoa
);



function gerarPDFPessoa(){

    const busca =
    pesquisa.value
    .trim()
    .toLowerCase();


    if(!busca){

        alert(
        "Digite o nome da pessoa na pesquisa."
        );

        return;

    }


    const pessoa =
    contas.filter(conta =>

        conta.nome
        .toLowerCase()
        .includes(busca)

    );


    if(pessoa.length===0){

        alert(
        "Nenhuma conta encontrada."
        );

        return;

    }


    const {jsPDF}=window.jspdf;

    const pdf = new jsPDF();



    pdf.setFont("helvetica","bold");

    pdf.setFontSize(18);

    pdf.text(
        "RELATÓRIO DE CONTAS",
        20,
        20
    );



    // Agrupar por cartão

    let cartoes = {};


    pessoa.forEach(conta=>{


        if(!cartoes[conta.cartao]){

            cartoes[conta.cartao]=[];

        }


        cartoes[conta.cartao].push(conta);


    });



    let y=40;

    let totalPessoa=0;



    pdf.setFontSize(14);

    pdf.text(
        pessoa[0].nome,
        20,
        y
    );


    y+=12;



    for(const nomeCartao in cartoes){



        let totalCartao=0;



        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.setFontSize(12);


        pdf.text(
            " " + nomeCartao,
            25,
            y
        );


        y+=8;



        cartoes[nomeCartao]
        .forEach(conta=>{


            pdf.setFont(
                "helvetica",
                "normal"
            );


            pdf.setFontSize(11);



            pdf.text(

                "- " + formatarMoeda(conta.valor),

                35,

                y

            );



            totalCartao += conta.valor;

            totalPessoa += conta.valor;



            y+=7;



            if(y>270){

                pdf.addPage();

                y=20;

            }


        });



        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.text(

            "Total " + nomeCartao +
            ": " +
            formatarMoeda(totalCartao),

            35,

            y

        );


        y+=12;


    }



    pdf.setFontSize(14);


    pdf.text(

        "TOTAL " +
        pessoa[0].nome.toUpperCase()
        +
        ": "
        +
        formatarMoeda(totalPessoa),

        20,

        y

    );



    pdf.save(
        "contas_" +
        pessoa[0].nome +
        ".pdf"
    );

}








/* ==========================================================
   PDF TODOS
========================================================== */


document
.getElementById("btnPDFTodos")
.addEventListener(
"click",
gerarPDFTodos
);



function gerarPDFTodos(){


    if(contas.length === 0){

        alert(
            "Não existem contas cadastradas."
        );

        return;

    }



    const {jsPDF}=window.jspdf;

    const pdf = new jsPDF();



    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(18);


    pdf.text(
        "RELATÓRIO GERAL DE CONTAS",
        20,
        20
    );



    /*
       AGRUPAR:

       Pessoa
          Cartão
             Contas
    */


    let pessoas = {};



    contas.forEach(conta=>{


        if(!pessoas[conta.nome]){

            pessoas[conta.nome]={};

        }



        if(!pessoas[conta.nome][conta.cartao]){

            pessoas[conta.nome][conta.cartao]=[];

        }



        pessoas[conta.nome][conta.cartao]
        .push(conta);



    });




    let y=40;


    let totalGeral=0;





    for(const pessoa in pessoas){



        if(y > 250){

            pdf.addPage();

            y=20;

        }



        pdf.setFont(
            "helvetica",
            "bold"
        );


        pdf.setFontSize(15);



        pdf.text(
            pessoa,
            20,
            y
        );



        y+=10;



        let totalPessoa=0;





        for(const cartao in pessoas[pessoa]){



            let totalCartao=0;



            pdf.setFontSize(12);


            pdf.text(

                "" + cartao,

                25,

                y

            );



            y+=8;





            pessoas[pessoa][cartao]
            .forEach(conta=>{


                pdf.setFont(

                    "helvetica",
                    "normal"

                );


                pdf.setFontSize(11);



                pdf.text(

                    "- " +
                    formatarMoeda(
                        conta.valor
                    ),

                    35,

                    y

                );



                totalCartao += conta.valor;

                totalPessoa += conta.valor;

                totalGeral += conta.valor;



                y+=7;




                if(y>270){

                    pdf.addPage();

                    y=20;

                }



            });






            pdf.setFont(
                "helvetica",
                "bold"
            );


            pdf.text(

                "Total " +
                cartao +
                ": " +
                formatarMoeda(totalCartao),

                35,

                y

            );



            y+=12;



        }




        pdf.setFontSize(13);


        pdf.text(

            "TOTAL " +
            pessoa.toUpperCase()
            +
            ": "
            +
            formatarMoeda(totalPessoa),

            20,

            y

        );



        y+=8;



        pdf.line(
            20,
            y,
            190,
            y
        );



        y+=15;



    }




    pdf.setFont(
        "helvetica",
        "bold"
    );


    pdf.setFontSize(15);



    pdf.text(

        "TOTAL GERAL: " +
        formatarMoeda(totalGeral),

        20,

        y

    );



    pdf.save(
        "Relatorio_Geral_Contas.pdf"
    );


}

/* ==========================================================
   INICIAR
========================================================== */


atualizarSistema();
