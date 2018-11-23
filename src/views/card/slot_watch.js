require('../../public.js');
require('./css/slotInfo.css');
require('./css/slot_watch.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			status:4,//1可用卡;2有进行中订单，未写卡;3 开成功的卡;4 无效卡;5 已写卡等待开卡结果;6 已写卡开卡失败
		},
		deviceStatus:1,//1、读取成功；2、读取失败；3、未插卡；4、未连接
		cardInfo:{//卡槽信息
			slot:'-1',
			deviceType:3,//1、手机卡；2、手表卡；3、亿能eSIM
			iccid:'--',
		},
		load:{
			read:false
		},
		deviceName:'--',
		devicePower:0,
		orderInfo:{
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
            "packageName":"--",
            "packageCode":"0",
            "setPwd":0,//0、未设置密码；1、设置成功；2、设置失败；
        },
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'读取卡信息',
				left:{
					icon:'back_white',
					value:'返回',
					callback:''
				},
				right:{
					icon:'',
					value:'',
					callback:''
				}
			});
			
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
			vm.callMethod("readCardICCID");
			
			Jsborya.registerMethods('headerRightClick',function(){
				vm.callMethod('jumpToDeviceManagement');
			});
		},
		mounted:function(){
			
		},
	},
	methods:{
		readCardICCID:function(){
			vm.set("load.read",true);

			Jsborya.readWatchInfo({//读取手表信息
				deviceType:'3',
				complete:function(watchInfo){
					vm.set("deviceStatus",watchInfo.status==3 ? 4 : watchInfo.status);

					if(watchInfo.status == 1){
						vm.set("devicePower",watchInfo.power);
						vm.set("deviceName",watchInfo.deviceName);

						Jsborya.readCardICCID({//读取iccid
							slot:'-1',
							complete:function(result){
								if(result.status==1){

									vm.set("cardInfo.iccid",result.iccid[0]);
									Jsborya.getGuestInfo({
										slot:'-1',
										complete:function(userInfo){
											vm.set('userInfo',userInfo);
											vm.setStore("USER_INFO",userInfo);

											Jsborya.readCardIMSI({//读取imsi
												slot:'-1',
												complete:function(data){
													vm.callMethod("iccidCheck",[data.imsi,data.smsp,result.iccid[0]]);
												}
											});
										}
									});
									
								}else{
									vm.set("load.read",false);
									vm.callMethod('filterConnectStatus',[result.status]);
								} 
							}
						});
					}else{
						vm.set("load.read",false);
						if(watchInfo.status == 3) watchInfo.status = 4;
						vm.callMethod('filterConnectStatus',[watchInfo.status]);
					}
				}
			})
			
		},
		iccidCheck:function(imsi,smsp,scanIccid){
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  				scanIccid:scanIccid||''
	  			},
	  			userInfo:vm.get('userInfo')
	  		};

			vm.AJAX('/tas/w/source/iccidCheck',json,function(data){
				vm.set("load.read",false);
				vm.set('off.status',data.data.status);

				let cardInfo = vm.get("cardInfo");
				vm.set("cardInfo",cardInfo);

				if(data.data.status == 1){
					vm.setStore("CARD_INFO",cardInfo);
					
					Jsborya.pageJump({
		                url:'index.html',
		                stepCode:'999',
		                depiction:'随心搜',
		                header:{
		                    frontColor:'#ffffff',
		                    backgroundColor:'#00923f',
		                }
		            });
				}

				if(data.data.orderInfo){
					vm.set('orderInfo',data.data.orderInfo);

					if(!parseInt(data.data.orderInfo.setPwd) && data.data.status==3){
						vm.callMethod('intervalGetResult',[true]);

						window.Timer = setInterval(function(){
							vm.callMethod('intervalGetResult',[true]);
						},1000*20);
					}
				}
				

			},true,function(){
				vm.set("load.read",false);
			});
		},
		filterOrderStatus:function(){
			let url='',depiction='',next='', orderInfo = vm.get('orderInfo');
			let orderStatusCode = orderInfo.orderStatusCode,
				similarity = orderInfo.similarity,
				belongType = orderInfo.belongType;

			if(orderStatusCode==='PACKAGE_SELECTION'){
                url='certification.html';
                depiction='已选择套餐';
                next='号码开通';
            }else if(orderStatusCode==='CARD_PAY'){
                if(belongType==1){
                	url='cardAudit.html';
                }else url='pay.html';

                depiction='已支付';
                next='号码开通';
            }else if(orderStatusCode==='CARD_AUDIT'){
                if(belongType==1){
                	url='cardAudit.html';
                }else url='pay.html';
                
                depiction='已审核';
                next='号码开通';
            }else if(orderStatusCode==='CREATE_SHEET'){
                url='createSheet.html';
                depiction='已生成受理单';
                next='受理单';
            }else if(orderStatusCode==='CARD_IMSI'){
                url='cardWriting.html';
                depiction='已获取IMSI';
                next='号码开通';
            }else if(orderStatusCode==='CARD_WRITING'){
                url='cardActive.html';
               	depiction='码号信息写入成功，等待开通结果';
               	next='号码开通';
            }else if(orderStatusCode==='CARD_ACTIVE'){
            	let orderStatus=vm.get('off').status;
                url='';
                next='';
                if(orderStatus==3){
                	depiction='开通成功';
                }else if(orderStatus==6){
                	depiction='开通失败';
                }
            }else if(parseInt(similarity)){
            	url='cardAudit.html';
                depiction='已上传资料';
                next='号码开通';
            }else if(orderStatusCode==='UPLOAD_DATA'){
                url='faceVerification.html';
                depiction='已上传资料';
                next='号码开通';
            }
            return {url:url,depiction:depiction,next:next};
		},
		continueOrder:function(){
			let orderInfo=vm.get('orderInfo'),
				todo=vm.callMethod('filterOrderStatus');

			orderInfo.iccid=vm.get('cardInfo').iccid;
            vm.setStore('ORDER_INFO',orderInfo);
            vm.setStore("CARD_INFO",vm.get("cardInfo"));

            Jsborya.pageJump({
                url:todo.url,
                stepCode:'999',
                depiction:todo.next,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#66B92A',
                }
            });
		},
		intervalGetResult:function(closeLoad){

			//window.Timer=setInterval(function(){
				vm.AJAX('/tas/w/business/getResult',{
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId
					}
				},function(data){
					var status=data.data.orderStatus;

					if(status==2){//开卡成功
						vm.set("off.status",3);
						vm.set("orderInfo.setPwd",data.data.setPwd);

						if(!closeLoad){
							window.Timer = setInterval(function(){
								vm.callMethod('intervalGetResult',[true]);
							},1000*20);
						}
	
						if(parseInt(data.data.setPwd))clearInterval(window.Timer);
					}else if(status==3||status==4){
						vm.set("off.status",6);
						vm.set("orderInfo.orderDesc",data.data.desc);
					}

					if(status!=1){
						vm.set('orderInfo.orderStatusCode','CARD_ACTIVE');
					}

				},closeLoad);
			//},2000);
		},
		orderCancel:function(){
			return this.orderCancel(vm.get('userInfo'),vm.get('orderInfo'),true);
		},
		jumpToHome:function(){
			vm.jumpToHome();
		},
		jumpToApp(){
			Jsborya.pageJump({
              url:'',
              stepCode:'807',
              depiction:'返回APP',
              data:{
              	sysOrderId:vm.get('orderInfo').sysOrderId
              }
            });
		},
		jumpToLogin:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:'801',
				depiction:'登录',
				data:{
					phone:vm.get('orderInfo').phoneNum,
				}
			});
		},
		filterConnectStatus:function(status){
			let text='';
			if(status==2){
				text='读取SIM卡信息失败';
			}else if(status==3){
				text='未检测到SIM卡插入卡槽';
			}else if(status==4){
				text='设备未连接';
			}else{
				text='异常错误';
			}
			layer.open({
                content:text,
                btn:['确定'],
                shadeClose:false,
				title:'提示',
				yes:function(){
                	layer.closeAll();
                	if(status == 4){
                		vm.callMethod('jumpToDeviceManagement');
                	}
                }
            });
		},
		jumpToDeviceManagement(){
			Jsborya.pageJump({
				url:'',
				stepCode:'803',
				depiction:'设备管理',
				destroyed:false,
			});
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
	}
});


});