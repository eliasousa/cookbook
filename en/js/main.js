// called by the webworks ready event
function initApp() {
	bb.pushScreen('receitas.html', 'receitas');

	Bbm.register();

	blackberry.ui.cover.setContent(blackberry.ui.cover.TYPE_IMAGE, {
		path: 'local:///cover.jpg'
	});

	setTimeout(function(){
		blackberry.ui.cover.updateCover();
	}, 0);

}

var Bbm = {
	registered: false,

	// Registra a aplicação com blackberry.bbm.platform APIs.
	register: function() {
		blackberry.event.addEventListener('onaccesschanged', function(accessible, status) {
			if (status === 'unregistered') {
				blackberry.bbm.platform.register({
					uuid: '5b54bb3a-ab66-11e2-a242-f23c91aec05e' // unique uuid
				});
			} else if (status === 'allowed') {
				Bbm.registered = accessible;
			}
		}, false);
	},

	// Invitar contato a baixar o App via BBM
	inviteToDownload: function() {
		blackberry.bbm.platform.users.inviteToDownload();
	}
};

// display a toast message to the user
function toast(msg) {
	blackberry.ui.toast.show(msg);
}

function addReceita () {
	var nome = document.getElementById('nome').value;
	var tempoDePreparo = document.getElementById('tempoDePreparo').value;
	var rendimento = document.getElementById('rendimento').value;
	var ingredientes = document.getElementById('ingredientes').value;
	var modoDePreparo = document.getElementById('modoDePreparo').value;
	var infoAdicionais = document.getElementById('infoAdicionais').value;

	if(nome != ""){
		banco.transaction(function (tx){
			tx.executeSql('CREATE TABLE IF NOT EXISTS receitas (codigo integer primary key autoincrement, nome, tempoDePreparo, rendimento, ingredientes, modoDePreparo, infoAdicionais)', [],
				function () {
					tx.executeSql("INSERT INTO receitas (nome, tempoDePreparo, rendimento, ingredientes, modoDePreparo, infoAdicionais) VALUES (?, ?, ?, ?, ?, ?)", [nome, tempoDePreparo, rendimento, ingredientes, modoDePreparo, infoAdicionais]);
					toast("Recipe add");
					bb.popScreen();
				},
				function (tx, error)
				{
				    alert('Ops... ' + error.message);
				}
			);	
		});
	}else{
		toast("Please enter the name of the recipe!");
	}
	
}

function editReceita () {
	var codigo = document.getElementById('nome').name;
	var nome = document.getElementById('nome').value;
	var tempoDePreparo = document.getElementById('tempoDePreparo').value;
	var rendimento = document.getElementById('rendimento').value;
	var ingredientes = document.getElementById('ingredientes').value;
	var modoDePreparo = document.getElementById('modoDePreparo').value;
	var infoAdicionais = document.getElementById('infoAdicionais').value;

	if(nome != ""){
		banco.transaction(function (tx){
			tx.executeSql("UPDATE receitas SET nome=?, tempoDePreparo=?, rendimento=?, ingredientes=?, modoDePreparo=?, infoAdicionais=? WHERE codigo=?", [nome, tempoDePreparo, rendimento, ingredientes, modoDePreparo, infoAdicionais, codigo]);
			toast("Updated recipe");	
			bb.popScreen();
		});
	}else{
		toast("Please enter the name of the recipe!");
	}	
}


function verReceita (item) {
	var codigo = item.id;
	banco.transaction(function (tx){
		tx.executeSql('CREATE TABLE IF NOT EXISTS receitas (codigo integer primary key autoincrement, nome, tempoDePreparo, rendimento, ingredientes, modoDePreparo, infoAdicionais)', [],
			function () {
				tx.executeSql('SELECT * FROM receitas WHERE codigo="' + codigo + '"', [], function(tx, results) {
			      	var quant = results.rows.length;
			      	var i;
			      	for(i=0; i < quant; i++) {
			      	  	var receita = results.rows.item(i);
			      	  	document.getElementById('nome').name = receita.codigo;
						document.getElementById('nome').value = receita.nome;
						document.getElementById('tempoDePreparo').value = receita.tempoDePreparo;
						document.getElementById('rendimento').value = receita.rendimento;
						document.getElementById('ingredientes').value = receita.ingredientes;
						document.getElementById('modoDePreparo').value = receita.modoDePreparo;
						document.getElementById('infoAdicionais').value = receita.infoAdicionais;
			     	}
			    },
				function (tx, error)
				{
				    alert('Ops... ' + error.message);
				}
			);		
		});
	});	
}

