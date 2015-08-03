angular.module('ipvaApp.services', [])

    .factory('DadosVeiculos', function($http, $rootScope) {
        return {
            broadcast : function(name, data){
                $rootScope.$broadcast(name, data);
            },
            alterarVeiculo : function(veiculo){
                $rootScope.$broadcast('alterarVeiculo', veiculo);
                app.changePage({pageId:'#cadastrar_veiculo',changeHash:false});
            },
            exibirDadosVeiculo : function(veiculo){
                $rootScope.$broadcast('exibirDadosVeiculo', veiculo);
            },
            selecionarPagamento: function(pagamento){
                $rootScope.$broadcast('exibirPagamentoSelecionado', pagamento);
                app.changePage({pageId:'#situacao_vencimentos_veiculo',changeHash:true});
            },
            obterDadosVeiculo: function(veiculo, callback, broadcast){
                $http.get( app.serviceUrl('consultarIpvaService'), { params: { data: '{"renavam":"'+ veiculo.renavam +'","token":"'+app.token()+'","plataforma":"ios"}' }, responseType:'json' } )
                    .success(function(data, status, headers, config){
                        switch (data.responseCode){
                            case 200:
                                data.renavam = veiculo.renavam;
                                data.nome = veiculo.nome || 'Veículo';
                                // data.pagamentos[2].situacao = 'Parcelado';
                                // data.pagamentos[3].situacao = 'Autuado';

                                //app.resetForm();

                                if(callback){
                                    callback(data);
                                }
                                if(broadcast){
                                    $rootScope.$broadcast(broadcast, data);
                                }
                                break;
                            case 401:
                                app.hideLoading();
                                app.popup(
                                    {
                                        titulo:{texto:null,icone:'fa-warning',tema:'f'},
                                        botoes:[
                                            {
                                                texto:'Voltar',
                                                callback:null,
                                                href:'#',
                                                'data_rel':'back',
                                                icone:'fa-reply',
                                                tema:'g'
                                            }
                                        ],
                                        conteudo:'Ocorreu um erro ao processar os dados informados. Por favor, valide as informações e tente novamente.'
                                    }
                                );
                                break;
                            case 402:
                            case 403:
                                app.hideLoading();
                                app.popup(
                                    {
                                        titulo:{texto:null,icone:'fa-warning',tema:'f'},
                                        botoes:[
                                            {
                                                texto:'Voltar',
                                                callback:null,
                                                href:'#',
                                                'data_rel':'back',
                                                icone:'fa-reply',
                                                tema:'g'
                                            }
                                        ],
                                        conteudo:app.decodificaMensagemRetorno(data.mensagemErro)
                                    }
                                );
                                break;
                            case 500:
                                app.hideLoading();
                                app.popup(
                                    {
                                        titulo:{texto:null,icone:'fa-warning',tema:'f'},
                                        botoes:[
                                            {
                                                texto:'Voltar',
                                                callback:null,
                                                href:'#',
                                                'data_rel':'back',
                                                icone:'fa-reply',
                                                tema:'g'
                                            }
                                        ],
                                        conteudo:'ERROR 500 - Exception.'
                                    }
                                );
                                break;
                            case 501:
                                app.hideLoading();
                                app.popup(
                                    {
                                        titulo:{texto:null,icone:'fa-warning',tema:'f'},
                                        botoes:[
                                            {
                                                texto:'Voltar',
                                                callback:null,
                                                href:'#',
                                                'data_rel':'back',
                                                icone:'fa-reply',
                                                tema:'g'
                                            }
                                        ],
                                        conteudo:'Existe uma nova versão da aplicação disponível na loja de aplicativos. Favor autalizar a aplicação.'
                                    }
                                );
                                break;
                        }
                    })
                    .error(function(data, status, headers, config){
                        app.hideLoading();
                        app.popup(
                            {
                                titulo:{texto:null,icone:'fa-warning',tema:'f'},
                                botoes:[
                                    {
                                        texto:'Voltar',
                                        callback:null,
                                        href:'#',
                                        'data_rel':'back',
                                        icone:'fa-reply',
                                        tema:'g'
                                    }
                                ],
                                conteudo:'Ocorreu um erro ao contatar os servidores da SEF-MG. Por favor, verifique sua conexão com a Internet ou tente novamente mais tarde.'
                            }
                        );
                    })
                ;
            }
        }
    })

    .factory('EscalaVencimento', function($http,$rootScope){
        return {
            obterEscalaVencimento: function() {
                $http.get( app.serviceUrl('recuperarTabelaService'), { params: { data: '{"token":"'+app.token()+'","plataforma":"'+app.plataforma()+'"}' }, responseType:'json' } )
                    .success(function(data, status, headers, config){
                        $rootScope.$broadcast('exibirEscalaVencimento', data);
                    })
                    .error(function(data, status, headers, config){
                        console.log('Erro ao obter escala vencimento');
                    })
                ;
            }
        }
    })

;
