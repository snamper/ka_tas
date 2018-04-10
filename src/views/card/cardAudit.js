require('../../public.js');
require('../../assets/css/cardAudit.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			step:1,//1,订单审核中;2,审核成功;3,审核失败
			load:1
		},
		orderInfo: {
            "phoneNum":"00000000000",
            "numberLevel":0,
            "cityName":"--",
            "createTime":"0",
            "cardMoney":"0",
            "orderStatusCode":"PACKAGE_SELECTION",
            "totalMoney":0,
            "limitSimilarity":0,
            "validTime":0,
            "sysOrderId":"00000000000000000",
            "prestoreMoney":0,
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

			let orderInfo=vm.getStore('ORDER_INFO');
			
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				Jsborya.getGuestInfo(function(userInfo){
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
			vm.AJAX('/ka-tas/w/business/payLaterStatus',json,function(data){
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
				}else if(status==2){
					vm.set('off.step',3);
					vm.set('errorMsg','非常抱歉！审核未通过');
					let text='<p><span>原因：</span>'+data.data.reason+'</p>';
					if(data.data.remark)text+='<p><span>备注：</span>'+data.data.remark+'</p>';
					vm.set('auditReason',text);
				}else if(status==1){
					//---
				}else{
					vm.set('off.step',3);
					let text='';
					status==8 ? text='订单已关闭' : '未知错误';
					vm.set('errorMsg',text);
				}
			},true);
		},
		jumpToPay:function(){
			let step=vm.get('off').step;
			if(step==2){
				Jsborya.pageJump({
					url:'pay.html',
					stepCode:999,
					depiction:'支付',
					header:{
	                    frontColor:'#ffffff',
	                    backgroundColor:'#4b3887',
	                }
				});
			}else if(step==3){
				vm.toIndexPage();
			}
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