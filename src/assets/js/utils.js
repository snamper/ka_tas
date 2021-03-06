/***
  *@info 公共工具
  *@author: thinkmix
  *@date 2017-12-27
***/

export default{
    init(Moon){
        /**
         *@describe 时间戳=>日期格式
         *@param {String/Number/null} (e) 时间戳
         *@return {Array} 0:年;1:月;2:日;3:年-月;4:月-日;5:时-分;6:年-月-日 时:分:秒;
         **/
        Moon.prototype.getDateTime=function(e) {
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
        /**
         *@describe 获取URL ?后的参数
         *@param {String} (e) 参数名
         *@return {String} 参数对应的值
         **/
        Moon.prototype.getUrlParam=function(e) {
            var t = new RegExp("(^|&)" + e + "=([^&]*)(&|$)"),
                n = window.location.search.substr(1).match(t);
            return null != n ? n[2] : null
        },
        /**
         *@describe 电话号码格式化
         *@param {String} (n) 电话号码
         *@return {String} 3-4-4的号码格式
         **/
        Moon.prototype.phoneFormat=function(n){
            if(!n)return '--';

            if(n.length==7)n = n.slice(0,7) + '****';
            if(n.length==8)n = n.slice(0,8) + '***';
            
            var w=n.split('');
            w.splice(3,0,' ');
            w.splice(8,0,' ');
            w=w.join('');
            return w;
        },
        /**
         *@describe 节流函数
         *@param {Number} (time) 节流时间
         *@param {Function} (action) 节流回调
         *@return {Function} 
         **/
        Moon.prototype.debounce = function(time,action){
          let last;
          return function(){
            let ctx=this, args=arguments;

            clearTimeout(window.LastDebounce);
            window.LastDebounce=setTimeout(function(){
                action.apply(ctx,args);
            },time);
          };
        },
        /**
         *@describe 分转元
         *@param {String/Number} (n) 分
         *@return {Number} 元
         **/
        Moon.prototype.mathCentToYuan=function(value){
            return value ? (parseFloat(value)/100).toFixed(2) : '0.00';
        },
        /**
         *@describe 计算折扣
         *@param {String/Number} (n) 分
         *@return {Number} 元
         **/
        Moon.prototype.mathDiscount=function(price,discount){
            return (parseFloat(price)/100*parseFloat(discount)/10000).toFixed(2);
        },
         /**
         *@describe 头部颜色
         **/
        Moon.prototype.getHeaderColor=function(deviceType){
            let color = '';
            switch (parseInt(deviceType)){
              case 0: case 1: case 2:
                color = '#4b3887';
                break;
              case 3:
                color = '#66B92A';
                break;
              default :
                color = '#4b3887';
                break;
            }
            return color;
        },
        /**
         *@describe 返回号码搜索
         **/
        Moon.prototype.jumpToHome=function(){
            Jsborya.pageJump({
              url:'',
              stepCode:'806',
              depiction:'首页',
            });
        },
        /**
         *@describe 跳到购卡指引
         **/
        Moon.prototype.toBuyHelpPage=function(){
            Jsborya.pageJump({
                url:'../discover/buyCardHelp.html',
                stepCode:'999',
                depiction:'购卡指南',
                destroyed:false,
                header:{
                    frontColor:'#ffffff',
                    backgroundColor:'#4b3887',
                }
            });
        },
        /**
         *@describe 放弃订单
         *@param {Object} (userInfo) 用户信息
         *@param {String} (sysOrderId) 订单号
         *@param {Boolean} (isJump) 是否跳转到号码搜索
         **/
        Moon.prototype.orderCancel=function(userInfo,orderInfo,isJump=true){
            var _self=this, cardInfo = _self.getStore('CARD_INFO');
            layer.open({
                content:'您要放弃未完成的订单的后续操作么？',
                btn:['放弃','取消'],
                title:'提示',
                yes:function(){
                    var json={
                        'params':{
                            'sysOrderId':orderInfo.sysOrderId,
                        },
                        'userInfo':userInfo
                    },url = '';
                    if(orderInfo.bizType == 7){//远盟开成卡
                      url = '/tas/w/ymactive/cancel';
                    }else url = '/tas/w/business/orderCancell';

                    _self.AJAX(url,json,function(data){
                        Jsborya.callMessageNotice({
                          iccid:userInfo.iccid
                        });

                        if(isJump){
                          if(cardInfo.isScan){//扫码进入
                            Jsborya.pageJump({
                                url:'../card/scanInfo.html',
                                stepCode:'999',
                                depiction:'卡信息',
                                header:{
                                    frontColor:'#ffffff',
                                    backgroundColor:'#4b3887',
                                }
                            });
                          }else{
                            if(orderInfo.deviceType == 1 && orderInfo.bizType == 6){
                              Jsborya.pageBack({
                                  url:'../card/index.html',
                                  isLoad:true
                              });
                            }else _self.jumpToHome();
                          }
                        }
                    });
                    
                }
            });
        },
        /**
         *@describe 本地存储
         *@param {String} (name) 存储标识
         *@param {Object} (content) 存储的内容
         **/
        Moon.prototype.setStore = (name, content) => {
            if (!name) return;
            if (typeof content !== 'string') {
                content = JSON.stringify(content);
            }
            window.localStorage.setItem(name, content);
        },
        /**
         *@describe 获取本地存储
         *@param {String} (name) 存储标识
         *@return {Object} 存储的内容
         **/
        Moon.prototype.getStore = name => {
            if (!name) return;
            let content=window.localStorage.getItem(name);
            return content?JSON.parse(content):'';
        },
        /**
         *@describe 删除本地存储
         *@param {String} (name) 存储标识
         **/
        Moon.prototype.removeStore = name => {
            if (!name) return;
            window.localStorage.removeItem(name);
        },
        /**
         *@describe 错误处理
         *@param {Object/String} (data) 
        ep:
            {
                code:'',
                msg:''
            }
            or'错误描述' 
         **/
        Moon.prototype.error=function(data){
            const _self=this;
            const layerOpen=(content)=>layer.open({
                content:content,
                btn:['确定'],
                shadeClose:false,
                title:'提示',
                yes:function(){
                    _self.jumpToHome();
                }
            });
            switch(parseInt(data.code)){
                case 681:
                    layer.open({
                        content:'你当前还有未完成订单',
                        btn:['查看详情'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            _self.setStore('ORDER_INFO',data.data);
                            Jsborya.pageJump({
                                url:'../card/slotInfo.html',
                                stepCode:'999',
                                depiction:'订单详情',
                                header:{
                                    frontColor:'#ffffff',
                                    backgroundColor:'#4b3887',
                                }
                            });
                        }
                    });
                    break;
                case 685:
                    layerOpen('订单超时已关闭');
                    break;
                case 689:
                    layerOpen('号卡ID未找到');
                    break;
                case 690:
                    layerOpen('无效卡');
                    break;
                case 691:
                    layerOpen('请使用华虹卡');
                    break;
                case 692:
                    layerOpen('号码已被占用，请重新更换号码');
                    break;
                case 726:
                    layer.open({
                        content:'无卡将无法进行下一步操作，如您需要购卡，请点击购卡指引',
                        btn:['购卡指引','关闭'],
                        shadeClose:false,
                        title:'提示',
                        yes:function(){
                            _self.toBuyHelpPage();
                        },
                        no:function(){
                            _self.jumpToHome();
                        }
                    });
                    
                    break;
                case 3000:
                    layerOpen('号码已不归属于您，现已将订单关闭，请尝试其他号码');
                    break;
                case 2000://版本强制更新
                    Jsborya.pageJump({
                      url:'',
                      stepCode:'808',
                      depiction:'',
                      data:data.data,
                    });
                    break;
                default:
                    layer.open({
                        content:data.msg||data,
                        skin: "msg",
                        time: 3
                    });
                    break;
            }
        },
        /**
         *@describe http请求
         *@param {String} (url) 请求地址
         *@param {Object} (data) 请求携带数据
         *@param {Function} (success) 请求成功回调函数(code=200)
         *@param {Function} (load) 加载完成执行
         *@param {Function} (fail) 加载失败执行(code非200,包括异常)
         **/
        Moon.prototype.AJAX=function(url,data,success,load,fail){
            // data数据格式
            // {
            //     userInfo:{用户信息
            //         userId:'',
            //         applicationID:'',
            //         token:'',
            //         timestamp:'',
            //         packageName:'',
            //     },
            //     params:{//接口参数

            //     }
            // }
            var xhr=new XMLHttpRequest(),index,postData=data.params || {},_self=this;
            !load&&(index=layer.open({type: 2,shadeClose:false,shade: 'background-color: rgba(255,255,255,0)'}));

            //alert('POST：'+JSON.stringify(data.params));
            Object.assign(postData,data.userInfo);
            postData=JSON.stringify(postData);

            xhr.open('POST',url,true);
            xhr.setRequestHeader('Content-Type','application/x-www-form-urlencoded;charset=utf-8');
            xhr.setRequestHeader('Accept','application/json,text/javascript;q=0.01');
            xhr.send(postData);

            xhr.onreadystatechange=()=>{
                if(xhr.readyState===4){
                    load ? typeof load==='function'&&load() : layer.close(index);
                    if(xhr.status>=200&&(xhr.status<300 || xhr.status===304)){
                        try{
                          var responseText=JSON.parse(xhr.responseText);
                          //alert('RECV：'+JSON.stringify(responseText));
                          if(responseText.code=='200'){
                              success(responseText)
                          }else{
                              if(typeof fail==='function'){
                                  fail(responseText);
                              }else _self.error(responseText);
                          }
                        }catch(e){
                          typeof fail==='function'&&fail();
                          alert(e);
                          _self.error('数据解析错误');
                        }
                        
                    }else{
                        typeof fail==='function'&&fail();
                        if(xhr.status===504||xhr.status===500){
                            _self.error('服务器异常');
                        }else if(xhr.status===200){
                            _self.error('服务器响应错误');
                        }else if(xhr.status===404){
                            _self.error('服务器地址错误');
                        }else if(xhr.status===0){
                            _self.error('服务器失联');
                        }else{
                            _self.error(xhr.statusText+xhr.status);
                        }
                    }
                }
            };
        }
    }
};
