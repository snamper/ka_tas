require('../../public.js');
require('../../assets/css/slotInfo.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			status:4,//1可用卡;2有进行中订单，未写卡;3 开成功的卡;4 无效卡;5 已写卡等待开卡结果;6 已写卡开卡失败
		},
		deviceStatus:1,//1、读取成功；2、读取失败；3、未插卡；4、未连接
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
        },
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'读取卡信息',
				frontColor:'#ffffff',
				backgroundColor:'#4b3887',
				left:{
					icon:'back_white',
					value:'',
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
				
				Jsborya.getGuestInfo({
					slot:cardInfo.slot,
					complete:function(userInfo){
						vm.set('userInfo',userInfo);

						if(orderInfo.setPwd==0 && orderInfo.status==3){
							vm.callMethod('intervalGetResult',[true]);

							window.Timer = setInterval(function(){
								vm.callMethod('intervalGetResult',[true]);
							},1000*20);


						}

					}
				});
			}else{
				//alert('本地信息错误');
			}
			
		},
	},
	methods:{
		readCardICCID:function(){
			var index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'});
			let slot = vm.get('cardInfo').slot;
			Jsborya.readCardICCID({
				slot:slot,
				complete:function(result){
					if(result.status==1){
						Jsborya.readCardIMSI({
							slot:slot,
							complete:function(data){
								layer.close(index);
								vm.callMethod("iccidCheck",[data.imsi,data.smsp]);
							}
						});
					}else{
						layer.close(index);
						vm.callMethod('filterConnectStatus',result.status);
					} 
				}
			});
		},
		iccidCheck:function(imsi,smsp,scanIccid){
			let deviceType=vm.get('deviceType');
			const json={
	  			params:{
	  				imsi:imsi||'',
	  				smsp:smsp||'',
	  				scanIccid:scanIccid||''
	  			},
	  			userInfo:vm.get('userInfo')
	  		};
			vm.AJAX('/tas/w/source/iccidCheck',json,function(data){
				vm.set('off.status',data.data.status);
				vm.set('orderInfo',orderInfo);
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
                next='实名认证';
            }else if(orderStatusCode==='CARD_PAY'){
                if(belongType==1){
                	url='cardAudit.html';
                }else url='pay.html';

                depiction='已支付';
                next='生成受理单';
            }else if(orderStatusCode==='CARD_AUDIT'){
                if(belongType==1){
                	url='cardAudit.html';
                }else url='pay.html';
                
                depiction='已审核';
                next='支付';
            }else if(orderStatusCode==='CREATE_SHEET'){
                url='createSheet.html';
                depiction='已生成受理单';
                next='确认受理单';
            }else if(orderStatusCode==='CARD_IMSI'){
                url='cardWriting.html';
                depiction='已获取IMSI';
                next='写卡';
            }else if(orderStatusCode==='CARD_WRITING'){
                url='cardActive.html';
               	depiction='写卡成功，等待开卡结果';
               	next='开卡受理';
            }else if(orderStatusCode==='CARD_ACTIVE'){
            	let orderStatus=vm.get('off').status;
                url='';
                next='';
                if(orderStatus==3){
                	depiction='开卡成功';
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
            return {url:url,depiction:depiction,next:next};
		},
		continueOrder:function(){
			let orderInfo=vm.get('orderInfo');
			let todo=vm.callMethod('filterOrderStatus');
			orderInfo.iccid=vm.get('userInfo').iccid;
            vm.setStore('ORDER_INFO',orderInfo);
            Jsborya.pageJump({
                url:todo.url,
                stepCode:999,
                depiction:todo.next,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
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
						if(data.data.setPwd)clearInterval(window.Timer);
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
			return this.orderCancel(vm.get('userInfo'),vm.get('orderInfo').sysOrderId,true);
		},
		jumpToHome:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:806,
				depiction:'首页',
			});
		},
		jumpToLogin:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:801,
				depiction:'登录',
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