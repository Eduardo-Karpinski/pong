const canvas = document.getElementById("canvas")
const contexto = canvas.getContext("2d")
const velocidade = 7
const tamanhoDaBolinha = 15
const tamanhoDaBarra = 100
let oldTimeStamp = 0
let bolinhaX = canvas.width / 2 // pros lados
let bolinhaY = canvas.height / 2 // cima baixo
let direcaoDaBolinhaY = Math.random() < 0.5 ? "BAIXO" : "CIMA"
let direcaoDaBolinhaX = Math.random() < 0.5 ? "DIREITA" : "ESQUERDA"
let barraDireitaX = canvas.height / 2 - tamanhoDaBarra / 2
let barraEsquerdaX = canvas.height / 2 - tamanhoDaBarra / 2
let placarJogador1 = 0
let placarJogador2 = 0

window.requestAnimationFrame(gameLoop)
window.addEventListener('keyup', function(event) { teclado.onKeyup(event); }, false)
window.addEventListener('keydown', function(event) { teclado.onKeydown(event); }, false)

function gameLoop(timeStamp) {
    let secondsPassed
    let fps
	secondsPassed = (timeStamp - oldTimeStamp) / 1000
    oldTimeStamp = timeStamp;
	fps = Math.round(1 / secondsPassed);
	console.log("FPS: "+ fps)
    atualizar()
    window.requestAnimationFrame(gameLoop)
}

function atualizar() {
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

    if (bolinhaX >= canvas.width - tamanhoDaBolinha) {
        reiniciarJogo()
        placarJogador1 += 1
    } else if (bolinhaX <= 0 + tamanhoDaBolinha){
        reiniciarJogo()
        placarJogador2 += 1
    }

    if (bolinhaY >= canvas.height - tamanhoDaBolinha) {
        direcaoDaBolinhaY = "CIMA"
    } else if (bolinhaY <= 0 + tamanhoDaBolinha){
        direcaoDaBolinhaY = "BAIXO"
    }

    verificaTecla()
    verificaColisao()

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
    contexto.fillText(placarJogador2, canvas.width - canvas.width / 2 / 2, 5)
    contexto.closePath()
    contexto.fill()
    contexto.stroke()
}

function reiniciarJogo() {
    bolinhaX = canvas.width / 2
    bolinhaY = canvas.height / 2
    barraDireitaX = canvas.height / 2 - tamanhoDaBarra / 2
    barraEsquerdaX = canvas.height / 2 - tamanhoDaBarra / 2
    direcaoDaBolinhaY = Math.random() < 0.5 ? "BAIXO" : "CIMA"
    direcaoDaBolinhaX = Math.random() < 0.5 ? "DIREITA" : "ESQUERDA"
}

function verificaTecla(){
    const velocidadeDaBarra = 10

    if (teclado.isDown(teclado.W) && barraDireitaX > 10) { // w
        barraDireitaX -= velocidadeDaBarra
    } else if (teclado.isDown(teclado.S) && barraDireitaX < canvas.height - tamanhoDaBarra - 10) { // s
        barraDireitaX += velocidadeDaBarra
    }
    
    if (teclado.isDown(teclado.SetaCima) && barraEsquerdaX > 10) { // seta para cima
        barraEsquerdaX -= velocidadeDaBarra
    } else if (teclado.isDown(teclado.SetaBaixo) && barraEsquerdaX < canvas.height - tamanhoDaBarra - 10) { // seta para baixo
        barraEsquerdaX += velocidadeDaBarra
    }

}

function verificaColisao() {
    if (bolinhaX < 30 && bolinhaY >= barraDireitaX && bolinhaY <= barraDireitaX + tamanhoDaBarra) {
        direcaoDaBolinhaX = "DIREITA"
    }
    if (bolinhaX > canvas.width - 30 && bolinhaY >= barraEsquerdaX && bolinhaY <= barraEsquerdaX + tamanhoDaBarra) {
        direcaoDaBolinhaX = "ESQUERDA"
    }
}

const teclado = {
    pressionadas: {},
	W : 87,
	S : 83,
    SetaCima: 38,
    SetaBaixo: 40,
	isDown: function(keyCode) {
	  return this.pressionadas[keyCode]
	},
	onKeydown: function(event) {
	  this.pressionadas[event.keyCode] = true
	},
	onKeyup: function(event) {
	  delete this.pressionadas[event.keyCode]
    }
}