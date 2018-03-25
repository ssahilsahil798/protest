$(function () {
    

    $('#notifications').popover({html: true, content: 'Loading...', trigger: 'manual'});

    $("#notifications").click(function () {
        if ($(".popover").is(":visible")) {
            $("#notifications").popover('hide');
        }
        else {
            $("#notifications").popover('show');
            $.ajax({
                url: '/notifications/last/',
                beforeSend: function () {
                    $(".popover-content").html("<div style='text-align:center'><img src='/static/img/loading.gif'></div>");
                    $("#notifications").removeClass("new-notifications");
                },
                success: function (data) {
                    $(".popover-content").html(data);
                }
            });
        }
        return false;
    });

    // Correctly decide between ws:// and wss://
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var ws_path = ws_scheme + '://' + window.location.host + "/notifications/";
    var webSocket = new channels.WebSocketBridge();
    webSocket.connect(ws_path);

    // Helpful debugging
    webSocket.socket.onopen = function () {
        console.log("Connected to notifications stream");
    };

    webSocket.socket.onclose = function () {
        console.log("Disconnected from notifications stream");
    };

    webSocket.listen(function(event) {

        if (event.activity_type === "notification") {
            $("#notifications").addClass("new-notifications");
            console.log("new notification");
        } else if (event.activity_type === "message") {
            if (currentUser == event.receiver) {
                $("#unread-count").show();

                    var itemuser = event.sender;
                    var newInElem = 
                    '<div class="msg_box '+ itemuser + '" style="right:80%"><div class="msg_head"><div class="close" id="itemclose">x</div><p>'+itemuser+'</p></div><div class="msg_wrap ' +itemuser+'"><div class="msg_body ' + itemuser+ '"><div class="msg_a"></div><div class="msg_push"></div></div><div class="msg_footer"><textarea class="msg_input" rows="4"></textarea></div></div></div>';
                       
                    appendInFunc(itemuser, newInElem);

                    

                
                
            }
        }else if(event.activity_type === "frndrequest"){
            if(currentUser === event.to_user){
                $('#friendrequests').addClass('new-frndrequest');
            }
            
        }
    });



          function closeInEvent(itemuser){


          $('.close').click(function(e){
            e.preventDefault();
          $(this).parent().parent().hide();
            });
    
          $('.msg_head').click(function(e){
            e.preventDefault();
             $(this).next('.' + itemuser).slideToggle('slow');
            });

           
  
        }


    function appendInFunc(itemuser, newInElem){
                var exist = false;
                  $('.msg_head').find('p').each(function(){
                    if(itemuser == $(this).text().toString().trim()){
                        exist = true;

                        // $(".msg_head").next('.' + itemuser).slideToggle("slow");
                            callInConversation(itemuser);
                    }

                });
                if(exist === false){
                    $(".msg_area").append(newInElem);
                    callInConversation(itemuser);
                    closeInEvent(itemuser);
                    
                }

                
             }


             function callInConversation(itemuser){

                  $.ajax({
                url: '/messages/' + itemuser +  '/msgpopup',
                data: {'username': itemuser},
                cache: false,
                success: function (data) {
                    

                            var exist = false;
                            //Below code is the problem in receiving messages
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
     


});
