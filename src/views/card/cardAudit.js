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
			vm.AJAX('../../../tas/w/business/payLaterStatus',json,function(data){
				var status=data.data.status;
				// 1 已关闭
				// 2 等待支付结果
				// 3 支付成功，待审核 
				// 4 支付失败
				// 5 审核成功
				// 6 审核失败
				// 7 事后审核
				if(status!=3&&status!=2){
					clearInterval(window.Timer);
					vm.set('off.load',false);
				}

				if(status==5||status==7){
					vm.set('off.step',2);
				}else if(status==1||status==6){
					vm.set('off.step',3);
					vm.set('errorMsg',status==6 ? '非常抱歉！审核未通过' : '订单已关闭');
					let text='<p><span>原因：</span>'+data.data.reason+'</p>';
					if(data.data.remark)text+='<p><span>备注：</span>'+data.data.remark+'</p>';
					vm.set('auditReason',text);
				}else if(status==3||status==2){
					//---
				}else{
					vm.set('off.step',3);
					let text='';
					status==4 ? text='支付失败，订单关闭' : status==8 ? text='开卡失败' : void 0;
					vm.set('errorMsg',text);
				}
			},true);
		},
		createSheet:function(){//生成受理单
			let step=vm.get('off').step;
			var orderInfo=vm.get('orderInfo');
			if(step==2){
				vm.AJAX('../../../tas/w/business/acceptance',{//获取受理单图片
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
						stepCode:999,
						depiction:'确认受理单',
						header:{
	                        frontColor:'#ffffff',
	                        backgroundColor:'#4b3887',
	                    }
					});

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