const connections= require('../database/connections')
const crypto = require('crypto');  
const { update } = require('./veiculosController');

module.exports={
    
    //Função que retorna todos as tabelas do tipo 'linhas'
    async indexAll(request,response){                                       
        const linhas = await connections('linhas').select('*');

        return response.json(linhas);
    },
    
    //Função que dada uma id de uma tabela do tipo 'linhas' lhe retorna os dados da determinada tabela
    async indexOne(request,response){
        const { idLinha } = request.params; 
        const paradas = request.headers.authorization;    

        const linha = await connections('linhas') 
        .where('idLinha', idLinha)          
        .select('paradas')         
        .first();                  

        if (linha.paradas != paradas) {    
        return response.status(401).json({ error: 'Operation not permitted.' })
        };

        const linhaEscolhida = await connections('linhas').where('idLinha', idLinha);

        return response.json(linhaEscolhida);
    },
    
    //Função de criação da tabela 'linhas', alocando valor na coluna 'name' proveniente da requisição no body, para a coluna 'idLinha' é gerada uma chave aleatória.
    async create(request,response){
        const{ name} = request.body;

        //Cria uma chave hexadecimal aleatória no tamanho de 2 bytes para diferenciar os ids das linhas e prover uma segurança na manipulação da tabela 'veiculos' que usa tal coluna como parâmetro
        const idLinha = crypto.randomBytes(2).toString('HEX'); 
        
        // Aloca os valores provenientes das autorizações na variável 'paradas' que depois será inserida na tabela
        const paradas = request.headers.authorization;         
        const paradaX = paradas.split(',');
        var cont = 0;
        var idParada;
        while(cont != paradaX.length){
            var add = connections('linhasPorParada')
            .where('idParada',paradaX[cont])
            .first()
            if(add.idParada != paradaX[cont]){
                idParada= paradaX[cont];
                await connections('linhasPorParada').insert({
                    idLinha,
                    idParada
                })
            }
            cont++
        }
        await connections('linhas').insert({
            idLinha,
            name,
            paradas,
        });
    
        return response.json({idLinha,paradas}) //Retorna o ID da linha adicionada
    },

    //Função que deleta uma tabela do tipo 'linhas'
    async delete(request,response){
        const { idLinha } = request.params; 
        const paradas = request.headers.authorization;    

        const linha = await connections('linhas') 
        .where('idLinha', idLinha)          
        .select('paradas')         
        .first();                  

        //Condional que verifica se o valor da coluna 'paradas' é o mesmo que o da requisição no head, caso não seja retorna um erro.
        if (linha.paradas != paradas) {    
        return response.status(401).json({ error: 'Operação não permitida, verifique a autorização.' })
        };

        //Caso não retorne o erro a função segue os seu fluxo e deleta a tabela solicitada
        await connections('linhasPorParada').where('idLinha',idLinha).delete();
        await connections('linhas').where('idLinha', idLinha).delete(); 

        return response.status(204).send(); 
    },

    //Função que altera os dados não gerados automáticamente na tabela do tipo 'linhas'
    async update(request,response){
        const { idLinha } = request.params; 
        const paradas = request.headers.authorization;    

        const linha = await connections('linhas') 
        .where('idLinha', idLinha)          
        .select('paradas')         
        .first();                  

        //Condional que verifica se o valor da coluna 'paradas' é o mesmo que o da requisição no head, caso não seja retorna um erro.
        if (linha.paradas != paradas) {    
        return response.status(401).json({ error: 'Operação não permitida, verifique a autorização.' })
        };

        const {name}=request.body;
        const update = await connections('linhas').where('idLinha',idLinha).update({
            'name':name,
        });

        return response.json(update);

    }
}