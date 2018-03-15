$(function(){       
              $.ajax({
                url: '/liveuser',
                beforeSend: function () {
                   
                },
                success: function (data) {
                    $('#chat_pop').append(data);
                    console.log(data);
                    checkFunc();

                }
            });

        function checkFunc(){
            $('.itemuser').click(function(){
            var itemuser = $(this).text().trim();
            var newElem = 
            '<div class="msg_box '+ itemuser + '" style="right:80%"><div class="msg_head"><div class="close" id="itemclose">x</div><p>'+$(this).text()+'</p></div><div class="msg_wrap ' +itemuser+'"><div class="msg_body ' + itemuser+ '"><div class="msg_a"></div><div class="msg_push"></div></div><div class="msg_footer"><textarea class="msg_input" rows="4"></textarea></div></div></div>';
               
               appendFunc(itemuser, newElem);
              

                
                
            });
        }


             function appendFunc(itemuser, newElem){
                var exist = false;

                  $('.msg_head').find('p').each(function(){
                    if(itemuser == $(this).text().toString().trim()){
                        exist = true;
                        // $(".msg_head").next('.' + itemuser).slideToggle("slow");
                    }

                });
                if(exist === false){
                    $(".msg_area").append(newElem);
                    callConversation(itemuser, newElem);
                }

                closeEvent(itemuser);
             }

         function callConversation(itemuser, newElem){

                  $.ajax({
                url: '/messages/' + itemuser +  '/msgpopup',
                data: {'username': itemuser},
                cache: false,
                success: function (data) {
                    

                            var exist = false;

                            $('.msg_head').find('p').each(function(){
                                if(itemuser == $(this).text().toString().trim()){
                                    exist = true;
                                    // $('.msg_wrap').next('.' + itemuser).html(data);
                                    $('.msg_head').next('.' + itemuser).html(data);
                                    waitMsg(itemuser);
                                    scrollConversationScreen();
                                }

                                });    
                          


                   
                    
                    }
                 });

                  
             }

       

          function closeEvent(itemuser){


          $('.close').click(function(e){
            e.preventDefault();
          $(this).parent().parent().hide();
            });
    
          $('.msg_head').click(function(e){
            e.preventDefault();
             $(this).next('.' + itemuser).slideToggle('slow');
            });

           
  
        }

        function waitMsg(itemuser){

                 $("#" + itemuser).submit(function () {
                    
        /*
        WebSocket data structure idle by now waiting for way to print the new
        message to the client side.

        payload = {
                'sender': currentUser,
                'receiver': activeUser,
                'message': $("input[name='message']").val()
            }
        webSocket.send(payload); */
            $.ajax({
                url: '/messages/send/',
                data: $("#" + itemuser).serialize(),
                cache: false,
                type: 'post',
                success: function (data) {
                    $('.msg_head').next('.' + itemuser).find(".converse").append(data);
                    scrollConversationScreen();
                        }
                    });
                    return false;
                });
                      
                   
  
            }
     

       
        


            var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
            var ws_path = ws_scheme + '://' + window.location.host + "/liveuser/";
            var webSocket = new channels.WebSocketBridge();
            webSocket.connect(ws_path);

            // Helpful debugging
            webSocket.socket.onopen = function () {
                console.log("Connected to LIVE stream");
            };

            webSocket.socket.onclose = function () {
                console.log("Disconnected from LIVE stream");
            };

            webSocket.listen(function(event) {

              // $(".msg_box").html(JSON.parse(event.data));
                      var data = event;
                      
                    
                      if(event.activity_type === "liveuser_noti"){
                      var is_present = false;
                      $(".itemuser").each(function(){
                            if(event.username === $(this).text().toString().trim()){
                                if(event.is_logged_in === true){


                                }else if (event.is_logged_in === false){
                                    $(this).remove();
                                    is_present = true;
                                }
                            }else{


                            }
                      });
                        if(is_present===false){
                            if(event.username !== currentUser){
                                if(event.is_logged_in === true){
                                    $("#chat_pop").append('<div class="itemuser" id="data_append">' + event.username + '</div>');    
                                }
                                
                            }
                            
                        }
                      }
                   

            });


             function scrollConversationScreen() {
                /* Set focus on the input box from the form, and rolls to show the
                the most recent message.
                */
                $("input[name='message']").focus();
                $('.msg_wrap').each(function(){
                    $(this).scrollTop($(this)[0].scrollHeight);
                    $('this').scrollTop($(this)[0].scrollHeight);

                });
                
            }

});     



    