var express = require('express');
var path = require('path');
var app = express();

// O método GET é usado para exibir/recuperar alguma informação
app.get('/', function(req, res) {
    // res.send('Hello World'); // Envia uma resposta HTTP
    // res.send('<h1>Hello World</h1>'); // Pode ser inclusive conteúdo HTML
    res.sendFile(path.join(__dirname, 'templates/index.html')); // Usando sendFile, você pode enviar um arquivo HTML
    // Com express.js sozinho, no entanto, você não consegue passar variáveis para o arquivo HTML como em Django
    // É necessário usar algo que chamamos de Template Engine (ex: Jade)
});

// Uma rota pode conter parâmetros e você pode especificar quais são os valores aceitos de cada um deles usando expressões regulares dentro dos "()"
app.get('/:model/:action(edit|list|delete)/:id([0-9]+)', function(req, res) {
    var id = req.params.id;
    var action = req.params.action;
    var model = req.params.model;
    res.send('Você está na tela de ' + action + ' do '+model+' de id '+id);
});

app.get('/consoles', function(req, res) {
    var p = ['Nintendo Switch', 'Playstation 4', 'Xbox One'];
    // Você pode passar parâmetros adicionais que são úteis para realizar filtragens
    // Eles são conhecidos como queryParams e são passados indicando seus nomes e valores após um "?" colocado ao fim da url
    // ex: /consoles?inicio=1&fim=2 retorna ["Playstation 4"] na nossa implementação
    var query = req.query;
    var begin = query.inicio || 0;
    var end = query.fim || p.length;
    res.send(p.slice(begin, end));
});

// A sintaxe utilizando express().route() é bastante útil quando queremos definir uma API REST sem muita repetição de código
// Definindo a rota, podemos encadear as chamadas dos métodos HTTP para definir todos os comportamentos atrelados àquela rota
app.route('/jogos')
    .get(function(req, res) { res.send('Exibindo todos os jogos'); })
    .post(function(req, res) { res.send('Adicionando um novo jogo'); });

app.route('/jogos/:id([0-9]+)')
    .get(function(req, res) { res.send('Exibindo jogo de id '+req.params.id); })
    .put(function(req, res) { res.send('Editando jogo de id '+req.params.id); })
    .delete(function(req, res) { res.send('Deletando jogo de id '+req.params.id); });

// Podemos realizar chamadas em sequência de funções em uma mesma rota usando o parâmetro next()
// Podemos definir diversas funções que serão executadas e ao fim delas chamar next() para que a próxima da fila seja chamada
// O fluxo é interrompido quando não há mais funções para executar ou quando next não é chamada
// É bastante útil quando desejamos modularizar nossas funções e definir comportamentos específicos para cada uma delas
// Podemos, por exemplo, fazer uma chamada assíncrona em uma etapa e só passar para a próxima etapa quando os dados chegarem
app.get('/multiple_functions', 
    function(req, res, next) {
        req.beginTime = Date.now();
        console.log('Etapa 1');
        next();
    },
    function(req, res, next) {
        for(var i = 0 ; i < 100000 ; i++);
        console.log('Etapa 2');
        next();
    },
    function(req, res) {
        console.log('Etapa final');
        var diff = Date.now() - req.beginTime
        res.send('Finished in '+diff+'ms');
    }
);

// Middlewares são formas bastante práticas de injetarmos chamadas em sequência em nossas rotas
// Podemos, por exemplo, modificar os objetos da requisição e da resposta antes que as rotas sejam efetivamente processadas
function timeMiddleware(req, res, next) {
    req.currentTime = Date.now();
    next();
}

// Na nossa função timeMiddleware, definimos um atributo currentTime e o adicionamos a nossa requisição
// Agora, todas as ações que forem definidas depois desse middleware ser adicionado à nossa aplicação receberam esse objeto levemente modificado
app.use(timeMiddleware);

// Podemos acessar currentTime nessa função pois o middleware foi adicionado à aplicação
app.get('/current_time', function(req, res) {
    res.send('The time is '+ req.currentTime)
});

// Nossa aplicação executará na porta que especificamos
app.listen(3000, function(e) {
    console.log('Server running on port 3000!')
});