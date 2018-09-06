require('../../public.js');
require('./css/slotInfo.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			status:4,//1可用卡;2有进行中订单，未写卡;3 开成功的卡;4 无效卡;5 已写卡等待开卡结果;6 已写卡开卡失败
		},
		cardInfo:{//卡槽信息
			slot:0,
			deviceType:1,
			iccid:''
		},
		deviceType:0,//1、手机卡；2、手表卡
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
            "bizType":4,
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
		},
		mounted:function(){
			let cardInfo=vm.getStore('CARD_INFO'),
				orderInfo=vm.getStore('ORDER_INFO');
			if(cardInfo&&orderInfo){
				vm.set('off.status',orderInfo.status);
				vm.set('cardInfo',cardInfo);
				vm.set('orderInfo',orderInfo);
				
				let userInfo = vm.getStore("USER_INFO");
				if(userInfo){
					vm.set('userInfo',userInfo);
					
					if(!parseInt(orderInfo.setPwd) && orderInfo.status==3){
						vm.callMethod('intervalGetResult',[true]);

						window.Timer = setInterval(function(){
							vm.callMethod('intervalGetResult',[true]);
						},1000*20);

					}
				}
			}else{
				//alert('本地信息错误');
			}
			
		},
	},
	methods:{
		
		filterOrderStatus:function(){
			let url='',depiction='',next='', orderInfo = vm.get('orderInfo');
			let orderStatusCode = orderInfo.orderStatusCode,
				similarity = orderInfo.similarity,
				bizType = orderInfo.bizType,
				belongType = orderInfo.belongType;

			if(orderStatusCode==='PACKAGE_SELECTION'){
                url='certification.html';
                depiction='已选择套餐';
                next='实名认证';
            }else if(orderStatusCode==='CARD_PAY'){
            	
                if(bizType==6){
                	depiction='已支付';
                	next='写卡';
                	url='cardWriting.html';
                }else{//成卡，白卡
                	depiction='已支付';
                	next='开卡申请';
                	url='pay.html';
                }

            }else if(orderStatusCode==='CARD_AUDIT'){
				url='pay.html';
				depiction='已审核';
				next='支付';
            }else if(orderStatusCode==='CREATE_SHEET'){
            	if(bizType==6){
                	url='cardWriting.html';
	                depiction='已生成受理单';
	                next='写卡';
                }else{//成卡，白卡
                	depiction='已支付';
                	next='开卡申请';
                	url='pay.html';
                }
            }else if(orderStatusCode==='CARD_IMSI'){
                url='cardWriting.html';
                depiction='已获取IMSI';
                next='写卡';
            }else if(orderStatusCode==='CARD_WRITING'){
                url='cardActive.html';

                if(bizType==6){
                	depiction='写卡成功，等待开卡结果';
               		next='开卡受理';
                }else{//成卡，白卡
                	depiction='开卡申请成功';
                	next='开卡受理';
                }
               	
            }else if(orderStatusCode==='CARD_ACTIVE'){
            	let orderStatus=vm.get('off').status;
                url='';
                next='';
                if(orderStatus==3){
                	if(bizType == 7){
                		depiction='已激活';
                	}else depiction='开卡成功';
                	
                }else if(orderStatus==6){
                	depiction='开卡失败';
                }
            }else if(parseInt(similarity)){
            	url='cardAudit.html';
                depiction='已上传资料';
                next='订单审核';
            }else if(orderStatusCode==='UPLOAD_DATA'){
                url='faceVerification.html';
                depiction='已上传资料';
                next='活体识别';
            }

            if(bizType == 4 || bizType == 5){
            	url = '../active/' + url;
            }else if(bizType == 7){
            	url = '../ymChengCard/' + url;
            }
            return {url:url,depiction:depiction,next:next};
		},
		continueOrder:function(){
			let orderInfo=vm.get('orderInfo'),
				todo=vm.callMethod('filterOrderStatus');

            // alert(`订单信息：${JSON.stringify(orderInfo)}`)

            Jsborya.pageJump({
                url:todo.url,
                stepCode:'999',
                depiction:todo.next,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
		},
		intervalGetResult:function(closeLoad){
			let url = '',orderInfo = vm.get('orderInfo');
			if(orderInfo.bizType == 7){//远盟开成卡
				url = '/tas/w/ymactive/querySubmitStatus';
			}else url = '/tas/w/business/getResult';

			//window.Timer=setInterval(function(){
				vm.AJAX(url,{
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId
					}
				},function(data){
					var status=data.data.orderStatus;

					if(status == 1){
						layer.open({
	                        content:'该订单正在处理中，请耐心等待...',
	                        skin: "msg",
	                        time: 3
	                    });
					}else if(status==2){//开卡成功
						vm.set("off.status",3);
						vm.set("orderInfo.setPwd",'1');

						if(!closeLoad){
							window.Timer = setInterval(function(){
								vm.callMethod('intervalGetResult',[true]);
							},1000*20);
						}
	
						// if(parseInt(data.data.setPwd))clearInterval(window.Timer);
					}else if(status==3||status==4){
						vm.set("off.status",6);
						vm.set("orderInfo.orderDesc",data.data.desc || data.data.reason);
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
		jumpToSlot:function(){
			Jsborya.pageBack({
                url:'slot.html',
                isLoad:false
            });
		},
		jumpToLogin:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:'801',
				depiction:'登录',
				data:{
					phone:vm.get('orderInfo').phoneNum
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