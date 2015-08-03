var database = {
    name : 'ipva',
    db : null,
    schema : {
        stores : [
            {
                name : 'veiculos',
                keyPath : 'renavam',
                autoIncrement : false,
                indexes : [
                    { name : 'nome' },
                    { name : 'notificacao'},
                    { name : 'placa'},
                    { name : 'marca'},
                    { name : 'ano'},
                ]
            }
        ]
    },
    options : {
        mechanisms : ['sqlite', 'indexeddb', 'websql', 'localstorage', 'sessionstorage', 'userdata', 'memory']
    },
    instance : function(){
        if(angular.isUndefinedOrNull(database.db)){
            database.db = new ydn.db.Storage(database.name, database.schema, database.options);
        }
        return database.db;
    },
    veiculos : {
        select : function(veiculo, callback){
            if(angular.isUndefinedOrNull(veiculo)){
                database.instance().values('veiculos').always(function(records){
                    if(callback){
                        callback(records);
                    }
                });
            }else{
                database.instance()
                    .get('veiculos', veiculo.renavam)
                    .always(function(record){
                        if(callback){
                            callback(record);
                        }
                    }
                );
            }
        },
        insert : function(veiculo, callback){
            veiculo.nome = veiculo.nome.trim().substring(0,25);
            veiculo.placa = veiculo.placa.trim();
            veiculo.marca = veiculo.marca.trim();
            veiculo.ano = veiculo.ano.trim();

            database.instance().put('veiculos', veiculo).then(function(ids){
                push.sef.registrarNotificacaoVeiculo(veiculo, 'N');
                if(callback){
                    callback(ids);
                }
            });
        },
        update : function(veiculo, callback){

        },
        delete : function(veiculo, callback){
            push.sef.registrarNotificacaoVeiculo(veiculo, 'S');
            database.instance()
                .remove('veiculos', veiculo.renavam)
                .then(
                    function(rowsAffected){
                        if(callback){
                            callback();
                        }
                    }
                );
        }
    }
}
