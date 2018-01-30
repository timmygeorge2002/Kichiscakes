 $(function () {

    menu=0;

    //Burger Menu Activation
    $(window).resize(function(){
      if($(window).width() > 768){
        $('#menu ul').css({'display':'block'});
        menu=1;
      }
      else {
        $('#menu ul').css({'display':'none'});
        menu=0;
      }
    });

    $('.slick-slider').slick({
        dots: true,
        mobileFirst: true,
        infinite: true,
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 1,
        centerMode: false,
        variableWidth: true,
        focusOnSelect: true,
        adaptiveHeight: true,
          responsive: [{

              breakpoint: 1024,
              settings: {
                mobileFirst: true,
                infinite: true,
                speed: 300,
                slidesToShow: 1,
                centerMode: false,
                variableWidth: true,
                focusOnSelect: true
              }

            }, {

              breakpoint: 600,
              settings: {
                slidesToShow: 1
              }

            }, {

              breakpoint: 300,
              settings: {
                slidesToShow: 1
              }
        }]

    });

  $('#cream-cake-view').attr("href","gallery.html#filter/" +"{\"tags\":[\"cream_cake\"]}");
  $('#fruit-cake-view').attr("href","gallery.html#filter/" +"{\"tags\":[\"fruit_cake\"]}");
  $('#mousse-cake-view').attr("href","gallery.html#filter/" +"{\"tags\":[\"mousse_cake\"]}");
  $('#all-cake-view').attr("href","gallery.html");
  
});

function Toggle_Menu() {
  if(menu==0){
    $('#menu ul').css({'display':'block'});
    menu=1;
  }
  else{
    $('#menu ul').css({'display':'none'});
    menu=0;
  }
} 