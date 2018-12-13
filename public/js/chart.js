;(function($, window, document, undefined){
    $(document).ready(function(){
    	var socket = io();
        var html='';
        var fromid = $('.myid').val();
        var toid = $('.id').val();
        var imgurl = $('.imgurl').val();
        var myimgurl = $('.myimgurl').val();
        var from = fromid+toid;
        var to = toid+fromid;
        var name = $('.name').html();

        var time =0;
        var room = {};
        var j =1;
        room[0]=0;

        //定位到区域最下方
        function scrollToBottom(){
            var $msgout = $('.msgout');
            var $message = $('#message');
            var toHeight = $message.outerHeight()-$msgout.height()+30;
            $msgout.scrollTop(toHeight);
        }

        //时间转换
        function changeTime(date){
            var d = new Date(date);
            var h = d.getHours();
            var m = d.getMinutes();
            var s = d.getSeconds();

            if(h<10){
                h = '0'+h;
            }
            if(m<10){
                m = '0'+m;
            }
            if(s<10){
                s = '0'+s;
            }
            var tiems = h+':'+m;    
            return tiems;
        }

        //获取数据库信息
        function showMessage(){
            $.ajax({
                url: '/showMessage',
                type: 'POST',
                data: {fromid:fromid,toid:toid},
                success: function(data){
                    if(data.success){
                        var aa = data.context.vacation;
                        
                        var tt = aa.map(function(i){
                            time = i.timeInt;
                            room[j] =time;
                            if(time>(room[j-1]+4*60*1000)){
                                html+="<p class='time'>"+i.dateTime+"</p>";
                            }
                            j++;

                            if(i.toUserID==toid){
                                html+='<div class="my message"><p><img src="/vacation-photo/'+ 
                                myimgurl+'"/>'+i.message+'</p></div>';
                            }else{
                                html+='<div class="to message"><p><img src="/vacation-photo/'+ 
                                imgurl+'"/>'+name+':'+i.message+'</p></div>';
                            }                           

                    })
                    $('#message').append(html);
                    scrollToBottom();
                    }
                    else{
                        console.log('出现问题1');
                    }
                },
                error: function(){
                    console.log('出现问题2');
                }
            });
        }
        showMessage();

        //通知加入房间
        socket.emit('chart',from);
        //点击发送
    	$('.but').on('click',function(evt){
            evt.preventDefault();
            sendmsg();
        });
        //点击enter发送信息
        $(document).keyup(function(event){
          if(event.keyCode ==13){
            sendmsg();
          }
        });
        //发送信息
        function sendmsg(){
            var message = $('.text').val();
            if(message){
                var mesg = {
                    name:name,
                    to:to,
                    message: message,
                    fromid: fromid,
                    toid: toid
                }
                socket.emit('message',mesg);

                //获取时间点
                var nowTime= new Date();
                var changetime = changeTime(nowTime);
                room[j] =nowTime;
                if(nowTime>(room[j-1]+4*60*1000)){
                    html+="<p class='time'>"+changetime+"</p>";
                }
                j++;

                html+='<div class="my message"><p><img src="/vacation-photo/'+ 
                myimgurl+'"/>'+message+'</p></div>';
                $('#message').append(html); 
                html='';
                $('.text').val("");
                scrollToBottom();
            }

        }

        //接收信息
        socket.on('sendMsg',function(msg){

            //获取时间点
            var nowTime= new Date();
            var changetime = changeTime(nowTime);
            room[j] =nowTime;
            if(nowTime>(room[j-1]+4*60*1000)){
                html+="<p class='time'>"+changetime+"</p>";
            }
            j++;

            html+='<div class="to message"><p><img src="/vacation-photo/'+ 
            imgurl+'"/>'+name+':'+msg+'</p></div>';
            $('#message').append(html);
            html='';
            scrollToBottom();
        });
    })
})(jQuery,window,document);



