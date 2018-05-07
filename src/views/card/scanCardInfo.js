require('../../public.js');
require('../../assets/css/scanCardInfo.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			status:4,//1可用卡;2有进行中订单，未写卡;3 开成功的卡;4 无效卡;5 已写卡等待开卡结果;6 已写卡开卡失败
			isEqual:false//扫描的卡与获取的卡是否相等
		},
		deviceStatus:1,//1、读取成功；2、读取失败；3、未插卡；4、未连接
		scanIccid:'',//扫描到的ICCID
		deviceType:1,//1、手机卡；2、手表卡
		userInfo:{
			iccid:'--'
		},
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
        }
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
					callback:'headerRightClick'
				}
			});
			
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
		},
		mounted:function(){
			let scanIccid=vm.getUrlParam('scanIccid'),
				deviceType=vm.getUrlParam('deviceType');
			if(scanIccid){
				vm.set('scanIccid',scanIccid);
				vm.set('deviceType',deviceType);
				vm.callMethod('readCardICCID');
				Jsborya.registerMethods('headerRightClick',function(){
					Jsborya.pageJump({
						url:'',
						stepCode:803,
						depiction:'设备管理',
						destroyed:false,
					});
				});
			}else alert('未扫描到卡板信息');
			
		},
	},
	methods:{
		readCardICCID:function(){
			var index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'});
			Jsborya.getGuestInfo(function(userInfo){
				vm.set('userInfo',userInfo);
				let scanIccid=vm.get('scanIccid'),
					deviceType=vm.get('deviceType'),
					isEqual=userInfo.iccid.indexOf(scanIccid)>-1;
				vm.set('off.isEqual',isEqual);
				if(isEqual){
					if(deviceType==2&&vm.get('off').status==1){//手表可用卡
						Jsborya.pageJump({
			                url:'index.html',
			                stepCode:999,
			                depiction:'随心配',
			                header:{
			                    frontColor:'#ffffff',
			                    backgroundColor:'#4b3887',
			                }
			            });
					}else {
						Jsborya.readCardIMSI(function(data){
							layer.close(index);
							vm.set('deviceStatus',data.status);

							if(data.status==1){
								vm.callMethod("iccidCheck",[data.imsi,data.smsp]);
							}
							
							if(deviceType==2){
								let icon='';
								if(data.status==1){
									icon='wcard_green';
								}else icon='wcard_red';
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
										icon:icon,
										value:'',
										callback:'headerRightClick'
									}
								});
							}
							
						});
					}
				}else if(scanIccid){
					vm.callMethod('iccidCheck',['','',scanIccid]);
				}else layer.close(index);
			});
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
			vm.AJAX('/ka_tas/w/source/iccidCheck',json,function(data){
				vm.set('off.status',data.data.status);
				let orderInfo=data.data.orderInfo;
				if(orderInfo){
					vm.set('orderInfo',orderInfo);
				}
			});
		},
		filterOrderStatus:function(orderStatusCode,similarity){
			let url='',depiction='',next='';
			if(orderStatusCode==='PACKAGE_SELECTION'){
                url='certification.html';
                depiction='已选择套餐';
                next='实名认证';
            }else if(orderStatusCode==='CARD_PAY'){
                url='pay.html';
                depiction='已支付';
                next='生成受理单';
            }else if(orderStatusCode==='CARD_AUDIT'){
                url='pay.html';
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
			let todo=vm.callMethod('filterOrderStatus',[orderInfo.orderStatusCode,orderInfo.similarity]);
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
		intervalGetResult:function(){

			//window.Timer=setInterval(function(){
				vm.AJAX('/ka_tas/w/business/getResult',{
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId
					}
				},function(data){
					var status=data.data.orderStatus;

					if(status==2){//开卡成功
						vm.set("off.status",3);
					}else if(status==3||status==4){
						vm.set("off.status",6);
						vm.set("orderInfo.orderDesc",data.data.desc);
					}

				});
			//},2000);
		},
		orderCancel:function(){
			return this.orderCancel(vm.get('userInfo'),vm.get('orderInfo').sysOrderId,true);
		},
		jumpToIndex:function(){
			vm.toIndexPage();
		},
		jumpToLogin:function(){
			Jsborya.pageJump({
				url:'',
				stepCode:801,
				depiction:'登录',
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