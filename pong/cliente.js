const canvas = document.getElementById("canvas")
const contexto = canvas.getContext("2d")
const socket = io.connect();
let tamanhoDaBarra = 100
let tamanhoDaBolinha = 15
let oldTimeStamp = 0
let bolinhaX = 0
let bolinhaY = 0
let direcaoDaBolinhaY = 0
let direcaoDaBolinhaX = 0
let barraDireitaX = canvas.height / 2 - tamanhoDaBarra / 2
let barraEsquerdaX = canvas.width / 2 - tamanhoDaBarra / 2
let placarJogador1 = 0
let placarJogador2 = 0
let id
let movimentacao

window.requestAnimationFrame(gameLoop)
window.addEventListener('keyup', function(event) { teclado.onKeyup(event); }, false)
window.addEventListener('keydown', function(event) { teclado.onKeydown(event); }, false)

function gameLoop(timeStamp) {
    id = socket.id
    let secondsPassed
    let fps
	secondsPassed = (timeStamp - oldTimeStamp) / 1000
    oldTimeStamp = timeStamp;
	fps = Math.round(1 / secondsPassed);
    document.getElementById('fps').innerHTML = "FPS: " + fps
    socket.emit("receber dados", id)
    atualizar()
    window.requestAnimationFrame(gameLoop)
}

socket.on("reiniciar jogo", function(dados){
    bolinhaX = dados.bolinhaX
	bolinhaY = dados.bolinhaY
	barraDireitaX = dados.barraDireitaX
	barraEsquerdaX = dados.barraEsquerdaX
	direcaoDaBolinhaY = dados.direcaoDaBolinhaY
	direcaoDaBolinhaX = dados.direcaoDaBolinhaX
})

socket.on("atualizar posicoes", function(dados){
    bolinhaX = dados.bolinhaX
    bolinhaY = dados.bolinhaY
    direcaoDaBolinhaY = dados.direcaoDaBolinhaY
    direcaoDaBolinhaX = dados.direcaoDaBolinhaX
    placarJogador1 = dados.placarJogador1
    placarJogador2 = dados.placarJogador2
    tamanhoDaBarra = dados.tamanhoDaBarra
    tamanhoDaBolinha = dados.tamanhoDaBolinha
    // barraDireitaX = dados.barraDireitaX
    // barraEsquerdaX = dados.barraEsquerdaX
    movimentacao = dados.movimento

    if (movimentacao == "W e S") {
        console.log(movimentacao+" "+dados.barraAdversaria);
        barraEsquerdaX = dados.barraAdversaria
    } else {
        barraDireitaX = dados.barraAdversaria
    }

    document.getElementById('movimento').innerHTML = "Você joga com: " + movimentacao
});

function atualizar() {
    verificaTecla()
    contexto.clearRect(0, 0, canvas.width, canvas.height)
    contexto.beginPath()
    contexto.arc(bolinhaX, bolinhaY, tamanhoDaBolinha, 0, Math.PI * 2, true)
    contexto.fillRect(15, barraDireitaX, 10, tamanhoDaBarra)
    contexto.fillRect(canvas.width - 30, barraEsquerdaX, 10, tamanhoDaBarra)
    contexto.moveTo(canvas.width / 2, 0);
    contexto.lineTo(canvas.width / 2, canvas.height)
    contexto.font = "bold 15px sans-serif"
    contexto.textBaseline = "top"
    contexto.fillText(placarJogador1, canvas.width / 2 / 2, 5)
    contexto.fillText(placarJogador2, canvas.width - (canvas.width / 2 / 2), 5)
    contexto.closePath()
    contexto.fill()
    contexto.stroke()
}

function verificaTecla(){
    const velocidadeDaBarra = 20
    
    if (movimentacao == "W e S") {
        if (teclado.isDown(teclado.W) && barraDireitaX > 10) { // w
            barraDireitaX -= velocidadeDaBarra
        } else if (teclado.isDown(teclado.S) && barraDireitaX < canvas.height - tamanhoDaBarra - 10) { // s
            barraDireitaX += velocidadeDaBarra
        }
    } else if (movimentacao == "↑ e ↓") {
        if (teclado.isDown(teclado.SetaCima) && barraEsquerdaX > 10) { // seta para cima
            barraEsquerdaX -= velocidadeDaBarra
        } else if (teclado.isDown(teclado.SetaBaixo) && barraEsquerdaX < canvas.height - tamanhoDaBarra - 10) { // seta para baixo
            barraEsquerdaX += velocidadeDaBarra
        }
    }

    socket.emit("mandar posicao", {barraDireitaX: barraDireitaX, barraEsquerdaX: barraEsquerdaX})

}

const teclado = {
    _pressed: {},
	W : 87,
	S : 83,
    SetaCima: 38,
    SetaBaixo: 40,
	isDown: function(keyCode) {
	  return this._pressed[keyCode]
	},
	onKeydown: function(event) {
	  this._pressed[event.keyCode] = true
	},
	onKeyup: function(event) {
	  delete this._pressed[event.keyCode]
    }
};