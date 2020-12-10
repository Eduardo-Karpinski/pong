const app = require('http').createServer(resposta) // Criando o servidor
const fs = require('fs') // Sistema de arquivos
const io = require('socket.io')(app) // Socket.IO
const velocidade = 7
const tamanhoDaBolinha = 15
const tamanhoDaBarra = 100
const canvasWidth = 1000
const canvasHeight = 600

app.listen(3000)

let bolinhaX = 500
let bolinhaY = 300
let direcaoDaBolinhaY = Math.random() < 0.5 ? "BAIXO" : "CIMA"
let direcaoDaBolinhaX = Math.random() < 0.5 ? "DIREITA" : "ESQUERDA"
let placarJogador1 = 0
let placarJogador2 = 0
let barraDireitaX = canvasHeight / 2 - tamanhoDaBarra / 2
let barraEsquerdaX = canvasHeight / 2 - tamanhoDaBarra / 2
let jaEstaIniciado = true;

console.log("Server está online")

let jogadores = []

function resposta(req, res) {
	let arquivo = ""
	if(req.url == "/"){
		arquivo = __dirname + '/index.html'
	}else{
		arquivo = __dirname + req.url
	}
	fs.readFile(arquivo, function (err, data) {
			if (err) {
				res.writeHead(404)
				return res.end('Página ou arquivo não encontrados')
			}
			res.writeHead(200)
			res.end(data)
		}
	)
}

function reiniciarJogo(socket) {
    bolinhaX = canvasWidth / 2
    bolinhaY = canvasHeight / 2
    barraDireitaX = canvasHeight / 2 - tamanhoDaBarra / 2
    barraEsquerdaX = canvasHeight / 2 - tamanhoDaBarra / 2
    direcaoDaBolinhaY = Math.random() < 0.5 ? "BAIXO" : "CIMA"
	direcaoDaBolinhaX = Math.random() < 0.5 ? "DIREITA" : "ESQUERDA"

	socket.emit("reiniciar jogo", {
		bolinhaX: bolinhaX,
		bolinhaY: bolinhaY,
		barraDireitaX: barraDireitaX,
		barraEsquerdaX: barraEsquerdaX,
		direcaoDaBolinhaY: direcaoDaBolinhaY,
		direcaoDaBolinhaX: direcaoDaBolinhaX
	})

}

function verificaColisao() {
    if (bolinhaX < 30 && bolinhaY >= barraDireitaX && bolinhaY <= barraDireitaX + tamanhoDaBarra) {
        direcaoDaBolinhaX = "DIREITA"
    }
    if (bolinhaX > canvasWidth - 30 && bolinhaY >= barraEsquerdaX && bolinhaY <= barraEsquerdaX + tamanhoDaBarra) {
        direcaoDaBolinhaX = "ESQUERDA"
    }
}

function attBolinha(socket) {

	if (jogadores.length >= 2) {
		if (direcaoDaBolinhaY == "CIMA") {
			bolinhaY -= velocidade
		} else {
			bolinhaY += velocidade
		}
	
		if (direcaoDaBolinhaX == "DIREITA") {
			bolinhaX += velocidade
		} else {
			bolinhaX -= velocidade
		}

		if (bolinhaX >= canvasWidth - tamanhoDaBolinha) {
			reiniciarJogo(socket)
			placarJogador1 += 1
		} else if (bolinhaX <= 0 + tamanhoDaBolinha){
			reiniciarJogo(socket)
			placarJogador2 += 1
		}
	
		if (bolinhaY >= canvasHeight - tamanhoDaBolinha) {
			direcaoDaBolinhaY = "CIMA"
		} else if (bolinhaY <= 0 + tamanhoDaBolinha){
			direcaoDaBolinhaY = "BAIXO"
		}
	} else {
		reiniciarJogo(socket)
	}
	
	setTimeout(() => {
		attBolinha(socket)
	}, 16);
}

io.on("connection", function(socket){

	if (jaEstaIniciado) {
		attBolinha(socket)
		jaEstaIniciado = false
	}

	//console.log('Cliente ' + socket.id + " conectado")

	if (jogadores.length == 0) {
		jogadores.push({
			id: socket.id,
			movimento: 'W e S'
		})
	} else if (jogadores.length == 1) {
		jogadores.forEach((j) => {
			if(j.movimento == "W e S") {
				jogadores.push({
					id: socket.id,
					movimento: '↑ e ↓'
				})
			} else {
				jogadores.push({
					id: socket.id,
					movimento: 'W e S'
				})
			}
		})
	}

	console.log('Jogadores ' + JSON.stringify(jogadores))

	socket.on("receber dados", function(idJogador) {

		verificaColisao()

		let movimento = 'nada'
		let barraAdversaria

		jogadores.forEach((j) => {
			if(j.id == idJogador) {
				movimento = j.movimento
				if (movimento == "W e S") {
					barraAdversaria = barraEsquerdaX
				} else {
					barraAdversaria = barraDireitaX
				}
			}
		})

		socket.emit("atualizar posicoes", {
			bolinhaX: bolinhaX,
			bolinhaY: bolinhaY,
			direcaoDaBolinhaY: direcaoDaBolinhaY,
			direcaoDaBolinhaX: direcaoDaBolinhaX,
			placarJogador1: placarJogador1,
			placarJogador2: placarJogador2,
			tamanhoDaBolinha: tamanhoDaBolinha,
			tamanhoDaBarra: tamanhoDaBarra,
			barraAdversaria : barraAdversaria,
			// barraDireitaX : barraDireitaX,
			// barraEsquerdaX: barraEsquerdaX,
			movimento: movimento 
		})
	});

	socket.on("mandar posicao", function(dados) {
		barraDireitaX = dados.barraDireitaX
		barraEsquerdaX = dados.barraEsquerdaX
	})

	socket.on("disconnect", function(){

		jogadores.forEach((j) => {
			if(j.id == socket.id) {
				jogadores.splice(jogadores.indexOf(j), 1)
			}
		})

		//console.log('Cliente ' + socket.id + " desconectado")
	});
	
});