function deleteReceita (item) {
	try {
	    blackberry.ui.dialog.standardAskAsync("Are you sure you want to delete the recipe?", blackberry.ui.dialog.D_OK_CANCEL, confirmExclusao, {title : "Delete Recipe", size: blackberry.ui.dialog.SIZE_MEDIUM, position : blackberry.ui.dialog.BOTTOM});
 	}catch (e) {
    	alert("Ops: " + e);
  	}

  	function confirmExclusao (selection) {
  		if(selection.return == "Ok"){
  			var codigo = item.id;
			banco.transaction(function (tx){
				tx.executeSql("DELETE FROM receitas WHERE codigo=?", [codigo]);
				item.remove();
				toast("Recipe deleted");
			});
  		}  		
  	}
}

function compartilharReceita (item) {
	var codigo = item.id;

	banco.transaction(function (tx){	
		tx.executeSql('CREATE TABLE IF NOT EXISTS receitas (codigo integer primary key autoincrement, nome, tempoDePreparo, rendimento, ingredientes, modoDePreparo, infoAdicionais)', [],
			function () {
				tx.executeSql('SELECT * FROM receitas WHERE codigo="' + codigo + '"', [], function(tx, results) {
			      	var quant = results.rows.length;
			      	var i;

			      	for(i=0; i < quant; i++) {
			      	  	var receita = results.rows.item(i);
			      	  	var tempoDePreparo = "";
			      	  	var rendimento = "";
			      	  	var ingredientes = "";
			      	  	var modoDePreparo = "";
			      	  	var infoAdicionais = ""; 
			      	  	
			      	  	if(receita.tempoDePreparo != ""){
			      	  		tempoDePreparo = "\nPreparation time: " + receita.tempoDePreparo + "min";
			      	  	}
			      	  	if(receita.rendimento != ""){
			      	  		rendimento = encode("\nYield: " + receita.rendimento + " portions");
			      	  	}
			      	  	if(receita.ingredientes != ""){
			      	  		ingredientes = "\n\nIngredients:\n" + encode(receita.ingredientes);
			      	  	}
			      	  	if(receita.modoDePreparo != ""){
			      	  		modoDePreparo = "\n\nPreparation:\n" + encode(receita.modoDePreparo);
			      	  	}
			      	  	if(receita.infoAdicionais != ""){
			      	  		infoAdicionais = encode("\n\nAdditional information:\n" + receita.infoAdicionais);
			      	  	}
			      	  	
						var conteudo = "Check out my new recipe!" + "\n\nName of recipe: " + encode(receita.nome) + tempoDePreparo + rendimento + ingredientes + modoDePreparo + infoAdicionais + "\n\nBy CookBook for BlackBerry10";
			     	}
	 		     	Invoke.targets(conteudo);
			    },
				function (tx, error)
				{
				    alert('Ops... ' + error.message);
				}
			);		
		});
	});	

}

var Invoke = {

	targets: function(data) {
		var title = 'Sharing Text';
		var request = {
			action: 'bb.action.SHARE',
			mime: 'text/plain',
			data: data,
			target_type: ["VIEWER", "CARD"]
		};

		blackberry.invoke.card.invokeTargetPicker(request, title,
			// sucesso
			function() {},

			// erro
			function(e) {});
	}
};	

function encode(str) {
	var out = unescape(encodeURIComponent(str));
	return out;
}

//PILL BUTONS
function selectGeral() {
    document.getElementById('geral').style.display = 'block';
    document.getElementById('ing').style.display = 'none';
	document.getElementById('preparo').style.display = 'none';  
}

function selectIngredientes() {
	document.getElementById('geral').style.display = 'none';
    document.getElementById('ing').style.display = 'block';
	document.getElementById('preparo').style.display = 'none';
}

function selectPreparo() {
    document.getElementById('geral').style.display = 'none';
    document.getElementById('ing').style.display = 'none';
	document.getElementById('preparo').style.display = 'block';
}