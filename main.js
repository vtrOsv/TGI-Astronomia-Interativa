const taxaDeExpansao = 0.001; 
const Limiar = 1900;
const G = 100;

let gravidade = G;
let E = taxaDeExpansao;
let controle = 0;
let esferas = [];
let animationFrameId;

const container = document.getElementById('simulacao-container');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const centroX = canvas.width / 2;
const centroY = canvas.height / 2;

let zoomLevel = 100;

function aplicarZoom() {
    
    canvas.style.transform = `scale(${zoomLevel / 100})`;
    atualizarMostradorZoom(); 
}

function aumentarZoom() {
	if (zoomLevel < 200){
    	zoomLevel += 10; 
    	aplicarZoom();
	}
}

function diminuirZoom() {
	if (zoomLevel > 10){
    	zoomLevel -= 10; 
    	aplicarZoom();
	}
}

function atualizarMostradorZoom() {
    document.getElementById('valor-zoom').textContent = `Z: ${zoomLevel}%`;
}

function Gravidade() {
	esferas.forEach((esfera1, i) => {
		esferas.forEach((esfera2, j) => {
			if (i !== j && !esfera1.fundida && !esfera2.fundida) {
				const dx = esfera2.x - esfera1.x;
                const dy = esfera2.y - esfera1.y;
                const distancia = Math.sqrt(dx * dx + dy * dy);
                    
                if (distancia < 1) return; 
                    
                	const forca = gravidade * (esfera1.massa * esfera2.massa) / (distancia * distancia);
                   	const ax = forca * dx / distancia;
					const ay = forca * dy / distancia;
                    
                    esfera1.vx += ax / esfera1.massa;
                    esfera1.vy += ay / esfera1.massa;
                    esfera2.vx -= ax / esfera2.massa;
                    esfera2.vy -= ay / esfera2.massa;
        	}
    	});
	});
}

function atualizarMostradorGravidade() {
  	document.getElementById('valor-gravidade').textContent = `G: ${(gravidade/10).toFixed(0)}`;
}

function aumentarGravidade() {
	if (gravidade < 800) {
  		gravidade *= 2; 
  		atualizarMostradorGravidade();
	}
}

function diminuirGravidade() {
	if (gravidade > 12.5) {
  		gravidade *= 0.5; 
  		atualizarMostradorGravidade();
	}
}

function atualizarMostradorEnergiaEscura() {
    document.getElementById('valor-energia-escura').textContent = `E: ${E.toFixed(4)}`;
}

function aumentarEnergiaEscura() {
	if (E < 0.008){
    	E *= 2; 
    	atualizarMostradorEnergiaEscura();
	}
}

function diminuirEnergiaEscura() {
	if (E > 0.000125) {
    	E *= 0.5; 
    	atualizarMostradorEnergiaEscura();
	}
}

function expandirUniverso(Limiar) {
	for (let i = 0; i < esferas.length; i++) {
		for (let j = i + 1; j < esferas.length; j++) {
			const esfera1 = esferas[i];
			const esfera2 = esferas[j];

			const dx = esfera2.x - esfera1.x;
           	const dy = esfera2.y - esfera1.y;
            const distancia = Math.sqrt(dx * dx + dy * dy);
			
			if (distancia > Limiar) {

            			const expansaoX = dx * E;
            			const expansaoY = dy * E;

            			esfera1.x -= expansaoX / 2;
            			esfera1.y -= expansaoY / 2;
            			esfera2.x += expansaoX / 2;
            			esfera2.y += expansaoY / 2;
			}
        }
	}
}
 
function Colisao() {
	let esferasParaRemover = new Set();
	for (let i = 0; i < esferas.length; i++) {
		for (let j = i + 1; j < esferas.length; j++) {
			const esfera1 = esferas[i];
 			const esfera2 = esferas[j];
			if (!esferasParaRemover.has(esfera1) && !esferasParaRemover.has(esfera2)) {
				const dx = esfera2.x - esfera1.x;
				const dy = esfera2.y - esfera1.y;
				const distancia = Math.sqrt(dx * dx + dy * dy);

				if (distancia < esfera1.raio + esfera2.raio) {
					const novaMassa = esfera1.massa + esfera2.massa;
					const novoRaio = Math.sqrt(esfera1.raio * esfera1.raio + esfera2.raio * esfera2.raio);
					const novoVx = (esfera1.vx * esfera1.massa + esfera2.vx * esfera2.massa) / novaMassa;
					const novoVy = (esfera1.vy * esfera1.massa + esfera2.vy * esfera2.massa) / novaMassa;
					const novoX = (esfera1.x * esfera1.massa + esfera2.x * esfera2.massa) / novaMassa;
					const novoY = (esfera1.y * esfera1.massa + esfera2.y * esfera2.massa) / novaMassa;

					criarEsfera(novoX, novoY, novoVx, novoVy, novoRaio);
                    
                    			esferasParaRemover.add(esfera1);
                    			esferasParaRemover.add(esfera2);
                }
            }
        }
    }

	esferas = esferas.filter(esfera => !esferasParaRemover.has(esfera));
}

	
function desenharFundo() {
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
}

