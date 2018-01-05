require('../../public.js');
require('../../assets/css/cardAudit.css');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			step:1,//1,订单审核中;2,审核成功;
			load:true
		},
		orderInfo: {//订单信息
			"sysOrderId":"00000000000000000",
			"createTime":"0",
			"phone": "00000000000",
	        "numberLevel":"0",
	        "cityName": "--",
			"totalMoney":"0.00",//总价格
			"cardMoney":0,//号码占用费
			"prestoreMoney":0,//预存价格   
	    },
        userInfo:'',
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'订单审核',
				frontColor:'#ffffff',
				backgroundColor:'#4b3887',
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

			let orderInfo=this.getStore('ORDER_INFO');
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);

					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo.sysOrderId);
					});
					window.Timer=setInterval(function(){
						vm.callMethod('getAuditInfo');
					},2000);
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
			vm.AJAX('../../w/business/payLaterStatus',json,function(data){
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
				}

				if(status==5||status==7){
					vm.set('off.load',false);
					vm.set('off.step',2);
				}else if(status==6){
					var text='<p class="f-tal">原因：'+data.data.reason;
					if(data.data.remark)text+='<br>备注：data.data.remark';
					layer.open({
                        content:text+'</p>',
                        btn:['确定'],
                        title:'审核失败',
                    });
				}else if(status==3||status==2){
					//---
				}else{
					var text='';
					status==1 ? text='订单超时已关闭' : status==4 ? text='支付失败，订单关闭' : status==8 ? text='开卡失败' : void 0;
					layer.open({
                        content:text,
                        btn:['确定'],
                        title:'提示',
                        yes:function(){
                        	Jsborya.pageJump({
                                url:"index.html",
                                stepCode:'2001'
                            });
                        }
                    });
				}
			},true);
		},
		createSheet:function(){//生成受理单
			if(vm.get('off').step==2){
				Jsborya.pageJump({
					url:'createSheet.html',
					stepCode:999,
				});
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