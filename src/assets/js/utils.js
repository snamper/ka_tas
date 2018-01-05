/***
  *@info 公共工具
  *@author: thinkmix
  *@date 2017-12-27
***/
var GlobalVar = function() {
    return this || (0, eval)("(this)")
}();
GlobalVar.Gshec = /^1(3|4|5|7|8)\d{9}$/, GlobalVar.Gchec = /^[0-9]*[1-9][0-9]*$/;

export default{
    init(Moon){
        Moon.prototype.getDateTime=function(e) {//时间戳=>日期格式
            var t;
            t = e ? new Date(parseInt(e)) : new Date;
            var n = t.getFullYear(),
                a = t.getMonth() + 1,
                r = t.getDate(),
                o = t.getHours(),
                i = t.getMinutes(),
                s = t.getSeconds(),
                c = [];
                a >= 10 || (a = "0" + a), r >= 10 || (r = "0" + r), o >= 10 || (o = "0" + o), i >= 10 || (i = "0" + i), s >= 10 || (s = "0" + s), c[0] = n, c[1] = a, c[2] = r, c[3] = n + "-" + a, c[4] = a + "-" + r, c[5] = o + ":" + i, c[6] = n + "-" + a + "-" + r + " " + o + ":" + i + ":" + s;
            return c;
        },
        Moon.prototype.getUrlParam=function(e) {//获取地址栏参数
            var t = new RegExp("(^|&)" + e + "=([^&]*)(&|$)"),
                n = window.location.search.substr(1).match(t);
            return null != n ? n[2] : null
        },
        Moon.prototype.phoneFormat=function(n){//添加号码格式
            if(!n)return '--';
            var w=n.split('');
            w.splice(3,0,' ');
            w.splice(8,0,' ');
            w=w.join('');
            return w;
        },
        Moon.prototype.mathCentToYuan=function(value){
            return (parseFloat(value)/100).toFixed(2);
        },
        Moon.prototype.orderCancel=function(userInfo,sysOrderId){
            var _self=this;
            layer.open({
                content:'您要放弃未完成的订单的后续操作么？',
                btn:['放弃','取消'],
                title:'提示',
                yes:function(){
                    var json={
                        'params':{
                            'sysOrderId':sysOrderId,
                        },
                        'userInfo':userInfo
                    };
                    _self.AJAX('../../w/business/orderCancell',json,function(data){
                        Jsborya.pageJump({
                            url:"index.html",
                            stepCode:'2001'
                        });
                    });
                    
                }
            });
        },
        /**
         * 存储localStorage
         */
        Moon.prototype.setStore = (name, content) => {
            if (!name) return;
            if (typeof content !== 'string') {
                content = JSON.stringify(content);
            }
            window.localStorage.setItem(name, content);
        },
        /**
         * 获取localStorage
         */
        Moon.prototype.getStore = name => {
            if (!name) return;
            let content=window.localStorage.getItem(name);
            return content?JSON.parse(content):'';
        },
        /**
         * 删除localStorage
         */
        Moon.prototype.removeStore = name => {
            if (!name) return;
            window.localStorage.removeItem(name);
        },
        Moon.prototype.AJAX=function(url,data,success,load,other){//http
            // data数据格式
            // {
            //     userInfo:{用户信息
            //         userId:'',
            //         applicationID:'',
            //         token:'',
            //         timestamp:'',
            //         packageName:'',
            //     },
            //     param:{//接口参数

            //     }
            // }
            var xhr=new XMLHttpRequest(),index,postData=data.params || {};
            !load&&(index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'}));

            const error=(data)=>{
                if(data.code=='681'){
                    layer.open({
                        content:'你当前还有未完成订单',
                        btn:['继续完成'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            let url='';
                            if(data.data.orderStatusCode==='PACKAGE_SELECTION'){
                                url='package.html';
                                //depiction='选择套餐';
                            }else if(data.data.orderStatusCode==='UPLOAD_DATA'){
                                url='certification.html';
                                //depiction='上传资料';
                            }else if(data.data.orderStatusCode==='CARD_PAY'){
                                url='faceVerification.html';
                                //depiction='活体识别';
                            }else if(data.data.orderStatusCode==='CARD_AUDIT'){
                                url='cardAudit.html';
                                //depiction='订单审核';
                            }else if(data.data.orderStatusCode==='CREATE_SHEET'){
                                url='createSheet.html';
                                //depiction='受理单';
                            }else if(data.data.orderStatusCode==='CARD_WRITING'){
                                url='cardWriting.html';
                               //depiction='写卡';
                            }else if(data.data.orderStatusCode==='CARD_ACTIVE'){
                                url='cardActive.html';
                                //depiction='开空卡';
                            }
                            vm.setStore('ORDER_INFO',{//订单信息
                                "sysOrderId":data.data.sysOrderId,
                                "createTime":data.data.createTime,
                                "phone": data.data.phoneNum,
                                "numberLevel":data.data.numberLevel,
                                "cityName":data.data.cityName,
                                "totalMoney":data.data.totalMoney,//总价格
                                "cardMoney":data.data.cardMoney,//号码占用费
                                "prestoreMoney":data.data.prestoreMoney,//预存价格
                                "similarity":data.data.similarity,
                                "limitSimilarity":data.data.limitSimilarity
                            });

                            Jsborya.pageJump({
                                url:url,
                                stepCode:999
                            });
                        }
                    });
                }else if(data.code=='685'){
                    layer.open({
                        content:'订单超时已关闭',
                        btn:['返回选号'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            Jsborya.pageJump({
                                url:"index.html",
                                stepCode:'2001'
                            });
                        }
                    });
                }else if(data.code=='689'){
                    layer.open({
                        content:'号卡ID未找到',
                        btn:['返回选号'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            Jsborya.pageJump({
                                url:"index.html",
                                stepCode:'2001'
                            });
                        }
                    });
                }else if(data.code=='690'){
                    layer.open({
                        content:'无效卡',
                        btn:['返回选号'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            Jsborya.pageJump({
                                url:"index.html",
                                stepCode:'2001'
                            });
                        }
                    });
                }else if(data.code=='691'){
                    layer.open({
                        content:'无效卡',
                        btn:['请使用华虹卡'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            Jsborya.pageJump({
                                url:"index.html",
                                stepCode:'2001'
                            });
                        }
                    });
                }else{
                    layer.open({
                        content:data.msg||data,
                        skin: "msg",
                        time: 3
                    });
                }
            };
            if(data.userInfo.hasOwnProperty('iccid'))postData.iccid=data.userInfo.iccid;
            if(data.userInfo.hasOwnProperty('userId'))postData.userId=data.userInfo.userId;
            postData.applicationID=data.userInfo.applicationID;
            postData.token=data.userInfo.token;
            postData.timestamp=data.userInfo.timestamp;
            postData.packageName=data.userInfo.packageName;
            postData=JSON.stringify(postData);

            xhr.open('POST',url,true);
            xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=utf-8');
            xhr.setRequestHeader('Accept','application/json,text/javascript;q=0.01');
            xhr.send(postData);

            xhr.onreadystatechange=()=>{
                if(xhr.readyState===4){
                    load ? typeof load==='function'&&load() : layer.close(index);
                    typeof other==='function'&&other();
                    if(xhr.status>=200&&(xhr.status<300 || xhr.status===304)){
                        try{
                            var responseText=JSON.parse(xhr.responseText);
                            responseText.code=='200' ? success(responseText) : error(responseText);
                        }catch(e){
                            console.log(e);
                            error('数据解析错误');
                        }
                        
                    }else{
                        if(xhr.status===504||xhr.status===500){
                            error('服务器异常');
                        }else if(xhr.status===200){
                            error('服务器响应错误');
                        }else if(xhr.status===404){
                            error('服务器地址错误');
                        }else if(xhr.status===0){
                            error('服务器失联');
                        }else{
                            error(xhr.statusText+xhr.status);
                        }
                    }
                }
            };
        }
    }
};
