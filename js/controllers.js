angular.module('ipvaApp.controllers', [])

    .controller('AppCtrl', function($scope){

    })

    .controller('ConsultarVeiculoCtrl', function($scope, DadosVeiculos) {
        $scope.consultarVeiculo = function(veiculo){
            if(angular.isUndefinedOrNull(veiculo) || angular.isUndefinedOrNull(veiculo.renavam) || veiculo.renavam.length == 0){
                app.popup(
                    {
                        titulo:{texto:null,icone:'fa-warning',tema:'f'},
                        botoes:[
                            {
                                texto:'Voltar',
                                callback:function(){window.setTimeout(function(){$('#txtRenavamConsulta').focus();}, 500);},
                                href:'#',
                                'data_rel':'back',
                                icone:'fa-reply',
                                tema:'g'
                            }
                        ],
                        conteudo:'Informe o campo RENAVAM.'
                    }
                );
            }else if(veiculo.renavam.length < 9 || veiculo.renavam.length > 11 || !$.isNumeric(veiculo.renavam)){
                app.popup(
                    {
                        titulo:{texto:null,icone:'fa-warning',tema:'f'},
                        botoes:[
                            {
                                texto:'Voltar',
                                callback:function(){window.setTimeout(function(){$('#txtRenavamConsulta').focus();}, 500);},
                                href:'#',
                                'data_rel':'back',
                                icone:'fa-reply',
                                tema:'g'
                            }
                        ],
                        conteudo:'RENAVAM Inválido.'
                    }
                );
            }else{
                veiculo.renavam = app.lpad(veiculo.renavam, 11);
                veiculo.nome = 'Veículo';
                app.showLoading("Aguarde. Obtendo dados do veículo.");
                DadosVeiculos.obterDadosVeiculo(veiculo, null, 'exibirDadosVeiculo');
            }
        };
    })

    .controller('CadastrarVeiculoCtrl', function($scope, DadosVeiculos) {
        $scope.veiculo = {};
        $scope.opcoesNotificacao = ['Não','Sim'];
        $scope.veiculo.notificacao = $scope.opcoesNotificacao[0];
        $scope.flagAlterar = false;

        $scope.cadastrarVeiculo = function(veiculo){
            if(angular.isUndefinedOrNull(veiculo) || angular.isUndefinedOrNull(veiculo.renavam) || veiculo.renavam.length < 1){
                app.popup(
                    {
                        titulo:{texto:($scope.flagAlterar ? 'Alterar' : 'Cadastrar') + ' Veículo',icone:'fa-car',tema:'f'},
                        botoes:[
                            {
                                texto:'Voltar',
                                callback:function(){window.setTimeout(function(){$('#txtRenavamCadastro').focus();}, 500);},
                                href:'#',
                                'data_rel':'back',
                                icone:'fa-reply',
                                tema:'g'
                            }
                        ],
                        conteudo:'Informe o campo RENAVAM.'
                    }
                );
            }else if(veiculo.renavam.length < 9 || veiculo.renavam.length > 11 || !$.isNumeric(veiculo.renavam)){
                app.popup(
                    {
                        titulo:{texto:($scope.flagAlterar ? 'Alterar' : 'Cadastrar') + ' Veículo',icone:'fa-warning',tema:'f'},
                        botoes:[
                            {
                                texto:'Voltar',
                                callback:function(){window.setTimeout(function(){$('#txtRenavamCadastro').focus();}, 300);},
                                href:'#',
                                'data_rel':'back',
                                icone:'fa-reply',
                                tema:'g'
                            }
                        ],
                        conteudo:'RENAVAM Inválido.'
                    }
                );
            }else if(angular.isUndefinedOrNull(veiculo) || angular.isUndefinedOrNull(veiculo.nome) || veiculo.nome.length < 1){
                app.popup(
                    {
                        titulo:{texto:($scope.flagAlterar ? 'Alterar' : 'Cadastrar') + ' Veículo',icone:'fa-warning',tema:'f'},
                        botoes:[
                            {
                                texto:'Voltar',
                                callback:function(){ window.setTimeout(function(){$('#txtNome').focus();}, 300);},
                                href:'#',
                                'data_rel':'back',
                                icone:'fa-reply',
                                tema:'g'
                            }
                        ],
                        conteudo:'Informe o campo NOME.'
                    }
                );
            }else{
                veiculo.renavam = app.lpad(veiculo.renavam, 11);
                
                database.veiculos.select(veiculo, function(ids){
                    if(angular.isUndefinedOrNull(ids) || $scope.flagAlterar){
                        app.showLoading("Aguarde. Obtendo dados do veículo.");
                        DadosVeiculos.obterDadosVeiculo(veiculo, function(data){
                            app.hideLoading();
                            data.nome = veiculo.nome;

                            veiculo.placa = data.placa;
                            veiculo.marca = data.marca;
                            veiculo.ano = data.ano;

                            database.veiculos.insert(veiculo, function(records){
                                if(!angular.isUndefinedOrNull(records)){
                                    DadosVeiculos.broadcast('databaseChanged', null);

                                    app.popup(
                                        {
                                            titulo:{texto:($scope.flagAlterar ? 'Alterar' : 'Cadastrar') + ' Veículo',icone:'fa-car',tema:'g'},
                                            botoes:[
                                                {
                                                    texto:'Ok',
                                                    callback:function(){ window.setTimeout(function(){
                                                        app.changePage({pageId:'#veiculo_cadastrado',changeHash:true});
                                                    }, 300); },
                                                    href:'#',
                                                    'data_rel':'back',
                                                    icone:'fa-check',
                                                    tema:'g'
                                                }
                                            ],
                                            conteudo:'Veículo '+ ($scope.flagAlterar ? 'alterado' : 'cadastrado') +' com sucesso!'
                                        }
                                    );

                                    app.resetForm();
                                    $scope.limpar();
                                }
                            });
                        }, '');
                    }else{
                        app.popup(
                            {
                                titulo:{texto:($scope.flagAlterar ? 'Alterar' : 'Cadastrar') + ' Veículo',icone:'fa-car',tema:'g'},
                                botoes:[
                                    {
                                        texto:'Voltar',
                                        callback:function(){window.setTimeout(function(){$('#txtRenavamCadastro').focus();}, 300);},
                                        href:'#',
                                        'data_rel':'back',
                                        icone:'fa-reply',
                                        tema:'g'
                                    }
                                ],
                                conteudo:'RENAVAM já existente.'
                            }
                        );
                    }
                });
            }
        }

        $(document).on( "pagecontainerbeforeshow", function( event, ui ) {
            if(!angular.isUndefinedOrNull(ui.prevPage) && !angular.isUndefinedOrNull(ui.prevPage[0]) && ui.prevPage[0].id == 'cadastrar_veiculo'){
                    $scope.limpar(false);
            }
        });

        $scope.limpar = function(manterRenavam){
            app.resetForm(manterRenavam);
            if(!manterRenavam){
                $scope.veiculo = {};
            }else{
                $scope.veiculo.nome = '';
            }
            $scope.veiculo.notificacao = $scope.opcoesNotificacao[0];
            $scope.flagAlterar = manterRenavam ? true : false;
            window.setTimeout(function(){$('#chkNotificacao').val('Não').flipswitch().flipswitch('refresh');},100);
            /*if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$apply();
            }*/
        }

        $scope.$on('alterarVeiculo', function(event, veiculo){
            $scope.veiculo = veiculo;
            $scope.flagAlterar = true;
            window.setTimeout(function(){$('#chkNotificacao').val(veiculo.notificacao).flipswitch().flipswitch('refresh');},100);
            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$apply();
            }
        })
    })

    .controller('VeiculoCadastradoCtrl', function($scope, DadosVeiculos) {
        //$scope.veiculos = DadosVeiculos.obterVeiculosCadastrados();
        $scope.obterVeiculosCadastrados = function(){
            database.veiculos.select(null, function(records){
                $scope.veiculos = records;
                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                    $scope.$apply();
                }
                $('[data-role="collapsibleset"]').collapsibleset().collapsibleset( "refresh" );
            });
        }

        $(document).on( "pagecontainerbeforeshow", function( event, ui ) {
            if(ui.toPage[0].id == 'veiculo_cadastrado'){
                $scope.obterVeiculosCadastrados();
            }
        });

        //$('#veiculo_cadastrado').bind('pageinit', function(){
            //$scope.obterVeiculosCadastrados();
        //});

        $scope.$on('databaseChanged', function(event){
            $scope.obterVeiculosCadastrados();
            $('[data-role="collapsibleset"]').collapsibleset().collapsibleset( "refresh" );
        });

        $scope.consultarSituacao = function($index, veiculo){
            app.showLoading("Aguarde. Obtendo dados do veículo.");
            DadosVeiculos.obterDadosVeiculo(veiculo, null, 'exibirDadosVeiculo');
        };
        $scope.consultarDadosVeiculo = function($index, veiculo){
            app.exibirMensagemPadrao({tipo:'dados_veiculo',veiculo:veiculo});
        };
        $scope.alterarVeiculo = function($index, veiculo){
            DadosVeiculos.alterarVeiculo(veiculo);
        };
        $scope.excluirVeiculo = function($index, veiculo){
            app.popup(
                {
                    titulo:{texto:'Excluir Veículo',icone:'fa-trash-o',tema:'g'},
                    botoes:[
                        {
                            texto:'Sim',
                            callback:function(){
                                database.veiculos.delete(
                                    veiculo,
                                    function(){
                                        window.setTimeout(
                                            function(){
                                                if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                                                    $scope.$apply();
                                                }
                                                DadosVeiculos.broadcast('databaseChanged');

                                                app.popup(
                                                    {
                                                        titulo:{texto:'Excluir Veículo',icone:'fa-trash-o',tema:'g'},
                                                        botoes:[
                                                            {
                                                                texto:'Ok',
                                                                callback:function(){
                                                                },
                                                                href:'#',
                                                                'data_rel':'back',
                                                                icone:'fa-check',
                                                                tema:'g'
                                                            }
                                                        ],
                                                        conteudo:'Veículo excluído com sucesso!'
                                                    }
                                                );
                                            }
                                        ,500);
                                    }
                                );
                            },
                            href:'#',
                            'data_rel':'back',
                            icone:'fa-check',
                            tema:'g'
                        },
                        {
                            texto:'Não',
                            callback:null,
                            href:'#',
                            'data_rel':'back',
                            icone:'fa-close',
                            tema:'g'
                        }
                    ],
                    conteudo:'Deseja realmente excluir o "'+ veiculo.nome +'" ?'
                }
            );
        };
    })

    .controller('EscalaVencimentosCtrl', function($scope, EscalaVencimento) {
        $scope.escala = null;
        EscalaVencimento.obterEscalaVencimento();

        //$scope.obterEscalaVencimento = function(){EscalaVencimento.obterEscalaVencimento();};

        $scope.$on('exibirEscalaVencimento', function(event, escala){
            $scope.escala = escala;
            //app.hideLoading();
        });
    })

    .controller('SituacaoVeiculoCtrl', function($scope, DadosVeiculos) {
        $scope.selecionarPagamento = function(pagamento){
            if($scope.desativarPagamento(pagamento)){
                $.noop();
            }
            else if((pagamento.situacao.toLowerCase() == 'parcelado' || pagamento.situacao.toLowerCase() == 'autuado') && (pagamento.situacaoTaxaLic.toLowerCase() == 'quitado')){
                app.hideLoading();
                app.popup(
                    {
                        titulo:{texto:'Atenção',icone:'fa-warning',tema:'f'},
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
                        conteudo:'Favor procurar a repartição fazendária do seu município.'
                    }
                );
            }else{
                $.mobile.activePage.find('[data-role="panel"]').panel('close');
                DadosVeiculos.selecionarPagamento(pagamento);
            }
        };

        $scope.verificarPagamentoEmAberto = function(pagamento){
            if(angular.isUndefinedOrNull(pagamento)){
                return false;
            }
            if(pagamento.situacao.toLowerCase() == 'quitado'){
                return false;
            }
            else if(pagamento.situacao.toLowerCase() == 'parcelado' || pagamento.situacao.toLowerCase() == 'autuado'){
                if(pagamento.situacaoTaxaLic.toLowerCase() != 'quitado'){
                    return true;
                }else{
                    return false;
                }
            }else if(pagamento.situacaoParcelaUnica.toLowerCase() != 'quitado' || pagamento.situacaoTaxaLic.toLowerCase() != 'quitado'){
                return true;
            }else{
                return false;
            }
        };

        $scope.desativarPagamento = function(pagamento){
            return (pagamento.situacao.toLowerCase() == 'inexistente' || pagamento.situacao.toLowerCase() == 'isento' || pagamento.situacao.toLowerCase() == 'imune');
        };

        $scope.procurarReparticaoFazendaria = function(pagamento){
            if(angular.isUndefinedOrNull(pagamento)){
                return false;
            }
            if(pagamento.situacao.toLowerCase() == 'parcelado' || pagamento.situacao.toLowerCase() == 'autuado'){
                return true;
            }else{
                return false;
            }
        };

        $scope.exibeTabelaCotaUnica = function(pagamento){
            if(angular.isUndefinedOrNull(pagamento)){
                return false;
            }

            if($scope.procurarReparticaoFazendaria(pagamento)){
                return false;
            }

            if(pagamento.situacaoParcelaUnica.toLowerCase() == 'quitado' || Date.parseExact(pagamento.dataVencimentoParcelaUnica,'dd/MM/yyyy') >= Date.today()){
                return true;
            }else{
                return false;
            }
        };

        $scope.exibeTabelaParcelas = function(pagamento){
            if(angular.isUndefinedOrNull(pagamento)){
                return false;
            }

            if($scope.procurarReparticaoFazendaria(pagamento)){
                return false;
            }

            if(pagamento.situacaoParcelaUnica.toLowerCase() == 'quitado'){ return false; }
            else{ return true; }
        };

        $scope.letraDoAlfabeto = function(index){
            return 'abcdefghijklmnopqrstuvwxyz'.split('')[index];
        };

        $scope.$on('exibirDadosVeiculo', function(event, veiculo){
            veiculo.pagamentos = app.sortByKey(veiculo.pagamentos, 'exercicio', 'desc');
            $scope.veiculo = veiculo;

            $scope.pagamentos = [veiculo.pagamentos.slice(0,2), veiculo.pagamentos.slice(2,4), veiculo.pagamentos.slice(4)];

            if ($scope.$root.$$phase != '$apply' && $scope.$root.$$phase != '$digest') {
                $scope.$apply();
            }
            app.changePage({pageId:'#situacao_veiculo',changeHash:true});
        });

        $scope.$on('exibirPagamentoSelecionado', function(event, pagamento){
            $scope.pagamentoSelecionado = pagamento;
        });
    })
;
