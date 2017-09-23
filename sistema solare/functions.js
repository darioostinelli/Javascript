$().ready(function(){$("#btnTop").click(function() {
     $("html, body").animate({ scrollTop: 0 }, "fast");
    })
});

function showPreview(id){
    var index = $('.contentPreview').index( $('#'+id));
    $('.contentPreview').hide();
    $('.menuItem').css('background','');
    $('#'+id).show();
    $($('.menuItem')[index]).css('background','#33aaff');
}