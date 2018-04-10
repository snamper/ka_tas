require('../../public.js');
require('../../assets/css/faceVerification.css');
var icon_shibie=require('../../assets/img/icon_shibie.png');
Jsborya.ready(function(){


var vm=new Moon({
	el:'#app',
	data:{
		off:{
			isFace:1,
			isPass:!1
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
				});
			}else{
				alert('本地订单信息丢失');
			}
		}
	},
	methods:{
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
		jumpToPrev:function(){
			Jsborya.pageBack({
                url:"certification.html",
                isLoad:true
            });
		},
		jumpToAudit:function(){
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
	}
});


});