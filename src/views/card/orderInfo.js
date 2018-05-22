require('../../public.js');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			isFace:false,//是否进行活体识别
			isPass:false//活体识别是否通过
		},
		cardInfo:{//卡槽信息
			slot:0,
			deviceType:1,
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
            "packageName":"--",
            "packageCode":"0",
        }
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'订单详情',
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

			let orderInfo=vm.getStore('ORDER_INFO'),
				cardInfo=vm.getStore('CARD_INFO');
				
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				vm.set('cardInfo',cardInfo);
				if(parseInt(orderInfo.similarity)){//已经进行活体识别
					var similarity=parseFloat(orderInfo.similarity);
					vm.set('off.isFace',true);
					var limitSimilarity=parseFloat(orderInfo.limitSimilarity);	
					if(limitSimilarity<=similarity){//识别通过
						vm.set('off.isPass',true);
					}
				}
				Jsborya.getGuestInfo({
					slot:cardInfo.slot,
					complete:function(userInfo){
						vm.set('userInfo',userInfo);

						Jsborya.registerMethods('headerLeftClick',function(){
							vm.orderCancel(userInfo,orderInfo.sysOrderId);
						});
					}
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		continueOrder:function(){
			let orderInfo=vm.get('orderInfo');
			let todo=vm.callMethod('filterOrderStatus',[orderInfo.orderStatusCode,orderInfo.similarity]);
            vm.setStore('ORDER_INFO',vm.get('orderInfo'));
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
		mathCentToYuan:function(value){
	    	return this.mathCentToYuan(value);
	    },
		mathDiscount:function(money,discount){
			return vm.mathDiscount(money,discount);
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