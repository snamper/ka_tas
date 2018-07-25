require('../../public.js');
require('./css/recharge.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		userInfo:{},
		off:{
			load:!1,//1,支付中;2,获取支付结果中
			select:999,
			payType:"3",
			payStatus:1,//0,未支付;1,待支付;2,支付成功;3,支付失败;
		},
		faceList:[{
			fee:1000,discount:1000,status:0
		},{
			fee:2000,discount:1000,status:0
		},{
			fee:3000,discount:1000,status:0
		},{
			fee:5000,discount:1000,status:0
		},{
			fee:10000,discount:1000,status:0
		},{
			fee:20000,discount:1000,status:0
		}],
		deviceType:1,//1,i卡;2,手表;3,eSIM;
		recharge:{
			phone:'',
			isp:0,
			city:''
		},
		minFee:10,//最小充值金额
		inputMoney:'',
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			Jsborya.setHeader({
				title:'手机充值',
				backgroundColor:'#4b3887',
				left:{
					icon:'back_white',
					value:'返回',
					callback:''
				},
				right:{
					icon:'',
					value:'充值记录',
					callback:'headerRightClick'
				}
			});

			let deviceType = vm.getUrlParam('deviceType');
			if(deviceType)vm.set('deviceType',deviceType);

			Jsborya.getUserInfo(function(userInfo){
				vm.set('userInfo',userInfo);
				vm.set('recharge.phone',userInfo.phone);
				vm.callMethod('getPhoneInfo');

				Jsborya.registerMethods('headerRightClick',function(){
					Jsborya.pageJump({
		                url:'rechargeOrder.html',
		                stepCode:'999',
		                depiction:'充值记录',
		                destroyed:false,
		                header:{
		                    frontColor:'#ffffff',
		                    backgroundColor:vm.getHeaderColor(vm.get('deviceType')),
		                }
		            });
				});
				Jsborya.registerMethods('payComplete',function(data){
					alert(`payComplete:${JSON.stringify(data)}`);
					vm.callMethod('payComplete',[data.status]);
				});
			});
		}
	},
	methods:{
		phoneKeydown(e){
			
			if(e.keyCode != 8){
				setTimeout(function(){
					let val = vm.get('recharge').phone;
					if(val.length == 3){
						let w = val.split('');
		            	w.splice(3,0,' ');
						vm.set('recharge.phone',w.join(''));
					}else if(val.length == 8){
						let w = val.split('');
		            	w.splice(8,0,' ');
						vm.set('recharge.phone',w.join(''));
					}else if(val.length == 13){
						vm.callMethod('getPhoneInfo');
					}
				},0);
			}

		},
		faceSelect(index){
			let status = parseInt(vm.get('faceList')[index].status);

			if(status){
				if(vm.get('off').select == index){
					vm.set('off.select',999);
				}else vm.set('off.select',index);
			}
			
		},
		getPhoneInfo(){
			let phone = vm.get('recharge').phone;
			phone = phone.replace(/\s+/g, "");
			const json={
	  			params:{
	  				phoneNum:phone
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/tms/w/phone/check',json,function(data){
				vm.set('recharge.city',data.data.address);
				vm.set('recharge.isp',data.data.isp);
				vm.set('faceList',data.data.feeList);
				vm.set('minFee',parseInt(data.data.minFee)/100);
			});
		},
		clearInput(){
			vm.set('recharge',{
				phone:'',
				isp:0,
				city:''
			});
			vm.set('faceList',[{
				fee:1000,discount:1000,status:0
			},{
				fee:2000,discount:1000,status:0
			},{
				fee:3000,discount:1000,status:0
			},{
				fee:5000,discount:1000,status:0
			},{
				fee:10000,discount:1000,status:0
			},{
				fee:20000,discount:1000,status:0
			}]);
		},
		clickInputMoney(){
			vm.set('off.select',999);
		},
		onInputMoney(){
			let action = vm.debounce(800,function(){
				let val = vm.get('inputMoney'),
					minFee = vm.get('minFee');
				if(val.length){
					if(/(^[1-9]\d*$)/.test(val)){
						if(val<minFee){
							layer.open({
		                        content:`最少不能小于${minFee}元`,
		                        skin: "msg",
		                        time: 3
		                    });
							return false;
						}
					}else{
						layer.open({
	                        content:'请输入整数',
	                        skin: "msg",
	                        time: 3
	                    });
						return false;
					}
				}
			});

			action();
		},
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
					vm.AJAX('/tms/w/phone/payResult',json,function(data){
						var status=data.data.payStatus;
						//1待支付2支付成功3支付失败
						if(status!=1){
							clearInterval(window.Timer);
							vm.set('off.load',false);
						}

						vm.set('off.payStatus',status);
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
			let payType=vm.get('off').payType,
				recharge = vm.get('recharge'),
				deviceType = vm.get('deviceType');
			let phone = recharge.phone.replace(/\s+/g, "");

			if(vm.get('off').select == 999){
				layer.open({
                    content:'请选择面值',
                    skin: "msg",
                    time: 3
                });
				return false;
			}

			if(vm.get('off').load)return false;
			vm.set('off.load',1);

			vm.AJAX('/tms/w/phone/recharge',{
				userInfo:vm.get('userInfo'),
				params:{
					phoneNum:phone,
					payType:payType,
					rechargeFee:vm.get('faceList')[vm.get('off').select].fee,
					isp:recharge.isp,
					deviceType:deviceType,
				}
			},function(data){
				//alert(JSON.stringify(data));
				if(data.data.payStatusOld){
					vm.callMethod('payComplete',[1]);
				}else{
					// if(deviceType == 3){
					// 	setTimeout(function(){
					// 		layer.open({
					// 			title:'支付操作确认',
					// 			content:'如果您已完成支付操作，请点击【已支付】按钮;如果您未支付请重新发起支付',
					// 			btn:['已支付','未支付'],
					// 			yes:function(){
					// 				vm.callMethod('payComplete',[1]);
					// 			},
					// 		});
					// 	},1500);
					// }
					
					Jsborya.pageJump({
						url:'',
						stepCode:payType==2 ? "WECHAT_PAY" : "ALI_PAY",
						data:data.data,
						depiction:payType==2 ? "微信支付" : "支付宝支付",
						destroyed:false,
						header:{
	                        frontColor:'#ffffff',
	                        backgroundColor:vm.getHeaderColor(deviceType),
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
		mathDiscount(money,discount){
			return this.mathCentToYuan(parseInt(money) * discount / 1000);
		},
		mathCentToYuan:function(value){
			return this.mathCentToYuan(value);
		},
		phoneFormat:function(phone){
			return this.phoneFormat(phone);
		},
	}
});
});