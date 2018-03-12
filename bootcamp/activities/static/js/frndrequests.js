$(function () {
    
    $('#friendrequests').popover({html: true, content: 'Loading...', trigger: 'manual'});

    $("#friendrequests").click(function () {
        if ($(".popover").is(":visible")) {
            $("#friendrequests").popover('hide');
        }
        else {
            $("#friendrequests").popover('show');
            $.ajax({
                url: '/friendrequests/last/',
                beforeSend: function () {
                    $(".popover-content").html("<div style='text-align:center'><img src='/static/img/loading.gif'></div>");
                    $("#friendrequests").removeClass("new-notifications");
                },
                success: function (data) {
                    $(".popover-content").html(data);
                }
            });
        }
        return false;
    });

    // Correctly decide between ws:// and wss://
    
});
