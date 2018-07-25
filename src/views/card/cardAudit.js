require('../../public.js');
require('./css/cardAudit.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			step:1,//1,订单审核中;2,审核成功;3,审核失败
			load:1
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
            "idCardNo":"--",
            "packageName":"--",
            "packageCode":"0"
        },
        errorMsg:'',
        auditReason:'',
        userInfo:'',
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'订单审核',
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
				Jsborya.getGuestInfo({
					slot:cardInfo.slot,
					complete:function(userInfo){
						vm.set('userInfo',userInfo);

						Jsborya.registerMethods('headerLeftClick',function(){
							vm.orderCancel(userInfo,orderInfo.sysOrderId);
						});
						if(orderInfo.orderStatusCode==='CARD_AUDIT'){//已审核通过
							vm.set('off.step',2);
							vm.set('off.load',0);
						}else{
							window.Timer=setInterval(function(){
								vm.callMethod('getAuditInfo');
							},2000);
						}
					}
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		getAuditInfo:function(){
			const json={
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:vm.get('orderInfo').sysOrderId
				}
			};
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
				if(status!=1){
					clearInterval(window.Timer);
					vm.set('off.load',false);
				}

				if(status==3||status==4){
					vm.set('off.step',2);
				}else if(status==1){
					//---
				}else{
					vm.set('off.step',3);

					// let title='';
					// status==8 ? title='订单已关闭' : status==2 ? title='非常抱歉！审核未通过' : '未知错误';
					vm.set('errorMsg','非常抱歉！审核未通过');

					let text='<p><span>原因：</span>'+data.data.reason+'</p>';
					if(data.data.remark)text+='<p><span>备注：</span>'+data.data.remark+'</p>';
					vm.set('auditReason',text);
				}
			},true);
		},
		jumpToPay:function(){
			let step=vm.get('off').step, belongType = vm.get('orderInfo').belongType;
			if(step==2){

				if(belongType==1){//专营号码,不需要支付
					vm.callMethod('createSheet');
				}else{
					Jsborya.pageJump({
						url:'pay.html',
						stepCode:'999',
						depiction:'支付',
						header:{
		                    frontColor:'#ffffff',
		                    backgroundColor:vm.getHeaderColor(vm.get('cardInfo').deviceType),
		                }
					});
				}
				
			}else if(step==3){
				vm.jumpToHome();
			}
		},
		createSheet:function(){//生成受理单
			var orderInfo=vm.get('orderInfo');

			vm.AJAX('/tas/w/business/pay',{
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:orderInfo.sysOrderId,
					payType:1
				}
			},function(data){

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

			});	
		},
	    phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
	    getDateTime:function(timestamp){
	    	return this.getDateTime(timestamp);
	    }
	}
});


});