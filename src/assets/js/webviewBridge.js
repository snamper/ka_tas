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
			// 	"appVersion": "2017122800",
			// 	"phoneType": "VTR-AL00",
			// 	"authCode": "234680",
			// 	"latitude": "30.591936",
			// 	"type": "0",
			// 	"userId": "17092510264",
			// 	"host_id": "192.168.10.12",
			// 	"token": "eMlFCoe3i2pR9jyJ+JFgPxkix6VKz1DBgQ7kGL1/XTWgG+cnKW3CDbhgEBqE8/paVU2EnpG0tXtGWc4gBtLAkeqyTtIYT1QHjzAKKieXLLAVfsYRt7AKWjm2Tob6rlQw1an7J6N4cf1U8P45xDNtnA==",
			// 	"osVersion": "8.0.0",
			// 	"phone": "17092510264",
			// 	"osType": "2",
			// 	"imei": "864600035504846",
			// 	"packageName": "com.yuantel.common.lite",
			// 	"applicationID": "TF-1525772531434-829851885",
			// 	"net": "WIFI",
			// 	"timestamp": "1525773551533",
			// 	"longitude": "104.062499"
			// })
			callHandler({
				name:'getUserInfo',
				data:'',
				callback:function(result){
					cb(result);
				}
			});
		},
		getGuestInfo:function(json){//获取新用户信息
			// json.complete({
			// 	"applicationID":"864600035504846",
			// 	"iccid":"89860117841022194433",
			// 	"packageName":"com.yuantel.common.lite",
			// 	"timestamp":"1535965693974",
			// 	"token":"i7duKWjMHCjKYWR3pylt1Dh5JjdCpwhZIeY/CH5HC2c1xhUXFNARVhPxcYaZJfs0Ak1GUII8ix+miXtf1LgJTPg5gdHGTtgJCy4KirirMW71P5lTB7OUAOalE2fN4a9g"
			// });
			//alert('getGuestInfo传值:'+JSON.stringify(json))
			callHandler({
				name:'getGuestInfo',
				data:json,
				callback:function(result){
					//alert('getGuestInfo'+JSON.stringify(result))
					json.complete(result);
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
				//alert('pageJump'+JSON.stringify(json));
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
			//alert('pageBack传值：'+JSON.stringify(json));
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
					//alert(`faceVerification:${JSON.stringify(result)}`)
					json.complete(result);
				}
			});
		},
		readCardICCID:function(json){//读取ICCID
			// setTimeout(function(){
			// 	json.complete({
			// 		'status':'1',
			// 		'iccid':['89860117841022194433',''],
			// 	});
			// },1000);
			callHandler({
				name:'readCardICCID',
				data:json,
				callback:function(result){
					//alert('readCardICCID'+JSON.stringify(result));
					json.complete(result);
				}
			});
		},
		registerMethods:function(name,cb){//提供APP直接调用的方法注册接口
			a[name]=function(result){
				if(result && result!='null')result=JSON.parse(BASE64.decode(result));
				cb(result);
			};
		},
		readCardIMSI:function(json){//读取IMSI
			// setTimeout(function(){
			// 	json.complete({
			// 		'status':'1',
			// 		'imsi':'',
			// 		'smsp':''
			// 	});
			// },1000);
			callHandler({
				name:'readCardIMSI',
				data:json,
				callback:function(result){
					//alert('readCardIMSI'+JSON.stringify(result));
					json.complete(result);
				}
			});
		},
		callWriteCard:function(json){//写卡
			// setTimeout(function(){
			// 	json.complete({
			// 		'status':'1',
			// 	});
			// },1000)
			callHandler({
				name:'callWriteCard',
				data:json,
				callback:function(result){
					//alert('callWriteCard'+JSON.stringify(result));
					json.complete(result);
				}
			});
		},
		readWatchInfo:function(json){

			if(json.deviceType!=1){
				// setTimeout(function(){
				// 	json.complete({
				// 		status:1,
				// 		power:'40',
				// 		deviceName:'手表'
				// 	});
				// },1000);
				callHandler({
					name:'readWatchInfo',
					data:'',
					callback:function(result){
						//alert('readWatchInfo'+JSON.stringify(result));
						json.complete(result);
					}
				});
			}else json.complete({//非手表直接返回
				status:1,
				power:'',
				deviceName:''
			});
			
		},
		setHeader:function(json){//设置头部header
			//alert(`setHeader:${JSON.stringify(json)}`);
			callHandler({
				name:'setHeader',
				data:json,
				callback:function(result){
					console.log('success');
				}
			});
		},
		callScanQRCode:function(json){//扫一扫
			// json.complete({
			// 	result:'8986011484100114274',
			// 	status:1
			// });
			callHandler({
				name:'callScanQRCode',
				data:json,
				callback:function(result){
					//alert('callScanQRCode'+JSON.stringify(result));
					json.complete(result);
				}
			});
		},
		callMessageNotice:function(json){
			//alert('callMessageNotice'+JSON.stringify(json));
			callHandler({
				name:'callMessageNotice',
				data:json,
				callback:function(result){
					console.log('success');
				}
			});
		},
		freeCache:function(json){//清除APP缓存
			callHandler({
				name:'freeCache',
				data:json,
				callback:function(result){
					console.log('freeCache');
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

