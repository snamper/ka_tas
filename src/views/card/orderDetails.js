require('../../public.js');
require('../../assets/css/orderDetails.css');

Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			isFace:false,//是否进行活体识别
			isPass:false//活体识别是否通过
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
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
		continueOrder:function(){
			let orderInfo=vm.get('orderInfo');
			let url=vm.callMethod('filterOrderStatus',[orderInfo.orderStatusCode]).url;
            
            Jsborya.pageJump({
                url:url,
                stepCode:999,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
		},
		filterOrderStatus:function(orderStatusCode){
			let url='',depiction='';
			if(orderStatusCode==='PACKAGE_SELECTION'){
                url='certification.html';
                depiction='已选择套餐';
            }else if(orderStatusCode==='UPLOAD_DATA'){
                url='faceVerification.html';
                depiction='已上传资料';
            }else if(orderStatusCode==='CARD_PAY'){
                url='cardAudit.html';
                depiction='已支付';
            }else if(orderStatusCode==='CARD_AUDIT'){
                url='createSheet.html';
                depiction='已审核';
            }else if(orderStatusCode==='CREATE_SHEET'){
                url='cardWriting.html';
                depiction='已生成受理单';
            }else if(orderStatusCode==='CARD_IMSI'){
                url='cardWriting.html';
                depiction='已获取IMSI';
            }else if(orderStatusCode==='CARD_WRITING'){
                url='cardActive.html';
               depiction='已写卡';
            }else if(orderStatusCode==='CARD_ACTIVE'){
                url='cardActive.html';
                depiction='已获得开卡结果';
            }
            return {url:url,depiction:depiction};
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