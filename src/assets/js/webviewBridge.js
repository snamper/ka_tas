/***
  *@info app与web交互方法,采用javascriptCore方式
  *@author: thinkmix
  *@date 2017-12-27
***/
require('./base64.js');
!function(a,b){
	"function" == typeof define && (define.amd || define.cmd) ? define(function() {
		return b(a)
	}) : b(a);
}(window,function(a){
	var URL=getLocalPath();
	
	function getLocalPath(){//获取url绝对路径
		var _url=window.location.href;
		_url=_url.split('.html')[0].split('/');
		_url.splice(_url.length-1,1);
		return _url.join('/')+'/';
	}
	
	function createFnName(){//生成函数名
		//return 'CB_WEB_FUNCTION';
		return 'CB_' + Date.now() + '_' + Math.ceil(Math.random() * 10);
	}
	function isYuanteliCard(){//判断是否在远特i卡app中
	    var ua = navigator.userAgent.toLowerCase();
	    if (ua.match(/yuantelicard/i) == "yuantelicard") {
	        return true;
	    } else {
	        return false;
	    }
	}

	function callHandler(props){
		let callbackName=createFnName();
		a[callbackName]=function(result){
			if(result){
				try{
					result=JSON.parse(BASE64.decode(result));
				}catch(error){
					alert('交互数据解析错误');
				}
			}
			props.callback(result);
		};
		if(window.webviewBridge.callHandler){
			window.webviewBridge.callHandler(props.name,BASE64.encode(JSON.stringify(props.data)),callbackName);
		}
	}
	a.Jsborya={
		ready:function(cb){
			if(isYuanteliCard()){
				let num=0;
				let timer=setInterval(function(){
					num++;
					if(window.webviewBridge){
						clearInterval(timer);
						cb();
					}else if(num/10>10){
						alert('挂载webviewBridge超时');
						clearInterval(timer);
					}
				},100);
			}else setTimeout(function(){
				window.webviewBridge={
					callHandler:function(){

					}
				};
				cb();
			},300);
		},
		getUserInfo:function(cb){//获取登录用户信息
			// cb({
			// 	"userId":"00000000000",
			// 	"phone":"",
			// 	"applicationID":"123",
			// 	"token":"BWsGzl9zLJk0QbLqzOWLLEVxcjX3KP+xx/hASMxWU26n6REchLNqU6RR9zY9H9he",
			// 	"timestamp":"1509608023665",
			// 	"packageName":"xxx.apk",
			// });
			callHandler({
				name:'getUserInfo',
				data:'',
				callback:function(result){
					cb(result);
				}
			});
		},
		getGuestInfo:function(cb){//获取新用户信息
			// cb({
			// 	"imsi":"",
			// 	"smsp":"",
			// 	"applicationID":"TF-1516003054260-48440280",
			// 	"iccid":"89860117841022194607",
			// 	"packageName":"com.yuantel.common.lite",
			// 	"timestamp":"1516073570172",
			// 	"token":"TmCyVptvK/vLl5onWkaZWAEf6hMKr+B36pfuwNDyiqjQWnrrljC497otIEF65zwmahMO1bl5hF0rkIBbXrsiMoMP7aGZS14Pk7DsTnAXWTg="
			// });
			callHandler({
				name:'getGuestInfo',
				data:'',
				callback:function(result){
					//alert('getGuestInfo'+JSON.stringify(result))
					cb(result);
				}
			});
		},
		webviewLoading:function(json){//loading
			callHandler({
				name:'webViewLoading',
				data:{
					isLoad:json.isLoad
				},
				callback:function(result){
					console.log('webviewLoading');
				}
			});
		},
		pageJump:function(json){//页面跳转
			json.url.indexOf("http")===-1 ? json.url=URL+json.url : void 0;
			if(!json.hasOwnProperty('destroyed'))json.destroyed=true;//默认是销毁当前视图

			if(isYuanteliCard()){
				callHandler({
					name:'pageJump',
					data:json,
					callback:function(result){
						console.log('jump');
					}
				});
			}else{
				if(json.data&&json.data.subUrl){
					window.location.href=json.data.subUrl;
				}else if(json.url){
					window.location.href=json.url;
				}
			}
			
		},
		pageBack:function(json){//页面返回
			json.url=URL+json.url;
			//window.location.href=json.url;
			callHandler({
				name:'pageBack',
				data:json,
				callback:function(result){
					console.log('back');
				}
			});
		},
		updateVersion:function(json){//app弹出版本更新
			callHandler({
				name:'updateVersion',
				data:json,
				callback:function(result){
					console.log('updateVersion');
				}
			});
		},
		dialog:function(json){//app弹出框
			callHandler({
				name:'dialog',
				data:json,
				callback:function(result){
					if(typeof json.yes==='function'){
						json.yes(result)
					}
				}
			});
		},
		takePhotos:function(json){
			callHandler({
				name:'takePhotos',
				data:json,
				callback:function(result){
					json.complete(result);
				}
			});
		},
		faceVerification:function(json){//活体识别
			// json.complete({
			// 	'status':'1',
			// 	'livingId':'20150710',
			// });
			callHandler({
				name:'faceVerification',
				data:json,
				callback:function(result){
					json.complete(result);
				}
			});
		},
		readCardICCID:function(cb){//读取ICCID
			// setTimeout(function(){
			// 	cb({
			// 		'status':'1',
			// 		'iccid':'89860117841022194607',
			// 	});
			// },1000);
			callHandler({
				name:'readCardICCID',
				data:'',
				callback:function(result){
					//alert('readCardICCID'+JSON.stringify(result));
					cb(result);
				}
			});
		},
		registerMethods:function(name,cb){//提供APP直接调用的方法注册接口
			a[name]=function(result){
				if(result)result=JSON.parse(BASE64.decode(result));
				cb(result);
			};
		},
		readCardIMSI:function(cb){//读取IMSI
			// setTimeout(function(){
			// 	cb({
			// 		'status':'1',
			// 		'imsi':'',
			// 	});
			// },1000);
			callHandler({
				name:'readCardIMSI',
				data:'',
				callback:function(result){
					//alert('readCardIMSI'+JSON.stringify(result));
					cb(result);
				}
			});
		},
		callWriteCard:function(json){//写卡
			// setTimeout(function(){
			// 	json.complete({
			// 		'status':'1',
			// 	});
			// },1000)
			alert('action:callWriteCard'+'\n'+JSON.stringify(json))
			callHandler({
				name:'callWriteCard',
				data:json,
				callback:function(result){
					alert('callWriteCard'+JSON.stringify(result));
					json.complete(result);
				}
			});
		},
		setHeader:function(json){//设置头部header
			//alert('setHeader'+JSON.stringify(json));
			callHandler({
				name:'setHeader',
				data:json,
				callback:function(result){
					console.log('success');
				}
			});
		},
		httpRequest:function(json){
			// setTimeout(function(){
			// 	json.complete(JSON.stringify({
			// 	    "code": "200",
			// 	    "msg": "success",
			// 	    "data": {
			// 	        "restFee": "155000",//可用余额，以分为单位
			// 	        "curTotalFee": "100",// 当月话费
			// 			"creditFee": "100",//信用度
			// 	    }
			// 	}));
			// },1000)
			callHandler({
				name:'httpRequest',
				data:json,
				callback:function(result){
					json.complete(result);
				}
			});
		}
	};
	
});

