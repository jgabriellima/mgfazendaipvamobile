var app = {
    baseUrl: null,
    urlHomolocacao: 'http://10.2.201.154:8980',
    urlProducao: 'http://ipvamobile.fazenda.mg.gov.br',
    urlDesenvolvimento: 'http://192.168.1.25:8080', //'http://10.74.9.182:8080', //'http://10.74.10.183:8080', // 'http://cpmb010400:8080',
    servicePath: '/middleware/services/',
    ambiente: 'PRD',
    splashLoadingComplete: false,
    splashPageRemoved: false,
    angularLoadingComplete: false,
    appLoadingComplete: false,
    serviceUrl: function(service) {
        return (app.ambiente == 'PRD' ? app.urlProducao : (app.ambiente == 'HML' ? app.urlHomolocacao : app.urlDesenvolvimento)) + app.servicePath + service;
    },
    isPhoneGap: function() {
        return (window.cordova || window.PhoneGap || window.phonegap) && /^file:\/{3}[^\/]/i.test(window.location.href) && /ios|iphone|ipod|ipad|android|iemobile/i.test(navigator.userAgent);
    },
    token: function() {
        return '01122014';
    },
    plataforma: function() {
        var _plataforma = 'windows';
        if(typeof device === 'undefined'){return _plataforma;}
        switch(device.platform.toLowerCase()){
            case 'win32nt':
            case 'wince':
            case 'generic':
                _plataforma = 'windows';
            break;
            case 'iphone':
                _plataforma = 'ios';
            break;
            default:
                _plataforma = device.platform.toLowerCase();
            break;
        }
        return _plataforma;
    },
    openAppStore: function() {
        switch (app.plataforma().toLowerCase()) {
            case 'android':
                window.open('market://details?id=br.gov.mg.fazenda.ipvamobile', '_system');
                break;
            case 'ios':
                window.open('http://itunes.apple.com/us/app/id730992618?mt=8', '_system');
                break;
            case 'windows':
                window.location = 'zune://navigate/?appID=c6740702-5bc3-42d3-9856-4da1f968e2a4';
                //window.open('http://www.windowsphone.com/s?appid=c6740702-5bc3-42d3-9856-4da1f968e2a4', '_system');
                break;
        }
    },
    initialize: function() {
        app.baseUrl = document.URL;
        this.bindEvents();
    },
    prefixedEventListener: function(element, type, callback) {
        var pfx = ["webkit", "moz", "MS", "o", ""];
        for (var p = 0; p < pfx.length; p++) {
            if (!pfx[p]) type = type.toLowerCase();
            element.addEventListener(pfx[p] + type, callback, false);
        }
    },
    bindEvents: function() {
        var progress = document.querySelector(".progress");
        app.prefixedEventListener(progress, "AnimationEnd", function(e) {
            app.splashLoadingComplete = true;
        });

        document.addEventListener('deviceready', this.onDeviceReady, false);

        /* APENAS PARA TESTES NO BROWSER - REMOVER PARA PRODUÇÃO */
        if (!app.isPhoneGap()) {
            $(document).ready(function() {
                app.onDeviceReady();
            });
        }
    },
    onDeviceReady: function() {
        //ydn.debug.log('ydn.db', 'finest');

        $(window).on( "orientationchange", function( event ) {
            if($('#popup')){
                $('#popup').popup('reposition', {x:0,y:0}).popup('reposition','positionTo:window')
            }
        });

        if(app.plataforma().toLowerCase() == 'ios' && typeof StatusBar !== 'undefined'){ StatusBar.overlaysWebView(false); }
        if(app.plataforma().toLowerCase() == 'windows' && typeof StatusBar !== 'undefined'){ StatusBar.hide(); }

        //if(app.ambiente == 'PRD'){
            switch(app.plataforma().toLowerCase()){
                case 'android':
                    push.android.register();
                break;
                case 'ios':
                    push.ios.register();
                break;
                case 'windows':
                    push.windows.register();
                break;
            }
        //}
        
        angular.isUndefinedOrNull = function(obj) {
            return angular.isUndefined(obj) || obj === null;
        };

        //angular.element($('#escala_vencimento')).scope().obterEscalaVencimento();

        /* WORKAROUND FOR IOS FIXED HEADER AND FOOTER JUMPING WHEN INPUT LOOSE FOCUS */
        $(document).on('blur', 'input, textarea', function() {
            setTimeout(function() {
                window.scrollTo(document.body.scrollLeft, document.body.scrollTop);
            }, 0);
        });

        app.validarToken();
    },
    loadApp: function() {
        app.loadAngular();

        if (!app.splashLoadingComplete) {
            window.setTimeout(function() {
                app.loadApp();
            }, 1000);
        } else {
            if (!app.appLoadingComplete) {
                app.appLoadingComplete = true;
                database.veiculos.select(null, function(veiculos){
                    app.changePage({
                        pageId: (angular.isUndefinedOrNull(veiculos) || veiculos.length < 1) ? '#consultar_veiculo' : '#veiculo_cadastrado',
                        changeHash: true,
                        reverse: true
                    });
                });

                $('#splash').on('pagehide', function(event){
                    if(!app.splashPageRemoved){
                        $('#splash [data-role="content"]')
                        //.find('.div-cell')
                        .empty()
                        .removeClass('center middle splash')
                        .append('<div class="popup middle" style="white-space:nowrap;">'+
                            '<div role="main" class="ui-content">'+
                            '<h3 class="ui-title center">Deseja sair da aplicação?</h3>'+
                            '<div class="ui-grid-a ui-theme-f">'+
                            '<div class="ui-block-a">'+
                            '<div class="button-wrap">'+
                            '<a href="javascript:app.exitApp();" class="ui-shadow ui-btn ui-btn-g ui-corner-all ui-mini">'+
                            '<i class="fa fa-check"></i>'+
                            '<span>Sim</span>'+
                            '</a>'+
                            '</div>'+
                            '</div>'+
                            '<div class="ui-block-b">'+
                            '<div class="button-wrap">'+
                            '<a href="javascript:window.history.go(1);" class="ui-shadow ui-btn ui-btn-g ui-corner-all ui-mini">'+
                            '<i class="fa fa-close"></i>'+
                            '<span>Não</span>'+
                            '</a>'+
                            '</div>'+
                            '</div>'+
                            '</div>'+
                            '</div>'+
                            '</div>'
                        );
                        app.splashPageRemoved = true;
                        $('#splash').off('pagehide');
                    }
                });
            }
        }
    },
    exitApp: function(){
        switch(app.plataforma().toLowerCase()){
            case 'ios':
                $('#splash [data-role="content"]').removeClass('middle').addClass('middle-full-width').empty().append('<h3>Favor fechar aplicação através do botão "HOME" do seu dispositivo.</h3>');
                //$('#splash [data-role="content"]').removeClass('middle').addClass('middle-full-width').empty().append('<table width="100%" border="1" style="left:0%!important;"><tr><td><h3>Favor fechar aplicação através do botão "HOME" do seu dispositivo.</h3></td></tr></table>')
                app.changePage({pageId:'#splash'});
                break;
            default:
                navigator.app.exitApp();
            break;
        }
    },
    changePage: function(options) {
        if (!angular.isUndefinedOrNull(options)) {
            options.pageId = angular.isUndefinedOrNull(options.pageId) ? '#' : options.pageId;
            options.changeHash = angular.isUndefinedOrNull(options.changeHash) ? true : options.changeHash;
            options.transition = angular.isUndefinedOrNull(options.transition) ? 'fade' : options.transition;
            options.reverse = angular.isUndefinedOrNull(options.reverse) ? true : options.reverse;
            options.role = angular.isUndefinedOrNull(options.role) ? 'page' : options.role;

            $(':mobile-pagecontainer').pagecontainer('change',
                $(options.pageId),
                {
                    transition: options.transition,
                    changeHash: options.changeHash,
                    reverse: options.changeHash
                }
            );

            /*$.mobile.changePage(
                options.pageId, {
                    transition: options.transition,
                    changeHash: options.changeHash,
                    reverse: options.reverse,
                    role: options.role
                }
            );*/

        }
    },
    loadAngular: function() {
        if (!app.angularLoadingComplete) {
            angular.module("ipvaApp", ['ipvaApp.controllers', 'ipvaApp.services']);
            angular.bootstrap(document, ['ipvaApp']);
            app.angularLoadingComplete = true;
        }
    },
    validarToken: function() {
        $.ajax({
            url: app.serviceUrl('validarTokenService') + '?data={"token":"'+app.token()+'","plataforma":"'+app.plataforma()+'"}',
            //data : {'data':{"token":"18022014","plataforma":"ios"}},
            type: 'GET',
            dataType: 'json',
            success: function(result, status, xhr) {
                switch (result.responseCode) {
                    case 200:
                        app.loadApp();
                        break;
                    case 501:
                        app.popup({
                            titulo: {
                                texto: 'Atualização',
                                icone: 'fa-download',
                                tema: 'g'
                            },
                            botoes: [{
                                texto: 'Sim',
                                callback: function() {
                                    app.openAppStore();
                                    app.exitApp();
                                },
                                href: '#',
                                'data_rel': 'back',
                                icone: 'fa-check',
                                tema: 'g'
                            }, {
                                texto: 'Não',
                                callback: function() {
                                    app.exitApp();
                                },
                                href: '#',
                                'data_rel': 'back',
                                icone: 'fa-close',
                                tema: 'g'
                            }],
                            conteudo: 'Existe uma nova versão do IPVA Mobile disponível para download, gostaria de realizar a atualização nesse momento?'
                        });
                        break;
                    default:
                        break;
                }
            },
            error: function(xhr, status, error) {
                app.popup({
                    titulo: {
                        texto: null,
                        icone: 'fa-warning',
                        tema: 'f'
                    },
                    botoes: [{
                        texto: 'Sair da aplicação',
                        callback: function() {
                            app.exitApp();
                        },
                        href: '#',
                        'data_rel': 'back',
                        icone: 'fa-sign-out',
                        tema: 'g'
                    }],
                    conteudo: 'Ocorreu um erro ao contatar os servidores da SEF-MG. Por favor, verifique sua conexão com a Internet ou tente novamente mais tarde.'
                });
            }
        });
    },
    showLoading: function(text) {
        $.mobile.loading('show', {
            text: text,
            textVisible: true,
            theme: 'g',
            html: ""
        });
    },
    hideLoading: function() {
        $.mobile.loading('hide');
    },
    decodificaMensagemRetorno: function(mensagem) {
        return decodeURIComponent((mensagem + '').replace(/\+/g, '%20'));
    },
    exibirMensagemPadrao: function(mensagem) {
        switch (mensagem.tipo) {
            case 'receber_notificacao':
                app.popup({
                    titulo: {
                        texto: 'Receber Notificação',
                        icone: 'fa-info-circle',
                        tema: 'g'
                    },
                    conteudo: 'A notificação ocorrerá quando da disponibilização do IPVA para pagamento, na atualização do aplicativo, nos vencimentos da taxa de licenciamento, cota única ou parcelas e após o vencimento do IPVA caso o mesmo não tenha sido pago.'
                });
                break;
            case 'dados_veiculo':
                app.popup({
                    titulo: {
                        texto: mensagem.veiculo.nome,
                        icone: null,
                        tema: 'g'
                    },
                    botoes: [{
                        texto: 'Botão 1',
                        callback: '',
                        href: '#',
                        'data_rel': 'back',
                        icone: 'fa-trash-o',
                        tema: 'g'
                    }],
                    conteudo: '<table data-role="table" data-mode="columntoggle" class="ui-body-f ui-shadow table-stripe ui-responsive table-2-cols table-first-col-emphasis">' +
                        '<tbody>' +
                        '<tr>' +
                        '<th>Renavam:</th>' +
                        '<th>' + mensagem.veiculo.renavam + '</th>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Placa:</th>' +
                        '<th>' + mensagem.veiculo.placa + '</th>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Marca/Modelo:</th>' +
                        '<th>' + mensagem.veiculo.marca + '</th>' +
                        '</tr>' +
                        '<tr>' +
                        '<th>Ano Fabricação:</th>' +
                        '<th>' + mensagem.veiculo.ano + '</th>' +
                        '</tr>' +
                        '</tbody>' +
                        '</table>'
                });
                break;
        }
    },
    resetForm: function(manterRenavam) {
        var renavam = $('#txtRenavamCadastro').val();
        var form = $.mobile.activePage.find('form')[0];
        if (form) {
            form.reset();
        }

        if(manterRenavam){
            $('#txtRenavamCadastro').val(renavam);
        }
    },
    popup: function(opcoes) {
        var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
        if (!opcoes) {
            opcoes = {
                titulo: {
                    texto: 'Atenção',
                    icone: null,
                    tema: null
                },
                botoes: [{
                    texto: 'Voltar',
                    callback: null,
                    href: '#',
                    'data_rel': 'back',
                    icone: 'fa-reply',
                    tema: 'g'
                }],
                conteudo: '',
                dataRole: 'popup'
            };
        }

        if(typeof $.mobile !== 'undefined' && typeof $.mobile.activePage !== 'undefined')
        {
            var popup = $('<div>').attr({
                'id': 'popup',
                'data-role': (opcoes.dataRole || 'popup'),
                'data-theme': 'f',
                'data-overlay-theme': 'g',
                'data-dismissible': 'true',
                'class': 'popup'
            }).appendTo($.mobile.activePage.find('[data-role="content"]'));

            var popup_head = $('<div>').attr({
                'data-role': 'header',
                'role': 'banner',
                'data-theme': (opcoes.titulo.tema || 'g'),
                'class': 'popup-notificacao-titulo ui-header ui-bar-' + (opcoes.titulo.tema || 'g')
            }).appendTo(popup);
            $('<i>').attr({
                'class': 'fa ' + (opcoes.titulo.icone || 'fa-warning')
            }).appendTo(popup_head);
            if (opcoes.titulo && opcoes.titulo.texto) {
                $('<span>').text(opcoes.titulo.texto || '').appendTo(popup_head);
            }

            var popup_content = $('<div>').attr({
                'role': 'main',
                'class': 'ui-content'
            }).appendTo(popup);
            $('<h3>').attr({
                'class': 'ui-title center'
            }).appendTo(popup_content).html(opcoes.conteudo);

            if (!opcoes.botoes || opcoes.botoes.length < 1) {
                opcoes.botoes = [{
                    'texto': 'Voltar',
                    'href': '#',
                    'tema': 'g',
                    'callback': function() {
                        $.noop();
                    }
                }];
            }

            var popup_button_grid = $('<div>').attr({
                'class': 'ui-grid' + (opcoes.botoes.length > 1 ? '-' + alphabet[opcoes.botoes.length - 2] : '') + ' ui-theme-f'
            }).appendTo(popup_content);
            $(opcoes.botoes).each(function(index, botao) {
                var popup_button_grid_block = $('<div>').attr({
                    'class': 'ui-block-' + (opcoes.botoes.length > 1 ? alphabet[index] : 'solo')
                }).appendTo(popup_button_grid);
                var popup_buttons = $('<div>').attr({
                    'class': 'button-wrap'
                }).appendTo(popup_button_grid_block);
                var btn = $('<a>').attr({
                    'href': (botao.href || '#'),
                    'data-transition': 'flow',
                    //'data-rel': (botao.data_rel || 'back'),
                    'class': 'ui-shadow ui-btn ui-btn-' + (botao.tema || 'g') + ' ui-corner-all ui-mini'
                }).appendTo(popup_buttons);
                $('<i>').attr({
                    'class': 'fa ' + (botao.icone || 'fa-reply')
                }).appendTo(btn);
                $('<span>').text(botao.texto || 'Voltar').appendTo(btn);
                $(btn).on('click', function() {
                    $(popup).popup('close');
                });
                if (botao.callback) {
                    $(btn).on('click', botao.callback);
                }
            });

            $(popup).popup({history:false}).popup('open', {
                positionTo: "window",
                transition: 'pop'
            }).on('popupafteropen', function(event, ui){
                $(this).popup('reposition', 'positionTo: window');
            }).on("popupafterclose", function(event, ui) {
                $(this).remove();
            });
        }
    },
    lpad: function(str, max) {
        return str.length < max ? app.lpad("0" + str, max) : str;
    },
    sortByKey: function(array, key, order){
        order = (order || 'asc');
        return array.sort(function(a, b) {
            var x = a[key];
            var y = b[key];

            if (typeof x == "string")
            {
                x = x.toLowerCase();
                y = y.toLowerCase();
            }

            switch(order){
                case 'desc':
                    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
                break;
                default:
                    return ((x < y) ? -1 : ((x > y) ? 1 : 0));
                break;
            }
        });
    },
    getParamsFromQueryString : function(queryString){
        var match,
        pl     = /\+/g,  // Regex for replacing addition symbol with a space
        search = /([^&=]+)=?([^&]*)/g,
        decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
        urlParams = {};

        while (match = search.exec(queryString))
            urlParams[decode(match[1])] = decode(match[2]);

        return urlParams;
    }
};