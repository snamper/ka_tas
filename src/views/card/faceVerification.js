require('../../public.js');
require('../../assets/css/faceVerification.css');
var icon_shibie=require('../../assets/img/icon_shibie.png');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			isFace:!1,
			isPass:!1,
			load:!1,
			counter:0,
			payType:"2",
			layerIndex:0,
		},
		numberValue:0,//选号费计算
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
        userInfo:{'sysOrderId':'000000000000000000'},//用户信息
        faceConfirmInfo:{//活体认证信息
        	'img':'',
        	'similarity':'0',
        	'softwareName':'',
        	'livingId':''
        }
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'开卡受理',
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
				if(orderInfo.similarity){//已经进行活体识别
					var similarity=parseFloat(orderInfo.similarity);
					vm.set('off.isFace',true);
					vm.set('faceConfirmInfo.similarity',similarity);
					var limitSimilarity=parseFloat(orderInfo.limitSimilarity);	
					if(limitSimilarity<=similarity){//识别通过
						vm.set('off.isPass',true);
					}
				}
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);

					Jsborya.registerMethods('headerLeftClick',function(){
						vm.orderCancel(userInfo,orderInfo.sysOrderId);
					});
					Jsborya.registerMethods('payComplete',function(){
						vm.callMethod('payComplete');
					});
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		payComplete:function(){//支付完成
			const json={
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:vm.get('orderInfo').sysOrderId,
				}
			};
			vm.set('off.load',2);
			window.Timer=setInterval(function(){
				vm.AJAX('../../w/business/payLaterStatus',json,function(data){
					var status=data.data.orderStatus;

					if(status!=2){
						clearInterval(window.Timer);
						vm.set('off.load',false);
					}

					if(status==2){
						//---
					}else if(status==1||status==4){
						var text='';
						status==1 ? text='订单超时已关闭' : status==4 ? text='支付失败，订单关闭' : text="异常错误，返回号板";
						layer.closeAll();
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
					}else{
						Jsborya.pageJump({
							url:'cardAudit.html',
							stepCode:999,
						});
					}
				},function(){

				});
			},2000);
			// layer.open({
			// 	title:'支付操作确认',
			// 	content:'如果您已完成支付操作，请点击【支付完成】按钮;如果您放弃支付请点击左上角【放弃】按钮，放弃此订单！',
			// 	btn:['支付完成','取消'],
			// 	type:1,
			// 	style:"width:75%;max-width:640px;",
			// 	shadeClose:false,
			// 	yes:function(){
			// 		vm.callMethod("getPayInfo");
			// 	}
			// });
		},
		toFaceVerification:function(){
			Jsborya.faceVerification({
				name:vm.get('orderInfo').idCardName,
				number:vm.get('orderInfo').idCardNo,
				complete:function(data){
					data=JSON.parse(BASE64.decode(data));
					if(data.status==1){
						vm.set('faceConfirmInfo.livingId',data.livingId);
						vm.callMethod('beginGetResult');
					}else{
						//失败
						vm.set('off.isFace',false);
					}
				}
			});
		},
		beginGetResult:function(){
			var index=0;
			index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'});
			vm.set('off.layerIndex',index);

			window.Timer=setInterval(function(){
				var counter=vm.get('off').counter;
				if(counter>60){
					clearInterval(window.Timer);
					layer.close(index);
					vm.set('off.counter',0);

					setTimeout(function(){
						layer.open({
							title:'验证超时',
							content:'获取服务器响应超时，您可以重新查询识别结果。',
							btn:['重新查询','取消'],
							yes:function(){
								layer.closeAll();
								vm.callMethod('beginGetResult');
							}
						});
					},2000)
					
				}else{
					counter++;
					vm.set('off.counter',counter);
				}
			},1000);
			vm.callMethod('getFaceVerificationResult');
		},
		getFaceVerificationResult:function(){
			vm.AJAX('../../w/business/livingResult',{
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:vm.get('orderInfo').sysOrderId,
					livingId:vm.get('faceConfirmInfo').livingId
				}
			},function(data){
				clearInterval(window.Timer);
				layer.close(vm.get('off').layerIndex);
				vm.set('off.counter',0);
				
				if(data.data.state==1){
					vm.set('faceConfirmInfo.similarity',data.data.similarity);
					vm.set('off.isFace',true);
					var limitSimilarity=parseFloat(vm.get('orderInfo').limitSimilarity),
					similarity=parseFloat(data.data.similarity);
					if(limitSimilarity<=similarity){
						vm.set('off.isPass',true);
					}

				}else if(data.data.state==2){		
					layer.open({
                        content:'订单超时已关闭',
                        btn:['返回选号'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            Jsborya.pageJump({
								url:'index.html',
								stepCode:'2001',
							});
                        }
                    });
					
				}else{
					vm.callMethod('getFaceVerificationResult');
				}
			},function(){

			});

		},
		pay:function(){//去支付
			var vm=this,payType=vm.get('off').payType;
			if(vm.get('off').load)return false;
			vm.set('off.load',1);
			vm.AJAX('../../w/business/pay',{
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:vm.get('orderInfo').sysOrderId,
					payType:payType
				}
			},function(data){
				vm.set('off.load',1);
				Jsborya.pageJump({
					url:'',
					stepCode:payType==2 ? "WECHAT_PAY" : "ALI_PAY",
					data:data.data,
				});		
			},false,function(){
				vm.set('off.load',false);
			});
		},
		
		jumpToPrev:function(){
			Jsborya.pageBack({
                url:"certification.html",
                isLoad:false
            });
		},
		mathCentToYuan:function(value){
	    	return this.mathCentToYuan(value);
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