function desenharEsferas() {
	esferas.forEach(esfera => {
        let gradiente = ctx.createRadialGradient(
			esfera.x, esfera.y, 0,
			esfera.x, esfera.y, esfera.raio
        );
		gradiente.addColorStop(0, esfera.cor); 
        gradiente.addColorStop(0.2, esfera.cor);
        gradiente.addColorStop(1, 'rgba(0, 0, 0, 0)'); 

        ctx.beginPath();
        ctx.arc(esfera.x, esfera.y, esfera.raio, 0, Math.PI * 2);
        ctx.fillStyle = gradiente;
        ctx.fill();
	});
}
	
function ajustarTamanhoCanvas() {
	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;
}

ajustarTamanhoCanvas();
window.addEventListener('resize', ajustarTamanhoCanvas);

	
function criarEsfera(x, y, vx, vy, raio) {
	const massa = Math.PI * raio * raio; 
    const cor = `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)})`;
    esferas.push({ massa, x, y, vx, vy, raio, cor, fundida: false });
}

let ultimoTempo;
	
function animar(tempoAtual) {
	if (!ultimoTempo) ultimoTempo = tempoAtual;
		const deltaTime = (tempoAtual - ultimoTempo) / 1000; 
       	Gravidade();
        Colisao();
        esferas.forEach(esfera => {
            esfera.x += esfera.vx * deltaTime;
            esfera.y += esfera.vy * deltaTime;
        });
		
		desenharFundo()
        desenharEsferas();
        ultimoTempo = tempoAtual;
    	animationFrameId = requestAnimationFrame(animar); 
}

function animar2(tempoAtual) {
	if (!ultimoTempo) ultimoTempo = tempoAtual;
        const deltaTime = (tempoAtual - ultimoTempo) / 1000; 
		expandirUniverso(0)
        Colisao();
		
        esferas.forEach(esfera => {
            esfera.x += esfera.vx * deltaTime;
            esfera.y += esfera.vy * deltaTime;
        });
		
		desenharFundo()
        desenharEsferas();
        ultimoTempo = tempoAtual;
    	animationFrameId = requestAnimationFrame(animar2); 
}

function animar3(tempoAtual) {
	if (!ultimoTempo) ultimoTempo = tempoAtual;
		const deltaTime = (tempoAtual - ultimoTempo) / 1000; 
        Gravidade();
		expandirUniverso()
        Colisao();
		
        esferas.forEach(esfera => {
            esfera.x += esfera.vx * deltaTime;
            esfera.y += esfera.vy * deltaTime;
        });
		
		desenharFundo()
        desenharEsferas();
        ultimoTempo = tempoAtual;
    	animationFrameId = requestAnimationFrame(animar3); 
}


function iniciar(x){
	if (animationFrameId) {
        cancelAnimationFrame(animationFrameId); 
    }
	esferas = [];
	criarEsfera(centroX, centroY, 0, 0, 10);  
	criarEsfera(centroX - 50, centroY + 275, 0, 0, 15);  
	criarEsfera(centroX + 150, centroY + 275, 0, 0, 15);  
	criarEsfera(centroX + 653, centroY - 180, 0, 0, 5);  
	criarEsfera(centroX - 215, centroY + 318, 0, 0, 10); 
	criarEsfera(centroX + 304, centroY - 779, 0, 0, 10);
	criarEsfera(centroX - 345, centroY - 454, 0, 0, 10); 
	criarEsfera(centroX + 860, centroY - 379, 0, 0, 10);
	criarEsfera(centroX + 200, centroY, 0, 0, 15);
	
	if (x == 1) animationFrameId = requestAnimationFrame(animar);
	if (x == 2) animationFrameId = requestAnimationFrame(animar2);
	if (x == 3) animationFrameId = requestAnimationFrame(animar3);

}


document.getElementById('iniciar-simulacao').addEventListener('click', function() {
    iniciar(1); 
});

document.getElementById('iniciar-simulacao2').addEventListener('click', function() {
    iniciar(2); 
});

document.getElementById('iniciar-simulacao3').addEventListener('click', function() {
    iniciar(3); 
});
document.getElementById('aumentar-gravidade').addEventListener('click', function() {
	aumentarGravidade();
});

document.getElementById('diminuir-gravidade').addEventListener('click',function() {
	diminuirGravidade();
});

document.getElementById('aumentar-energia-escura').addEventListener('click', function() {
	aumentarEnergiaEscura();
});

document.getElementById('diminuir-energia-escura').addEventListener('click', function() {
	diminuirEnergiaEscura();
});

document.getElementById('zoom-in').addEventListener('click', aumentarZoom);
document.getElementById('zoom-out').addEventListener('click', diminuirZoom);


