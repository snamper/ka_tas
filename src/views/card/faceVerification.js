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
        userInfo:'',//用户信息
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
				title:'活体识别',
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
					Jsborya.registerMethods('payComplete',function(data){
						vm.callMethod('payComplete',[data.status]);
					});
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		payComplete:function(status){//支付完成
			//alert(status)
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
					vm.AJAX('../../../tas/w/business/payLaterStatus',json,function(data){
						var status=data.data.status;

						if(status!=2){
							clearInterval(window.Timer);
							vm.set('off.load',false);
						}

						if(status==2){
							//---
						}else if(status==1||status==4){
							var text='';
							status==1 ? text='订单超时已关闭' : status==4 ? text='支付失败，订单关闭' : text="异常错误，返回号板";
							layer.open({
		                        content:text,
		                        btn:['确定'],
		                        title:'提示',
		                        yes:function(){
		                        	vm.toIndexPage();
		                        }
		                    });
						}else{
							Jsborya.pageJump({
								url:'cardAudit.html',
								stepCode:999,
								depiction:'订单审核',
								header:{
			                        frontColor:'#ffffff',
			                        backgroundColor:'#4b3887',
			                    }
							});
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
		toFaceVerification:function(){
			Jsborya.faceVerification({
				name:vm.get('orderInfo').idCardName,
				number:vm.get('orderInfo').idCardNo,
				sysOrderId:vm.get('orderInfo').sysOrderId,
				complete:function(data){
					//alert(JSON.stringify(data));
					if(data.status==1){
						var limitSimilarity=parseFloat(vm.get('orderInfo').limitSimilarity),
						similarity=parseFloat(data.similarity);
						if(limitSimilarity<=similarity){
							vm.set('off.isPass',true);
						}
						vm.set('faceConfirmInfo.similarity',similarity);
						vm.set('off.isFace',true);
					}else{
						//失败
						vm.set('off.isFace',false);
					}
				}
			});
		},
		pay:function(){//去支付
			var vm=this,payType=vm.get('off').payType;
			if(vm.get('off').load)return false;
			vm.set('off.load',1);
			vm.AJAX('../../../tas/w/business/pay',{
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
					setTimeout(function(){
						layer.open({
							title:'支付操作确认',
							content:'如果您已完成支付操作，请点击【已支付】按钮;如果您未支付请重新发起支付',
							btn:['已支付','未支付'],
							yes:function(){
								vm.callMethod('payComplete',[1]);
							},
						});
					},1500);
					Jsborya.pageJump({
						url:'',
						stepCode:payType==2 ? "WECHAT_PAY" : "ALI_PAY",
						data:data.data,
						depiction:payType==2 ? "微信支付" : "支付宝支付",
						destroyed:false,
						header:{
	                        frontColor:'#ffffff',
	                        backgroundColor:'#4b3887',
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
		jumpToPrev:function(){
			Jsborya.pageBack({
                url:"certification.html",
                isLoad:true
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