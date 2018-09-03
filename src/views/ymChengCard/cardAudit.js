require('../../public.js');
require('../card/css/cardAudit.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			step:1,//1,获取订单审核结果;2,提交开卡申请;
			errorStatus:0,//0,无失败状态;1,审核失败;2,提交开卡申请失败;
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
					value:'返回',
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

				let userInfo = vm.getStore("USER_INFO");
				if(userInfo){
					vm.set('userInfo',userInfo);
					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo);
					});
					if(orderInfo.orderStatusCode==='CARD_AUDIT'){//已审核通过
						vm.callMethod('submitOrder');
					}else{
						window.Timer=setInterval(function(){
							vm.callMethod('getAuditInfo');
						},2000);
					}
				}
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
			vm.AJAX('/tas/w/ymactive/queryAuditStatus',json,function(data){
				var status=data.data.status;
				// 1 等待审核结果
				// 2 审核成功
				// 3 审核失败
				if(status!=1){
					clearInterval(window.Timer);
				}

				if(status==2){
					vm.callMethod('submitOrder');
				}else if(status==3){
					vm.set('off.load',0);
					vm.set('off.errorStatus',1);
					vm.set('errorMsg','非常抱歉！审核未通过');

					let text='<p><span>原因：</span>'+data.data.reason+'</p>';
					if(data.data.remark)text+='<p><span>备注：</span>'+data.data.remark+'</p>';
					vm.set('auditReason',text);
				}
			},true);
		},
		submitOrder:function(){//开卡申请
			vm.set('off.step',2);
			vm.set('off.load',1);
			vm.AJAX('/tas/w/ymactive/orderSubmit',{
				'userInfo':vm.get("userInfo"),
				'params':{
					sysOrderId:vm.get("orderInfo").sysOrderId,
				}
			},function(data){
				Jsborya.pageJump({
					url:'cardActive.html',
					stepCode:'999',
					depiction:'开卡受理',
					header:{
                        frontColor:'#ffffff',
                        backgroundColor:'#4b3887',
                    }
				});
			},true,function(){
				vm.set('off.errorStatus',2);
			});
		},
		jumpBegin(){
			Jsborya.pageJump({
                url:'../card/scanInfo.html',
                stepCode:'999',
                depiction:'卡信息',
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
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