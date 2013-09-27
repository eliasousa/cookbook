//CREATE DB
var banco = openDatabase(
		'bancoDados',
		'1.0',
		'Banco de dados referente ao armazenamento mobile',
		2 * 1024 * 1024
);

function carregarReceitas(){
	banco.transaction( function (tx) {
		 tx.executeSql('CREATE TABLE IF NOT EXISTS receitas (codigo integer primary key autoincrement, nome, tempoDePreparo, rendimento, ingredientes, modoDePreparo, infoAdicionais)', [],
			function () {	
			 tx.executeSql( 'SELECT * FROM receitas', [],
			        function (tx, results){    	  
			          	var quant = results.rows.length;
			          	for (var i = 0; i < quant; i++)
			          	{
			           	  	var receita = results.rows.item(i);
			           	  	var item = document.createElement('div');
							item.setAttribute('data-bb-type','item');
							item.setAttribute('data-bb-title', receita.nome);
							if(receita.tempoDePreparo != ""){
								item.setAttribute('data-bb-accent-text', receita.tempoDePreparo + "min");
							}
							if(receita.rendimento != ""){
								item.innerHTML = "Rendimento: " + receita.rendimento + " porções";
							}
							item.setAttribute('id', receita.codigo);
							item.setAttribute('onclick', 'bb.pushScreen("edit.html","edit", document.getElementById("listaReceitas").selected)');
							var listaReceitas = document.getElementById('listaReceitas');
							var listItems = listaReceitas.getItems();
							listaReceitas.appendItem(item);
							listItems = null;
			            }   		          
					},
			        function (tx, error)
			        {
			         	alert('Ops.. ' + error.message);
			        });
			});
	});
}