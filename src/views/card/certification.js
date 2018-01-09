require('../../public.js');
require('../../assets/css/certification.css');
var imgToBase64=require('../../assets/js/imgToBase64.js');
Jsborya.ready(function(){

var vm=new Moon({
	el:'#app',
	data:{
		off:{
			load:false,
			isJump:0,
			signature:true,
			agree:false,
		},
		userInfo:'',
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
	    idCardInfo:{
	    	'name':'',
	    	'address':'',
	    	'number':'',
	    	'period':'--',
	    	'devMac':'--',
	    	'devInfo':'--',
	    	'livingSoftwareName':'真信'
	    },
	    uploadType:0,//上传图片类型
	    imgName:{//上传后返回的图片地址
	    	a:'',//正面
	    	b:'',//反面
	    	c:'',//手持
	    	d:''//手签名
	    },
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'开卡受理',
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

			let windowWidth=document.documentElement.clientWidth,photoHeight=(windowWidth/2-20)*0.602;
			document.getElementById("photo-front").style.height=photoHeight+"px";
			document.getElementById("photo-back").style.height=photoHeight+"px";

			vm.callMethod("initSignaturePad");

			let orderInfo=this.getStore('ORDER_INFO');
			if(orderInfo){
				vm.set('orderInfo',orderInfo);
				Jsborya.getGuestInfo(function(userInfo){
					vm.set('userInfo',userInfo);

					Jsborya.registerMethods('uploadImgComplete',function(data){//android 上传后回调
						vm.callMethod("uploadImgComplete",[JSON.parse(BASE64.decode(data))]);
				    });
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
		initSignaturePad:function(){//初始化签名面板
			var signatureDom=document.getElementById('signature'),//canvas dom对象
			window_h=document.documentElement.clientHeight,//视图高度
			ratio=Math.max(window.devicePixelRatio || 1, 1);//DPR
			signatureDom.height=(window_h-107-100)*ratio;

			const signaturePad=new SignaturePad(signatureDom, {
			  backgroundColor: 'rgba(255, 255, 255, 0)',
			  penColor: 'rgb(0, 0, 0)'
			});
			//保存按钮
			document.getElementById('save').addEventListener('click', function (event) {
			  var data = signaturePad.toDataURL('image/png');
			  document.getElementById('signatureImg').style.backgroundImage="url("+data+")";
			  vm.callMethod("upLoadImgData",[data.split(",")[1],4]);
			  vm.set('uploadType',4);
			  vm.callMethod('doSignature');
			  //console.log(data);
			});
			//修改按钮
			document.getElementById('clear').addEventListener('click', function (event) {
			  signaturePad.clear();
			});

			signatureDom.width = signatureDom.offsetWidth * ratio;
			signatureDom.height = signatureDom.offsetHeight * ratio;
			signatureDom.getContext("2d").scale(ratio, ratio);
			signaturePad.clear();
			vm.set('off.signature',false);
			Jsborya.webviewLoading({isLoad:false});//关闭app加载层
		},
		takePhotos:function(type){//调用APP接口获取图片
			Jsborya.takePhotos({
				type:type,
				multiple:false,
				apiComplete:'uploadImgComplete',
				complete:function(data){
					data=JSON.parse(BASE64.decode(data));
					var os=getUserAgent();
					var photoItem=data.photoList[0];
					if(type==3){//正面
						document.getElementById("photo-front").style.backgroundImage="url(data:image/jpeg;base64,"+photoItem+")";
						vm.set('uploadType',1);
					}else if(type==4){//反面
						document.getElementById("photo-back").style.backgroundImage="url(data:image/jpeg;base64,"+photoItem+")";
						vm.set('uploadType',2);
					}
				}
			});
		},
		uploadImgComplete(data){
			var index=vm.get('uploadType');
			if(data.data.imgName){
				if(index==1){
					vm.set('imgName.a',data.data.imgName);
					if(data.data.userName){
						vm.set("idCardInfo.name",data.data.userName);
						vm.set("idCardInfo.address",data.data.userAddress);
						vm.set("idCardInfo.number",data.data.iDcard);
					}else{
						layer.open({
		                    content:"身份证识别失败",
		                    skin: "msg",
		                    msgSkin:'error',
		                    time: 3
		                });
					}
				}else if(index==2){
					vm.set('imgName.b',data.data.imgName);
				}else if(index==3){
					vm.set('imgName.c',data.data.imgName);
				}else if(index==4){
					vm.set('imgName.d',data.data.imgName);
				}
				
				vm.callMethod("checkIsJump");
			}else{
				layer.open({
                    content:index==1 ? '身份证正面上传失败，请重试' : index==2 ? '身份证反面上传失败，请重试' : index==3 ? '手持照片上传失败，请重试' : '上传手签名照片失败',
                    skin: "msg",
                    msgSkin:'error',
                    time: 4
                });
			}
		},
		upLoadImgData:function(data,index){//上传图片
			var vm=this,json={
				userInfo:vm.get('userInfo'),
				params:{
					sysOrderId:vm.get('orderInfo').sysOrderId,
					img:data,
					imgNo:index
				}
			};
			vm.AJAX('../../w/business/imgUpload',json,function(data){
				vm.callMethod('uploadImgComplete',[data]);
			});
		},
		checkIsJump:function(){//检测是否执行下一步操作
			var vm=this;
			if(vm.get('idCardInfo').name&&vm.get('idCardInfo').number&&vm.get('idCardInfo').address&&vm.get('imgName').a&&vm.get('imgName').b&&vm.get('imgName').d&&vm.get('off').agree){
				vm.set('off.isJump',true);
			}else{
				vm.set('off.isJump',false);
			}
		},
		jump:function(){//上传资料
			const callLayer=(text)=>{
				layer.open({
                    content:text,
                    skin: "msg",
                    msgSkin:'error',
                    time: 3
                });
			};
			if(!vm.get('imgName').a){
				callLayer('请上传身份证正面照片');
	            return false;
			}else if(vm.get('idCardInfo').name==''){
				callLayer('请输入姓名');
                return false;
			}else if(vm.get('idCardInfo').number==''){
				callLayer('请输入证件号码');
                return false;
			}else if(vm.get('idCardInfo').address==''){
				callLayer('请输入证件地址');
                return false;
			}else if(!vm.get('imgName').b){
				callLayer('请上传身份证反面照片');
                return false;
			}else if(!vm.get('imgName').d){
				callLayer('请添加手签名照片');
                return false;
			}else if(!vm.get('off').agree){
				callLayer('请先同意入网服务协议');
                return false;
			}else{
				var json={
					userInfo:vm.get('userInfo'),
					params:{
						userName:vm.get('idCardInfo').name,//身份证姓名
						iDcard:vm.get('idCardInfo').number,//身份证号码
						userAddress:vm.get('idCardInfo').address,//身份证地址
						period:vm.get('idCardInfo').period,//有效期
						devInfo:vm.get('idCardInfo').devInfo,//设备信息
						devMac:vm.get('idCardInfo').devMac,//设备MAC地址
						livingSoftwareName:vm.get('idCardInfo').livingSoftwareName,
						imageName:vm.get('imgName').a,//正面照片
						backImageName:vm.get('imgName').b,//反面照片
						// 'handImageName':vm.get('imgName').c,//手持照片
						signImageName:vm.get('imgName').d,//手签名
						sysOrderId:vm.get('orderInfo').sysOrderId,
					}
				}
				vm.AJAX('../../w/business/materialUpload',json,function(data){
					let orderInfo=Object.assign(vm.get('orderInfo'),{
						idCardName:vm.get('idCardInfo').name,
						idCardNo:vm.get('idCardInfo').number
					});
					vm.getStore('ORDER_INFO',orderInfo);
					Jsborya.pageJump({
						url:'faceVerification.html',
						stepCode:999,
						header:{
	                        frontColor:'#ffffff',
	                        backgroundColor:'#4b3887',
	                    }
					});
				});
			}
		},
		skimAgreement:function(){
			Jsborya.pageJump({
				url:"http://km.m10027.com/yt-rwxy.html",
				stepCode:800,
				header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
			});
		},
		agree:function(){//click agree ...
			if(this.get('off').agree){
				this.set('off.agree',false);
			}else{
				this.set('off.agree',true);
				this.callMethod("doSignature",[1]);
			}
			this.callMethod("checkIsJump");
		},
		doSignature:function(off){//show or hidden signaturePad
			this.set('off.signature',off||0);
		},
		inputFocus:function(e){
			e.target.style.textAlign="left";
		},
		inputBlur:function(e){
			e.target.style.textAlign="right";
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