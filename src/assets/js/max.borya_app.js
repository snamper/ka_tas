/***
  *@info app与web交互方法
  *@author: thinkmix
  *@date 2017-12-27
***/
!function(a,b){
	"function" == typeof define && (define.amd || define.cmd) ? define(function() {
		return b(a)
	}) : b(a);
}(window,function(a){
	var OS=getUserAgent(),URL=getLocalPath();
	
	function getLocalPath(){
		var _url=window.location.href;
		_url=_url.split('.html')[0].split('/');
		_url.splice(_url.length-1,1);
		return _url.join('/')+'/';
	}
	
	function getUserAgent(){
		var e = navigator.userAgent,
		t = (navigator.appVersion, e.indexOf("Android") > -1 || e.indexOf("Linux") > -1),
		n = !!e.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
		return t ? 1 : n ? 2 : void 0//1:andriod,2:ios
	}
	function connect(init,callback){
		if(1==OS&&window.WebViewJavascriptBridge ? init(WebViewJavascriptBridge) : document.addEventListener('WebViewJavascriptBridgeReady',function(){
			init(WebViewJavascriptBridge)
			callback();
		},!0),2==OS){
			window.WVJBCallbacks = [init];
	        var WVJBIframe = document.createElement('iframe');
	        WVJBIframe.style.display = 'none';
	        WVJBIframe.src = 'https://__bridge_loaded__';
	        document.documentElement.appendChild(WVJBIframe);
	        setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0);
	        callback();
		}
	}
	function callHandler(props){
		var data=props.data ? encodeURI(JSON.stringify(props.data)) : '';
		window.WebViewJavascriptBridge ? window.WebViewJavascriptBridge.callHandler(props.name,data,props.callback)  : null;
	}
	a.Jsborya={
		ready:function(cb){
			connect(function(bridge) {
			    bridge.init(function(message, responseCallback) {
			        console.log('connect success ！', message);
			    });
		    },cb);
		},
		getUserInfo:function(cb){//获取app用户信息
			// cb(encodeURI(JSON.stringify({
			// 	"userId":"00000",
			// 	"applicationID":"123",
			// 	"token":"BWsGzl9zLJk0QbLqzOWLLEVxcjX3KP+xx/hASMxWU26n6REchLNqU6RR9zY9H9he",
			// 	"timestamp":"1509608023665",
			//	"packageName":"xxx.apk",
			// })));
			callHandler({
				name:'getUserInfo',
				data:'',
				callback:function(str){
					cb(str);
				}
			});
		},
		webviewLoading:function(json){//loading
			callHandler({
				name:'webViewLoading',
				data:{
					isLoad:json.isLoad
				},
				callback:function(str){
					console.log('webviewLoading');
				}
			});
		},
		pageJump:function(json){//页面跳转
			json.url.indexOf("http")===-1 ? json.url=URL+json.url : void 0;
			//window.location.href=json.url;
			callHandler({
				name:'pageJump',
				data:json,
				callback:function(str){
					console.log('jump');
				}
			});
		},
		pageBack:function(json){//页面返回
			json.url=URL+json.url;
			//window.location.href=json.url;
			callHandler({
				name:'pageBack',
				data:json,
				callback:function(str){
					console.log('back');
				}
			});
		},
		updateVersion:function(json){//app弹出版本更新
			callHandler({
				name:'updateVersion',
				data:json,
				callback:function(str){
					console.log('updateVersion');
				}
			});
		},
		dialog:function(json){//app弹出框
			callHandler({
				name:'dialog',
				data:json,
				callback:function(str){
					json.yes ? json.yes(str) : console.log('dialog');
				}
			});
		},
		takePhotos:function(json){
			callHandler({
				name:'takePhotos',
				data:json,
				callback:function(str){
					json.complete(str);
				}
			});
		},
		faceVerification:function(json){//活体识别
			// json.complete(encodeURI(JSON.stringify({
			// 	'status':'1',
			// 	'livingId':'20150710',
			// })));
			callHandler({
				name:'faceVerification',
				data:json,
				callback:function(str){
					json.complete(str);
				}
			});
		},
		readCardICCID:function(cb){//读取ICCID
			// setTimeout(function(){
			// 	cb(encodeURI(JSON.stringify({
			// 		'status':'1',
			// 		'iccid':'231456487894232',
			// 	})));
			// },3000)
			callHandler({
				name:'readCardICCID',
				data:'',
				callback:function(str){
					cb(str);
				}
			});
		},
		readCardIMSI:function(cb){//读取IMSI
			// setTimeout(function(){
			// 	cb(BASE64.encode(JSON.stringify({
			// 		'status':'1',
			// 		'imsi':'',
			// 	})));
			// },3000)
			
			callHandler({
				name:'readCardIMSI',
				data:'',
				callback:function(str){
					cb(str);
				}
			});
		},
		callWriteCard:function(json){//写卡
			// setTimeout(function(){
			// 	json.complete(BASE64.encode(JSON.stringify({
			// 		'status':'1',
			// 	})));
			// },3000)
			callHandler({
				name:'callWriteCard',
				data:json,
				callback:function(str){
					json.complete(str);
				}
			});
		},
		setHeader:function(json){//设置头部header
			callHandler({
				name:'setHeader',
				data:json,
				callback:function(str){
					console.log('success');
				}
			});
		}
	};
	
});

