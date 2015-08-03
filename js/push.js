push = {
	token : null,
	mensagens : {
		'novoipva':'O IPVA #ANO# já está disponível nos bancos arrecadadores.',
		'p01d07':'Este mês vence a cota única ou a 1ª parcela do IPVA #ANO#. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'p02d07':'Este mês vence a 2ª parcela do IPVA #ANO#. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'p03d07':'Este mês vence 3ª parcela do IPVA #ANO# e a Taxa de Licenciamento. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'p01d01':'Amanhã vence a cota única ou a 1ª parcela do IPVA #ANO# do veículo placa #PLACA#. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'p02d01':'Amanhã vence a 2ª parcela do IPVA #ANO# do veículo placa #PLACA#. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'p03d01':'Amanhã vence a 3ª parcela do IPVA #ANO# do veículo placa #PLACA#. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'licd01':'Amanhã vence a Taxa de Licenciamento #ANO# do veículo placa #PLACA#. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'ipvavenc':'Não consta em nossos arquivos o pagamento do IPVA #ANO# referente ao veículo placa #PLACA#. Para pagamento procure uma das agências dos Bancos arrecadadores.',
		'licvenc':'Não consta em nossos arquivos o pagamento da taxa de licenciamento #ANO# referente ao veículo placa #PLACA#. Para pagamento procure uma das agências dos Bancos arrecadadores.'
	},
	plugin : function(){ return (typeof window.plugins !== 'undefined' && typeof window.plugins.pushNotification !== 'undefined') ? window.plugins.pushNotification : null; },
	exibirNotificacao : function(opcoes){
		app.popup(
			{
				titulo: {
					texto: opcoes.titulo || '',
					icone: 'fa-warning',
					tema: null
				},
				botoes: [{
					texto: 'OK',
					callback: null,
					href: '#',
					'data_rel': 'back',
					icone: 'fa-check',
					tema: 'g'
				}],
				conteudo: opcoes.conteudo,
				dataRole: 'popup'
			}
		);
	},
	sef : {
		register : function(token){
			if(typeof device !== 'undefined' && typeof device.uuid !== 'undefined'){
				$.ajax({
					url: app.serviceUrl('RegistraDispositivoService') + '?data={"plataforma":"'+app.plataforma()+'","token":"'+token+'","uuid":"'+ device.uuid +'","appId":"1"}',
					type: 'GET',
					//dataType: 'json',
					success: function(result, status, xhr) {
					},
					error: function(xhr, status, error) {
					}
				});
			}
		},
		registrarNotificacaoVeiculo : function(veiculo, exclusao){
			console.log('push.sef.registrarNotificacaoVeiculo');
			console.log(veiculo);
			if(typeof device !== 'undefined' && typeof device.uuid !== 'undefined'){
				$.ajax({
					url: app.serviceUrl('RegistraRenavamService') + '?data={"renavam":"'+veiculo.renavam+'","placa":"'+veiculo.placa+'","uuid":"'+ device.uuid +'","flAtivo":"'+(veiculo.notificacao.toLowerCase() === "sim" ? "S" : "N")+'","appId":"1","plataforma":"'+app.plataforma()+'","exclusao":"'+exclusao+'"}',
					type: 'GET',
					//dataType: 'json',
					success: function(result, status, xhr) {
					},
					error: function(xhr, status, error) {
					}
				});
			}
		}
	},
	ios : {
		register : function(){
			if(push.plugin()){
				push.plugin().register (
					push.ios.tokenHandler,
					push.ios.errorHandler,
					{
						'badge':'true',
						'sound':'true',
						'alert':'true',
						'ecb':'push.ios.onNotificationAPN'
					}
				);
			}
		},
		tokenHandler : function(token){
			push.token = token;
			push.sef.register(push.token.substring(0,64));
		},
		errorHandler : function(error){
			console.log('iOS - errorHandler - ' + error);
		},
		successHandler : function(){
			console.log('iOS - successHandler');
		},
		onNotificationAPN : function(e){
			push.msg = e;
			var mensagem = (e.alert) ? e.alert : '';
			if(typeof e.msgid !== 'undefined' && e.msgid.length > 0){
				if(typeof push.mensagens[e.msgid] !== 'undefined'){
					mensagem = push.mensagens[e.msgid];
				}
			}

			mensagem = mensagem.replace('#ANO#', (typeof e.ano !== 'undefined' && e.ano.length > 0) ? e.ano : Date.today().getFullYear());
			mensagem = mensagem.replace('#PLACA#', (typeof e.placa !== 'undefined' && e.placa.length > 0) ? e.placa : '???-????');

			//push.plugin().setApplicationIconBadgeNumber(push.ios.successHandler, push.ios.errorHandler, 1);

			push.exibirNotificacao({'conteudo':mensagem});
		}
	},
	android : {
		/*
		Android GCM PRD SEF:

		projectNumber : '642855065743',
		apiKey : 'AIzaSyCBZf34SWKt15AO_hwuPbc1Egqw4usJ_T8',
		*/
		register : function(){
			if(push.plugin()){
				push.plugin().register(
					push.android.successHandler,
					push.android.errorHandler,
					{
						'senderID':'642855065743',
						'ecb':'push.android.onNotificationGCM'
					}
				);
			}
		},
		successHandler : function(){ console.log('Android - successHandler'); },
		errorHandler : function(){ console.log('Android - errorHandler'); },
		onNotificationGCM : function(e){
			switch(e.event){
				case 'registered':
				if ( e.regid.length > 0 )
				{
					push.token = e.regid;
					//console.log('### TOKEN GCM ### : ' + push.token);
					push.sef.register(push.token.substring(0,64));
				}
				break;

				case 'message':
					// if this flag is set, this notification happened while we were in the foreground.
					// you might want to play a sound to get the user's attention, throw up a dialog, etc.
					var state = 'State';
					if(e.foreground){state = 'Foreground';}
					else if(e.coldstart){state = 'Coldstart';}
					else{state = 'Background';}

					var mensagem = e.payload.message;
					if(typeof e.payload.msgid !== 'undefined' && e.payload.msgid.length > 0){
						if(typeof push.mensagens[e.payload.msgid] !== 'undefined'){
							mensagem = push.mensagens[e.payload.msgid];
						}
					}

					mensagem = mensagem.replace('#ANO#', (typeof e.payload.ano !== 'undefined' && e.payload.ano.length > 0) ? e.payload.ano : Date.today().getFullYear());
					mensagem = mensagem.replace('#PLACA#', (typeof e.payload.placa !== 'undefined' && e.payload.placa.length > 0) ? e.payload.placa : '???-????');

					push.exibirNotificacao({'conteudo':mensagem});
				break;

				case 'error':
					console.log('Android - onNotification - error: ' + e.msg);
				break;

				default:
					console.log('Android - onNotification - default: Unknown event received - ' + e.event);
				break;
			}
		}
	},
	windows : {
		register : function(){
			if(push.plugin()){
				push.plugin().register(
					push.windows.channelHandler,
					push.windows.errorHandler,
					{
						"channelName": "IPVAWP8PushChannel",
						"ecb": "push.windows.onNotificationWP8",
						"uccb": "push.windows.channelHandler",
						"errcb": "push.windows.jsonErrorHandler"
					}
				);
			}
		},
		channelHandler : function(event){
			if(event.uri){
				push.token = event.uri;
				push.sef.register(push.token.substring(0,64));
			}
		},
		errorHandler : function(){
			console.log('Windows - errorHandler');
		},
		onNotificationWP8 : function(e){
			var params = {};
			if(typeof e !== 'undefined' && typeof e.jsonContent !== 'undefined' && typeof e.jsonContent["wp:Param"] !== 'undefined')
			{
				$(e.jsonContent["wp:Param"].slice(e.jsonContent["wp:Param"].indexOf('?')+1).split('&')).each(function(index, element){
					var p = element.split('=');
					params[p[0]] = p[1];
				});
			}

			var mensagem = e.jsonContent['wp:Text1'] + ' ' + e.jsonContent['wp:Text2'];
			if(typeof params.msgid !== 'undefined' && params.msgid.length > 0){
				if(typeof push.mensagens[params.msgid] !== 'undefined'){
					mensagem = push.mensagens[params.msgid];
				}
			}

			mensagem = mensagem.replace('#ANO#', (typeof params.ano !== 'undefined' && params.ano.length > 0) ? params.ano : Date.today().getFullYear());
			mensagem = mensagem.replace('#PLACA#', (typeof params.placa !== 'undefined' && params.placa.length > 0) ? params.placa : '???-????');

			push.exibirNotificacao({'conteudo':mensagem});
		},
		jsonErrorHandler : function(eror){
			console.log('Windows - jsonErrorHandler - ' + error.code + ' - ' + error.message);
		}
	}
};