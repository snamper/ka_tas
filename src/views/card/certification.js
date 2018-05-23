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
			signature:false,
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
            "packageName":"--",
            "packageCode":"0"
        },
       cardInfo:{//开卡信息
			phone:'00000000000',
			cityName:'未知',
			cityCode:'100',
			pretty:'1',
			phoneMoney:0,
			phoneLevel:0,
			discount:10000,
			slot:0,
			deviceType:1,
			iccid:''
		},
	    idCardInfo:{
	    	name:'',
	    	address:'',
	    	number:'',
	    	period:'',
	    	devMac:'--',
	    	devInfo:'--',
	    	livingSoftwareName:'旷视'
	    },
	    uploadType:1,//上传图片类型1,正面;2,反面;3,;4,手签名;
	    imgName:{//上传后返回的图片地址
	    	a:'',//正面
	    	b:'',//反面
	    	c:'--',//手持
	    	d:''//手签名
	    },
	    password1:'',
		password2:'',
	},
	hooks:{
		init:function(){
			vm=this;
			Jsborya.setHeader({
				title:'实名认证',
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
				Jsborya.getGuestInfo({
					slot:cardInfo.slot,
					complete:function(userInfo){
						vm.set('userInfo',userInfo);

						Jsborya.registerMethods('uploadImgComplete',function(data){//android 上传后回调
							vm.callMethod("uploadImgComplete",[data]);
					    });
						Jsborya.registerMethods('headerLeftClick',function(){
							vm.orderCancel(userInfo,orderInfo.sysOrderId);
						});
					}
				});
			}else{
				alert('本地订单信息丢失');
			}
		},
	    mounted:function(){
	    	setTimeout(function(){
	    		vm.callMethod('setPage');
	    	},300);
	    }
	},
	methods:{
		setPage:function(){
			let windowWidth=document.documentElement.clientWidth||window.innerWidth||document.body.clientWidth,
			photoHeight=(windowWidth/2-20)*0.602;

			document.getElementById("photo-front").style.height=photoHeight+"px";
			document.getElementById("photo-back").style.height=photoHeight+"px";

			vm.callMethod("initSignaturePad");
		},
		initSignaturePad:function(){//初始化签名面板
			var signatureDom=document.getElementById('signature'),//canvas dom对象
			window_h=document.documentElement.clientHeight||window.innerHeight||document.body.clientHeight,//视图高度
			ratio=Math.max(window.devicePixelRatio || 1, 1);//DPR
			signatureDom.height=(window_h-70-100)*ratio;

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
			//清空按钮
			document.getElementById('clear').addEventListener('click', function (event) {
			  signaturePad.clear();
			});

			signatureDom.width = signatureDom.offsetWidth * ratio;
			signatureDom.height = signatureDom.offsetHeight * ratio;
			signatureDom.getContext("2d").scale(ratio, ratio);
			signaturePad.clear();
			vm.set('off.signature',false);
		},
		takePhotos:function(type){//调用APP接口获取图片
			Jsborya.takePhotos({
				iccid:vm.get('cardInfo').iccid,
				type:type,
				sysOrderId:vm.get('orderInfo').sysOrderId,
				apiComplete:'uploadImgComplete',
				complete:function(data){
					if(type==3){//正面
						vm.set('uploadType',1);
						document.getElementById("photo-front").style.backgroundImage="url(data:image/jpeg;base64,"+data.thumbPic+")";
					}else if(type==4){//反面
						vm.set('uploadType',2);
						document.getElementById("photo-back").style.backgroundImage="url(data:image/jpeg;base64,"+data.thumbPic+")";	
					}
					
				}
			});
		},
		uploadImgComplete(data){
			var index=vm.get('uploadType');
			if(data.data&&data.data.imgName){
				if(index==1){
					vm.set('imgName.a',data.data.imgName);
					if(data.data.userName){
						vm.set("idCardInfo.name",data.data.userName);
						vm.set("idCardInfo.address",data.data.userAddress);
						vm.set("idCardInfo.number",data.data.iDcard);
					}else{
						document.getElementById("photo-front").style.backgroundImage="";
						vm.error('身份证识别失败');
					}
				}else if(index==2){
					vm.set('imgName.b',data.data.imgName);
					vm.set('idCardInfo.period',data.data.period);
				}else if(index==3){
					vm.set('imgName.c',data.data.imgName);
				}else if(index==4){
					vm.set('imgName.d',data.data.imgName);
				}
				
				vm.callMethod("checkIsJump");
			}else if(data.code){
				vm.error(data);
				//--清空缩略图
				if(index==1){
					document.getElementById("photo-front").style.backgroundImage="";
				}else if(index==2){
					document.getElementById("photo-back").style.backgroundImage="";
				}
			}else{
				let msg='异常错误';
				if(index==1){
					msg='身份证正面上传失败，请重试';
				}else if(index==2){
					msg='身份证正面上传失败，请重试';
				}else if(index==4){
					msg='上传手签名照片失败';
				}
				vm.error(msg);
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
			vm.AJAX('/ka_tas/w/business/imgUpload',json,function(data){
				vm.callMethod('uploadImgComplete',[data]);
			});
		},
		setServicePsd:function(){
			let password1=vm.get('password1'),
			    password2=vm.get('password2');

			if(!password1.match(/^\d{6}$/)){
				layer.open({
                    content:'密码格式错误',
                    skin: "msg",
                    time: 3
                });
                return false;
			}else if(password1!=password2){
				layer.open({
                    content:'两次输入密码不一致',
                    skin: "msg",
                    time: 3
                });
                return false;
			}else{
				vm.AJAX('/ka_tas/w/business/setPwd',{
					userInfo:vm.get('userInfo'),
					params:{
						sysOrderId:vm.get('orderInfo').sysOrderId,
						pwd:password2
					}
				},function(data){
					Jsborya.pageJump({
						url:'',
						stepCode:802,
						depiction:'',
						data:data.data
					});
				});
			}
		},
		checkIsJump:function(){//检测是否执行下一步操作
			const vm=this;

			let cardInfoCheck=Object.values(vm.get('idCardInfo')).filter((value)=>{
				return value=='';
			});
			let imgNameCheck=Object.values(vm.get('imgName')).filter((value)=>{
				return value=='';
			});
			let password1=vm.get('password1'),
			    password2=vm.get('password2'),
			    checkPwd=true;
			if(!password1.match(/^\d{6}$/))checkPwd=false;
			if(password1!==password2)checkPwd=false;
			
			if(!cardInfoCheck.length&&!imgNameCheck.length&&vm.get('off').agree&&checkPwd){
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
			let idCardInfo=vm.get('idCardInfo'),
				imgName=vm.get('imgName'),
				orderInfo=vm.get('orderInfo'),
				password1=vm.get('password1'),
			    password2=vm.get('password2');
			if(!imgName.a){
				callLayer('请上传身份证正面照片');
	            return false;
			}else if(!imgName.b){
				callLayer('请上传身份证反面照片');
                return false;
			}else if(idCardInfo.name==''){
				callLayer('请输入姓名');
                return false;
			}else if(idCardInfo.number==''){
				callLayer('请输入证件号码');
                return false;
			}else if(idCardInfo.address==''){
				callLayer('请输入证件地址');
                return false;
			}else if(idCardInfo.period==''){
				callLayer('请输入证件有效期');
                return false;
			}else if(null==idCardInfo.period.match(/^(\d{4})(.|\/)(\d{1,2})\2(\d{1,2})-(\d{4})(.|\/)(\d{1,2})\2(\d{1,2})$/)){
				callLayer('证件有效期格式错误');
                return false;
			}else if(!password1.match(/^\d{6}$/)){
				callLayer('密码格式错误');
                return false;
			}else if(password1!=password2){
				callLayer('两次输入密码不一致');
                return false;
			}else if(!imgName.d){
				callLayer('请添加手签名照片');
                return false;
			}else if(!vm.get('off').agree){
				callLayer('请先同意入网服务协议');
                return false;
			}else{
				const json={
					userInfo:vm.get('userInfo'),
					params:{
						userName:idCardInfo.name,//身份证姓名
						iDcard:idCardInfo.number,//身份证号码
						userAddress:idCardInfo.address,//身份证地址
						period:idCardInfo.period,//有效期
						devInfo:idCardInfo.devInfo,//设备信息
						devMac:idCardInfo.devMac,//设备MAC地址
						livingSoftwareName:idCardInfo.livingSoftwareName,
						imageName:imgName.a,//正面照片
						backImageName:imgName.b,//反面照片
						pwd:password2,//密码
						// 'handImageName':vm.get('imgName').c,//手持照片
						signImageName:imgName.d,//手签名
						sysOrderId:orderInfo.sysOrderId,
					}
				}
				Object.assign(orderInfo,{
					idCardName:idCardInfo.name,
					idCardNo:idCardInfo.number
				});
				
				vm.setStore('ORDER_INFO',orderInfo);

				vm.AJAX('/ka_tas/w/business/checkInfo',json,function(data){
					
					vm.setStore('USER_MUTIPLE_DATA',json.params);
					Jsborya.pageJump({
						url:'faceVerification.html',
						stepCode:999,
						depiction:'活体识别',
						destroyed:false,
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
				depiction:'远特客户入网服务协议',
				destroyed:false,
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