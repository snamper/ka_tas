require('../../public.js');
require('./css/pay.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:!1,
			payType:"3",
			payStatus:0,//0,未支付;1,支付成功;2,支付失败;3,订单关闭;
		},
		orderInfo: {
            "phoneNum":"00000000000",
            "numberLevel":0,
            "cityName":"--",
            "createTime":"0",
            "cardMoney":"0",
            "cDiscount":10000,
            "orderStatusCode":"PACKAGE_SELECTION",
            "totalMoney":0,
            "limitSimilarity":0,
            "validTime":0,
            "sysOrderId":"00000000000000000",
            "prestoreMoney":0,
            "pDiscount":10000,
            "similarity":0,
            "idCardName":"--",
            "idCardNo":"--"
        },
        cardInfo:{//开卡信息
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0,
			discount:10000,
			slot:0,
			deviceType:1,
			belongType:0,
			iccid:''
		},
        userInfo:'',//用户信息
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'支付',
				left:{
					icon:'back_white',
					value:'',
					callback:'headerLeftClick'
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层

			let orderInfo=vm.getStore('ORDER_INFO'),
				cardInfo=vm.getStore('CARD_INFO');

			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				vm.set('cardInfo',cardInfo);

				if(orderInfo.orderStatusCode == "CARD_PAY") vm.set("off.payStatus",1);//已经支付了

				let userInfo = vm.getStore("USER_INFO");
				if(userInfo){
					vm.set('userInfo',userInfo);
					
					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo);
					});
					Jsborya.registerMethods('payComplete',function(data){
						// alert(`payComplete:${JSON.stringify(data)}`);
						vm.callMethod('payComplete',[data.status]);
					});
				}
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		payComplete:function(status){//支付完成
			
			layer.closeAll();
			vm.set('off.load',false);
			if(status==1){//支付成功
				const json={
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId,
					}
				};
				vm.set('off.load',2);
				window.Timer=setInterval(function(){
					vm.AJAX('/tas/w/business/payLaterStatus',json,function(data){
						var status=data.data.status;
						// 1 等待审核结果
						// 2 审核失败
						// 3 审核成功，待支付 
						// 4 事后审核，待支付 
						// 5 等待支付结果
						// 6 支付失败
						// 7 支付成功
						// 8 订单关闭
						if(status!=5){
							clearInterval(window.Timer);
							vm.set('off.load',false);
						}

						if(status==5){
							//---
						}else if(status==6){
							vm.set('off.payStatus',2);
						}else if(status==7){
							vm.set('off.payStatus',1);
						}else if(status==8){
							vm.set('off.payStatus',3);
						}
					},function(){

					});
				},2000);
			}else if(status==2){
				vm.set('off.load',false);
				layer.open({
					title:'支付失败',
					content:'如果您想重新发起支付，请点击【去支付】按钮',
					btn:['确定'],
					shadeClose:false,
				});
			}else if(status==3){
				vm.set('off.load',false);
				layer.open({
					title:'支付取消',
					content:'您已取消支付，如果想重新发起支付，请点击【去支付】按钮',
					btn:['确定'],
					shadeClose:false,
				});
			}else if(status==-1){
				let payType=vm.get('off').payType;
				if(payType==2)alert('请先安装【微信】客户端');
				if(payType==3)alert('请先安装【支付宝】客户端');
			}else{
				alert('异常支付状态');
			}
			
		},
		pay:function(){//去支付
			var vm=this,payType=vm.get('off').payType;
			if(vm.get('off').load)return false;
			vm.set('off.load',1);
			vm.AJAX('/tas/w/business/pay',{
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:vm.get('orderInfo').sysOrderId,
					payType:payType
				}
			},function(data){
				//alert(JSON.stringify(data));
				if(data.data.payStatusOld){
					vm.callMethod('payComplete',[1]);
				}else{
					// setTimeout(function(){
					// 	layer.open({
					// 		title:'支付操作确认',
					// 		content:'如果您已完成支付操作，请点击【已支付】按钮;如果您未支付请重新发起支付',
					// 		btn:['已支付','未支付'],
					// 		yes:function(){
					// 			vm.callMethod('payComplete',[1]);
					// 		},
					// 	});
					// },1500);
					Jsborya.pageJump({
						url:'',
						stepCode:payType==2 ? "WECHAT_PAY" : "ALI_PAY",
						data:data.data,
						depiction:payType==2 ? "微信支付" : "支付宝支付",
						destroyed:false,
						header:{
	                        frontColor:'#ffffff',
	                        backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
	                    }
					});
				}
					
			},function(){
				vm.set('off.load',false);
			});
		},
		shiftPayType:function(payType){
			vm.set('off.payType',payType);
		},
		createSheet:function(){//生成受理单
			var orderInfo=vm.get('orderInfo');
			vm.AJAX('/tas/w/business/acceptance',{//获取受理单图片
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:orderInfo.sysOrderId,
				}
			},function(data){
				var imgArray=data.data.images;
				for(let i =0;i<imgArray.length;i++){
					imgArray[i].imageName=imgArray[i].imageName.replace(/\\/g,"/");
				}

				Object.assign(orderInfo,{
					images:imgArray,
				});
				
				vm.setStore('ORDER_INFO',orderInfo);

				Jsborya.pageJump({
					url:'createSheet.html',
					stepCode:'999',
					depiction:'受理单',
					header:{
                        frontColor:'#ffffff',
                        backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
                    }
				});

			});
		},
		jumpToHome:function(){
			vm.jumpToHome();
		},
		mathCentToYuan:function(value){
	    	return this.mathCentToYuan(value);
	    },
	    mathDiscount:function(money,discount){
			return vm.mathDiscount(money,discount);
		},
	    phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
		filterLevel:function(level){
			return this.filterLevel(level);
	    },
	    getDateTime:function(timestamp){
	    	return this.getDateTime(timestamp);
	    }
	}
});


});