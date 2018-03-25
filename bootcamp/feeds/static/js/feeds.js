$(function () {

    var fileItemList = [];
    var page_title = $(document).attr("title");
    check_pics();
    video_resize();
    // WebSocket connection management block.
    // Correctly decide between ws:// and wss://
    var ws_scheme = window.location.protocol == "https:" ? "wss" : "ws";
    var ws_path = ws_scheme + '://' + window.location.host + "/feeds/";
    var webSocket = new channels.WebSocketBridge();
    webSocket.connect(ws_path);

    // Helpful debugging
    webSocket.socket.onopen = function () {
        console.log("Connected to feeds stsdfsdfream");
    };

    webSocket.socket.onclose = function () {
        console.log("Disconnected from feeds strsdfsfsdeam");
    };

    webSocket.listen(function(event) {
        console.log(event);
        if (event.activity === "new_feed") {
          
                check_new_feeds();
            
        } else if (event.activity === "liked") {
            console.log(event.username + " just " + event.activity);
            update_feeds();
        } else if (event.activity === "commented") {
            console.log(event.username + " just " + event.activity);
            track_comments();
            update_feeds();
        }
    });

    function hide_stream_update() {
        $(".stream-update").hide();
        $(".stream-update .new-posts").text("");
        $(document).attr("title", page_title);
    }

    $("body").keydown(function (evt) {
        var keyCode = evt.which?evt.which:evt.keyCode;
        if (evt.ctrlKey && keyCode == 80) {
            $(".btn-compose").click();
            return false;
        }
    });

    $("#compose-form textarea[name='post']").keydown(function (evt) {
        var keyCode = evt.which?evt.which:evt.keyCode;
        if (evt.ctrlKey && (keyCode == 10 || keyCode == 13)) {
            $(".btn-post").click();
        }
    });

    (function () {
        //if ($(".compose").hasClass("composing")) {
        //    $(".compose").removeClass("composing");
        //    $(".compose").slideUp(); 
        //}
        //else {
            $(".compose").addClass("composing");
            $(".compose textarea").val("");
            $(".compose").slideDown(400, function () {
                $(".compose textarea").focus();
            });
        //}
    });

    $(".btn-cancel-compose").click(function () {
        //$(".compose").slideUp();
    });

    $(".btn-post").click(function () {

        var last_feed = $(".stream li:first-child").attr("feed-id");
        if (last_feed == undefined) {
            last_feed = "0";
        }
        
        $("#compose-form input[name='last_feed']").val(last_feed);

        $.ajax({
            url: '/feeds/post/',
            data: $("#compose-form").serialize(),
            type: 'post',
            cache: false,
            success: function (data) {

                $("ul.stream").prepend(data.html);
                //$(".compose").slideUp();
                $(".compose").removeClass("composing");
                hide_stream_update();
                startUploadProcess(data.post_id);

            }
        });
    });

    function startUploadProcess(post_id){
    
    var selectedFiles = $(".upload_post").prop('files');
    formItem = $(".upload_post").parent();
    var count = selectedFiles.length;
    $.each(selectedFiles, function(index, item){

        var myFile = verifyFileIsImageMovieAudio(item)
        if (myFile){
            uploadFile(myFile, post_id);
        
        } else {
            
            // alert("Some files are invalid uploads.")
        }
       
    })
    console.log(count);
    if(count == 0){
        var li = $("ul.stream").find("li");
            var csrf = $(li).attr("csrf");
          $.ajax({
            url: '/feeds/post/blank/',
            data: {
                'csrfmiddlewaretoken': csrf,
            },
            type: 'get',
            cache: false,
            success: function (data) {

                

            }
        });
    }
    $(".upload_post").val('');


}

    $("ul.stream").on("click", ".like", function () {
        var li = $(this).closest("li");
        var feed = $(li).attr("feed-id");
        var csrf = $(li).attr("csrf");
        $.ajax({
            url: '/feeds/like/',
            data: {
                'feed': feed,
                'csrfmiddlewaretoken': csrf
            },
            type: 'post',
            cache: false,
            success: function (data) {
                if ($(".like", li).hasClass("unlike")) {
                    $(".like", li).removeClass("unlike");
                    $(".like .text", li).text("Like");
                }
                else {
                    $(".like", li).addClass("unlike");
                    $(".like .text", li).text("Unlike");
                }
                $(".like .like-count", li).text(data);
            }
        });
        return false;
    });

    $("ul.stream").on("click", ".comment", function () {

        var post = $(this).parent().parent().parent();
        if ($(".comments", post).hasClass("tracking")) {
            $(".comments", post).slideUp();
            $(".comments", post).removeClass("tracking");
        }
        else {

            $(".comments", post).show();
            $(".comments", post).addClass("tracking");
            $(".comments input[name='post']", post).focus();
            var feed = $(post).attr("feed-id");
            $.ajax({
                url: '/feeds/comment/',
                data: { 'feed': feed },
                cache: false,
                beforeSend: function () {
                    $("ol", post).html("<li class='loadcomment'><img src='/static/img/loading.gif'></li>");
                },
                success: function (data) {
                    $("ol", post).html(data);
                    $(".comment-count", post).text($("ol li", post).not(".empty").length);
                }
            });
        }
        return false;
    });

    $("ul.stream").on("keydown", ".comments input[name='post']", function (evt) {
        var keyCode = evt.which?evt.which:evt.keyCode;
        if (keyCode == 13) {
            var form = $(this).closest("form");
            var container = $(this).closest(".comments");
            var input = $(this);
            $.ajax({
                url: '/feeds/comment/',
                data: $(form).serialize(),
                type: 'post',
                cache: false,
                beforeSend: function () {
                    $(input).val("");
                },
                success: function (data) {
                    $("ol", container).html(data);
                    var post_container = $(container).closest(".post");
                    $(".comment-count", post_container).text($("ol li", container).length);
                }
            });
            return false;
        }
    });

    var load_feeds = function () {
        if (!$("#load_feed").hasClass("no-more-feeds")) {
            var page = $("#load_feed input[name='page']").val();
            var next_page = parseInt($("#load_feed input[name='page']").val()) + 1;
            $("#load_feed input[name='page']").val(next_page);
            $.ajax({
                url: '/feeds/load/',
                data: $("#load_feed").serialize(),
                cache: false,
                beforeSend: function () {
                    $(".load").show();
                  
                },
                success: function (data) {
                    if (data.length > 0) {
                        $("ul.stream").append(data)
                    }
                    else {
                        $("#load_feed").addClass("no-more-feeds");
                    }
                    check_pics();
                    video_resize();
                },
                complete: function () {
                    $(".load").hide();
                }
            });
        }

    };

    $("#load_feed").bind("enterviewport", load_feeds).bullseye();

    $(".stream-update a").click(function () {
        var last_feed = $(".stream").children('li').attr("feed-id");
        console.log(last_feed);
        var feed_source = $("#feed_source").val();
        var li = $("ul.stream").find("li");
        var csrf = $(li).attr("csrf");
        $.ajax({
            url: '/feeds/load_new/',
            data: {
                'last_feed': last_feed,
                'feed_source': feed_source
            },
            cache: false,
            success: function (data) {
                $("ul.stream").prepend(data);

            },
            complete: function () {
                hide_stream_update();
                check_pics();
                video_resize();
            }
        });
        return false;
    });

    $("input,textarea").attr("autocomplete", "off");

    $("ul.stream").on("click", ".remove-feed", function () {
        var li = $(this).closest("li");
        var feed = $(li).attr("feed-id");
        var csrf = $(li).attr("csrf");
        $.ajax({
            url: '/feeds/remove/',
            data: {
                'feed': feed,
                'csrfmiddlewaretoken': csrf
            },
            type: 'post',
            cache: false,
            success: function (data) {
                $(li).fadeOut(400, function () {
                    $(li).remove();
                });
            }
        });
    });

    $("#compose-form textarea[name='post']").keyup(function () {
        $(this).count(255);
    });

    function update_feeds () {
        var first_feed = $(".stream li:first-child").attr("feed-id");
        var last_feed = $(".stream li:last-child").attr("feed-id");
        var feed_source = $("#feed_source").val();

        if (first_feed != undefined && last_feed != undefined) {
            $.ajax({
                url: '/feeds/update/',
                data: {
                    'first_feed': first_feed,
                    'last_feed': last_feed,
                    'feed_source': feed_source
                },
                cache: false,
                success: function (data) {
                    $.each(data, function(id, feed) {
                            var li = $("li[feed-id='" + id + "']");
                            $(".like-count", li).text(feed.likes);
                            $(".comment-count", li).text(feed.comments);
                    });
                },
            });
        }
    };

    function track_comments () {
        $(".tracking").each(function () {
            var container = $(this);
            var feed = $(this).closest("li").attr("feed-id");
            $.ajax({
                url: '/feeds/track_comments/',
                data: {'feed': feed},
                cache: false,
                success: function (data) {
                    if (data != 0) {
                        $("ol", container).html(data);
                        var post_container = $(container).closest(".post");
                        $(".comment-count", post_container).text($("ol li", container).length);
                    }
                }
            });
        });
    };

    function check_new_feeds () {
        var last_feed = $(".stream").children('li').attr("feed-id");
        var feed_source = $("#feed_source").val();
        var li = $("ul.stream").find("li");
        var country_tag = $('#country_tag_id').val();
        var csrf = $(li).attr("csrf");
        if (last_feed != undefined) {
            $.ajax({
                url: '/feeds/check/',
                data: {
                    'last_feed': last_feed,
                    'feed_source': feed_source,
                    'csrfmiddlewaretoken': csrf,
                    'country_tag': country_tag,
                },
                cache: false,
                success: function (data) {
                    if (parseInt(data) > 0) {
                        $(".stream-update .new-posts").text(data);
                        $(".stream-update").show();
                        $(document).attr("title", "(" + data + ") " + page_title);
                        check_pics();
                        video_resize();
                    }
                },
            });
        }
    };




    // setup session cookie data. This is Django-related
    function getCookie(name) {
        var cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var cookie = jQuery.trim(cookies[i]);
                // Does this cookie string begin with the name we want?
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    var csrftoken = getCookie('csrftoken');
    function csrfSafeMethod(method) {
        // these HTTP methods do not require CSRF protection
        return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
    }
    $.ajaxSetup({
        beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
    // end session cookie data setup. 



// declare an empty array for potential uploaded files


// auto-upload on file input change.



function verifyFileIsImageMovieAudio(file){
    // verifies the file extension is one we support.
    var extension = file.name.split('.').pop().toLowerCase(); //file.substr( (file.lastIndexOf('.') +1) );
    switch(extension) {
        case 'jpg':
        case 'png':
        case 'gif':
        case 'jpeg':
            return file  
        case 'mov':
        case 'mkv':
        case 'mp4':
        case 'mpeg4':
        case 'avi':
            return file
        case 'mp3':
            return file
        default:
            notAllowedFiles.push(file)
            return null
    }
};

function constructFormPolicyData(policyData, fileItem) {
   var contentType = fileItem.type != '' ? fileItem.type : 'application/octet-stream'
    var url = policyData.url
    var filename = policyData.filename
    var repsonseUser = policyData.user
    // var keyPath = 'www/' + repsonseUser + '/' + filename
    var keyPath = policyData.file_bucket_path
    var fd = new FormData()
    fd.append('key', keyPath + filename);
    fd.append('acl','private');
    fd.append('Content-Type', contentType);
    fd.append("AWSAccessKeyId", policyData.key)
    fd.append('Policy', policyData.policy);
    fd.append('filename', filename);
    fd.append('Signature', policyData.signature);
    fd.append('file', fileItem);
    return fd
}

function fileUploadComplete(fileItem, policyData){
 var li = $("ul.stream").find("li");
        var csrf = $(li).attr("csrf");
    data = {
        uploaded: true,
        fileSize: fileItem.size,
        file: policyData.file_id,
        csrfmiddlewaretoken: csrf,
    }
    $.ajax({
        method:"POST",
        data: data,
        url: "/api/files/complete/",
        success: function(data){
            fileItemList = [];
            displayItems(fileItemList);
            check_new_feeds();

        },
        error: function(jqXHR, textStatus, errorThrown){ 
            // alert("An error occured, please refresh the page.")
        }
    })
}

function displayItems(fileItemList){
    var itemList = $('.item-loading-queue')
    itemList.html("")
    $.each(fileItemList, function(index, obj){
        var item = obj.file
        var id_ = obj.id
        var order_ = obj.order
        var html_ = "<div class=\"progress\">" + 
          "<div class=\"progress-bar\" role=\"progressbar\" style='width:" + item.progress + "%' aria-valuenow='" + item.progress + "' aria-valuemin=\"0\" aria-valuemax=\"100\"></div></div>"
        itemList.append("<div>" + order_ + ") " + item.name + "<a href='#' class='srvup-item-upload float-right' data-id='" + id_ + ")'>X</a> <br/>" + html_ + "</div><hr/>")

    })
}

    

function uploadFile(fileItem, post_id){
        var policyData;
        var newLoadingItem;

        // get AWS upload policy for each file uploaded through the POST method
        // Remember we're creating an instance in the backend so using POST is
        // needed.
        var li = $("ul.stream").find("li");
        var csrf = $(li).attr("csrf");
        $.ajax({
            method:"POST",
            data: {
                filename: fileItem.name,
                post_id: post_id,
                csrfmiddlewaretoken: csrf,
            },
            url: "/api/files/policy/",
            success: function(data){
                    policyData = data

            },
            error: function(data){
            }
        }).done(function(){
            // construct the needed data using the policy for AWS
            var fd = constructFormPolicyData(policyData, fileItem)

            // use XML http Request to Send to AWS. 
            var xhr = new XMLHttpRequest()

            // construct callback for when uploading starts
            xhr.upload.onloadstart = function(event){
                var inLoadingIndex = $.inArray(fileItem, fileItemList)
                if (inLoadingIndex == -1){
                    // Item is not loading, add to inProgress queue
                    newLoadingItem = {
                        file: fileItem,
                        id: policyData.file_id,
                        order: fileItemList.length + 1
                    }
                    fileItemList.push(newLoadingItem)
                  }
                fileItem.xhr = xhr
            }

            // Monitor upload progress and attach to fileItem.
            xhr.upload.addEventListener("progress", function(event){
                if (event.lengthComputable) {
                 var progress = Math.round(event.loaded / event.total * 100);
                    fileItem.progress = progress
                    displayItems(fileItemList)
                }
            })

            xhr.upload.addEventListener("load", function(event){
                console.log("Complete")
                // handle FileItem Upload being complete.
                fileUploadComplete(fileItem, policyData)

            })

            xhr.open('POST', policyData.url , true);
            xhr.send(fd);
        })
    }

    function constructGetPolicyData(policyData, contType) {

    var contentType = contType
    var url = policyData.url
    var filename = policyData.filename
    var repsonseUser = policyData.user

    // var keyPath = 'www/' + repsonseUser + '/' + filename
    var keyPath = policyData.file_bucket_path
    var fd = new FormData()
    fd.append('key', keyPath + filename);
    fd.append('acl','private');
    fd.append('Content-Type', contentType);
    fd.append("AWSAccessKeyId", policyData.key)
    fd.append('Policy', policyData.policy);
    fd.append('filename', filename);
    fd.append('Signature', policyData.signature);
    return fd
}







  function check_pics(){

    var count = 0;
  $('.fs-gal').click(function() {
    count = 0;
    $(this).parent().children().each(function(){
        console.log($(this).html);
        console.log("sahil");
        count = count +1;
    })
    fsGal_DisplayImage($(this), count);
  });
  //Display gallery
  function fsGal_DisplayImage(obj, count) {
    //Clear navigation buttons
    $('.fs-gal-view > .fs-gal-prev').fadeOut();
    $('.fs-gal-view > .fs-gal-next').fadeOut();
    //Set current image
    var title = obj.attr('alt');
    if (!title || title == '') { title = obj.attr('title'); }
    $('.fs-gal-view > h1').text(title);
    if (!title || title == '') { $('.fs-gal-view > h1').fadeOut(); }
    else { $('.fs-gal-view > h1').fadeIn(); }
    var img = obj.data('url');
    $('.fs-gal-view').css('background-image', 'url('+img+')');
    //Create buttons
    var image = $(this);
    var current = $(this).parent().children().index(image);
    var prev = current - 1;
    console.log(prev);
    var next = current + 1;
    console.log("next" + next + "length" + count);
    if (prev >= 0) {
      $(this).parent('.fs-gal-view').data('img-index', prev);
      $(this).parent('.fs-gal-view').fadeIn();
    }
    if (next < count) {
      $(this).parent('.fs-gal-view').data('img-index', next);
      $(this).parent('.fs-gal-view').fadeIn();
    }
    $('.fs-gal-view').fadeIn(); //Display gallery
  }
  //Gallery navigation
  $('.fs-gal-view .fs-gal-nav').click(function() {
    var index = $(this).data('img-index');
    var img = $($('.fs-gal').get(index));
    fsGal_DisplayImage(img);
  });
  //Close gallery
  $('.fs-gal-view .fs-gal-close').click(function() {
    $('.fs-gal-view').fadeOut();

  });
  //Keyboard navigation
  $('body').keydown(function(e) {
    if (e.keyCode == 37) {
      $('.fs-gal-view .fs-gal-prev'); //Left arrow
    }
    else if(e.keyCode == 39) { // right
      $('.fs-gal-view .fs-gal-next'); //Right arrow
    }
    else if(e.keyCode == 27) { // right
      $('.fs-gal-view .fs-gal-close').click(); //ESC
    }
  });
}

function video_resize(){
      if(typeof YOUTUBE_VIDEO_MARGIN == 10) {
    YOUTUBE_VIDEO_MARGIN=5;
  }
  $('iframe').each(function(index,item) {
    $('.video').autoplay=false;
    $('.video').load();
    if($(item).attr('src').match(/(https?:)?\/\/www\.youtube\.com/)) {
      var w=$(item).attr('width');
      var h=$(item).attr('height');
      var ar = h/w*100;
      $('.video').stopVideo();
      ar=ar.toFixed(2);
      //Style iframe    
      $(item).css('position','absolute');
      $(item).css('top','0');
      $(item).css('left','0');    
      $(item).css('width','100%');
      $(item).css('height','100%');
      $(item).css('max-width',w+'px');
      $(item).css('max-height', h+'px');        
      $(item).wrap('<div style="max-width:'+w+'px;margin:0 auto; padding:'+YOUTUBE_VIDEO_MARGIN+'px;" />');
      $(item).wrap('<div style="position: relative;padding-bottom: '+ar+'%; height: 0; overflow: hidden;" />');
    }else{
        $('.video').stopVideo();
    }
  });
}


});

