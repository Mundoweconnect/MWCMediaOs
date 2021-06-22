 //requisitando o modulo sequelize
const Sequelize =  require('sequelize');
//Criando conexão ao Db mysql
const sequelize = new Sequelize('nodeJs', 'root', '123m', {
	host: "localhost",
	dialect: "mysql"
})

module.exports = {
	Sequelize : Sequelize,
	sequelize : sequelize
}
/*
//Verificando a conexão ao Db musql
sequelize.authenticate().then(function(){
	console.log('Conectado com sucesso');
	console.log('Mendeleev');
}).catch(function(err){
	console.log('Falha na conexão ' +err);
})
/*
//Criando models 
const Postagem = sequelize.define('postagens', {
	titulo:{
		type:Sequelize.STRING
	},
	conteudo:{
		type:Sequelize.TEXT
	}
})
//Inserindo dados na table postagens
Postagem.create({
	titulo: "Mendeleev",
	conteudo: "Hoje é Domingo"
})
//Postagem.sync({force:true})

//Criando table Usuarios
const Usuario = sequelize.define('usuarios', {
	nome : {
		type: Sequelize.STRING
	},
	sobrenome : {
		type: Sequelize.STRING
	},
	idade : {
		type: Sequelize.INTEGER
	},
	email :{
		type: Sequelize.TEXT
	} 
})

//Inserindo dados na table usuarios
Usuario.create({
	nome : "Laurindo",
	sobrenome : "Camuenho",
	idade : 20,
	email : "laurindo@gmail.com"
})
//Usuario.sync({force:true})*/